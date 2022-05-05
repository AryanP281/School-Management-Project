/************************Imports******************** */
import {Request, Response} from "express";
import { responseCodes } from "../Config/AppConfig";
import {dbPool} from "../Config/MariadbConfig";
import {compareHash, generateToken, hash} from "../Services/Crypto";
import {PoolConnection} from "mariadb";

/************************Controllers******************** */
async function registerSchool(req:Request,resp:Response) : Promise<void>
{
    /*Registers a new school*/

    if(!req.body.userDetails.isAdmin)
    {
        resp.sendStatus(403);
        return;
    }

    try
    {
        const schoolDetails : {name:string,email:string,password:string} = req.body.schoolDetails;
        if(!schoolDetails.name || !schoolDetails.email || !schoolDetails.password || !schoolDetails.name.length|| !schoolDetails.email.length|| !schoolDetails.password.length)
        {
            resp.sendStatus(400);
            return;
        }

        //Checking if school is already registered
        const exists : BigInt = (await dbPool.query("SELECT COUNT(id) AS count FROM school WHERE schoolName=?", [schoolDetails.name]))[0]['count']
        if(exists !== BigInt(0))
        {
            resp.status(200).json({success: false, code: responseCodes.alreadyExists});
            return;
        }

        //Registering school
        await dbPool.query("INSERT INTO school(schoolName,loginEmail,password) VALUE (?,?,?)",[schoolDetails.name,schoolDetails.email,await hash(schoolDetails.password)]);

        resp.status(200).json({success:true});
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);
    }
}

async function loginSchool(req:Request,resp:Response) : Promise<void>
{
    /*Logins in a school*/

    try
    {
        const schoolCreds : {email:string,password:string} = req.body;
        if(!schoolCreds.email || !schoolCreds.password || !schoolCreds.email.length || !schoolCreds.password.length)
        {
            resp.sendStatus(400);
            return;
        }

        //Getting account password
        const accountDetails : {id:BigInt,password:string} = (await dbPool.query("SELECT id,password FROM school WHERE loginEmail=?",[schoolCreds.email]))[0];
        if(!accountDetails)
        {
            resp.status(200).json({success: false, code: responseCodes.doesntExist});
            return;
        }

        //Comparing passwords
        if(!(await compareHash(schoolCreds.password, accountDetails.password)))
        {
            resp.status(200).json({success:false, code:responseCodes.incorrectPassword});
            return;
        }

        //Generating token
        const token = generateToken({id:accountDetails.id.toString(), isAdmin:false});

        resp.status(200).json({success: true, token});
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);
    }
}

async function getAllSchools(req:Request,resp:Response) : Promise<void>
{
    /*Returns all schools*/

    if(!req.body.userDetails.isAdmin)
    {
        resp.sendStatus(403);
        return;
    }

    try
    {
        //Getting schools list
        const schools : {id : BigInt, schoolName : string}[] = (await dbPool.query("SELECT id,schoolName FROM school"));

        //Getting subjects
        const schoolDetails : {id : BigInt, schoolName : string, subjects: {id:number,name:string}[]}[] = [];
        for(let i = 0; i < schools.length; ++i)
        {
            schoolDetails.push({...schools[i], subjects:[]});
            schoolDetails[schoolDetails.length-1].subjects = await dbPool.query("SELECT UNIQUE S.id,subjectName AS name FROM subject S, subjectstructure WHERE schoolId=? AND S.id=subjectId ORDER BY S.id", [schools[i].id]);
        }

        resp.status(200).json({success:true, schools: schoolDetails});
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);
    }
}

async function addSubject(req:Request,resp:Response) : Promise<void>
{
    /*Adds a new subject to a school's std*/

    if(!req.body.userDetails.isAdmin)
    {
        resp.sendStatus(403);
        return;
    }

    const subjectDetails : {schoolId : number, subject: string, rubrics: {name:string, totalMarks:{std:number,mark:number}}[]} = req.body.subjectDetails;
    if(!subjectDetails)
    {
        resp.sendStatus(400);
        return;
    }

    let dbConn : PoolConnection | null = null;
    let transactionStarted = false;

    try
    {
        //Getting a database connection
        dbConn = await dbPool.getConnection();

        //Starting transaction
        transactionStarted = true;
        await dbConn!.beginTransaction();

        //Inserting the subject
        let subjId : {id:BigInt} | BigInt | undefined  = (await dbConn!.query("SELECT id FROM subject WHERE subjectName=?",[subjectDetails.subject]))[0];
        if(!subjId)
            subjId = (await dbConn!.query("INSERT INTO subject(subjectName) VALUE (?)",[subjectDetails.subject])).insertId;
        else
        {
            subjId = (subjId as {id:BigInt}).id;

            //Checking if subject already registered for school
            if((await dbConn!.query("SELECT COUNT(id) as count FROM subjectstructure WHERE schoolId=? AND subjectId=?",[subjectDetails.schoolId, subjId]))[0]['count'] !== BigInt(0))
            {
                resp.status(200).json({success:false, code: responseCodes.alreadyExists});
                return;
            }
        }

        //Inserting the rubrics
        let rubric : any = undefined;
        let rubricId : {id:BigInt} | BigInt | undefined;
        for(let i = 0; i < subjectDetails.rubrics.length; ++i)
        {
            rubric = subjectDetails.rubrics[i];

            rubricId = (await dbConn!.query("SELECT id FROM rubric WHERE rubricName=?", [rubric.name]))[0];
            if(!rubricId)
                rubricId = (await dbConn!.query("INSERT INTO rubric(rubricName) VALUE (?)",[rubric.name])).insertId;
            else
                rubricId = (rubricId as {id:BigInt}).id;

            //Adding rubric to subject structure
            const query = ["INSERT INTO subjectstructure(schoolId,subjectId,std,rubricId,totalMarks) VALUES "]
            rubric.totalMarks.forEach((markStruct : {std:number,mark:number}) => {
                query.push(`(${subjectDetails.schoolId},${subjId},${markStruct.std},${rubricId},${markStruct.mark})`);
                query.push(',');
            });
            query.pop();

            await dbConn!.query(query.join(''));
        }

        //Committing the transaction
        await dbConn!.commit();

        resp.status(200).json({success:true});
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);

        if(transactionStarted)
            await dbConn!.rollback();
    }
    finally
    {
       await dbConn?.release();
    }
}

async function editSubject(req:Request,resp:Response) : Promise<void>
{
    /*Adds a new subject to a school's std*/

    if(!req.body.userDetails.isAdmin)
    {
        resp.sendStatus(403);
        return;
    }

    const subjectDetails : {schoolId:number, subjectId:number, rubrics: {name:string, totalMarks:{std:number,mark:number}}[]} = req.body.subjectDetails;
    if(!subjectDetails)
    {
        resp.sendStatus(400);
        return;
    }

    let dbConn : PoolConnection | null = null;
    let transactionStarted = false;

    try
    {
        //Getting a database connection
        dbConn = await dbPool.getConnection();

        //Starting transaction
        transactionStarted = true;
        await dbConn!.beginTransaction();

        //Inserting the rubrics
        let rubric : any = undefined;
        let rubricId : {id:BigInt} | BigInt | undefined;
        for(let i = 0; i < subjectDetails.rubrics.length; ++i)
        {
            rubric = subjectDetails.rubrics[i];

            rubricId = (await dbConn!.query("SELECT id FROM rubric WHERE rubricName=?", [rubric.name]))[0];
            if(!rubricId)
                rubricId = (await dbConn!.query("INSERT INTO rubric(rubricName) VALUE (?)",[rubric.name])).insertId;
            else
                rubricId = (rubricId as {id:BigInt}).id;

            //Adding rubric to subject structure
            for(let j = 0; j < rubric.totalMarks.length; ++j)
            {
                await dbConn!.query("INSERT INTO subjectstructure(schoolId,subjectId,std,rubricId,totalMarks) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE totalMarks=?", 
                [subjectDetails.schoolId, subjectDetails.subjectId,rubric.totalMarks[j].std,rubricId,rubric.totalMarks[j].mark,rubric.totalMarks[j].mark]);
            }
        }

        //Committing the transaction
        await dbConn!.commit();

        resp.status(200).json({success:true});
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);

        if(transactionStarted)
            await dbConn!.rollback();
    }
    finally
    {
       await dbConn?.release();
    }
}

async function deleteSubject(req:Request,resp:Response) : Promise<void>
{
    /*Deletes a subject for the given school*/

    if(!req.body.subjectId || !req.body.schoolId)
    {
        resp.sendStatus(400);
        return;
    }

    if(!req.body.userDetails.isAdmin)
    {
        resp.sendStatus(403);
        return;
    }

    try 
    {
        const subjectId : number = parseInt(req.body.subjectId as string);
        const schoolId : number = parseInt(req.body.schoolId as string);

        //Deleting the subject structure
        await dbPool.query("DELETE FROM subjectstructure WHERE schoolId=? AND subjectId=?", [schoolId, subjectId]);
        
        resp.sendStatus(200);

        //Checking if any subject references remain. Deleting if no references left
        const referencesCount : BigInt = (await dbPool.query("SELECT COUNT(id) AS refCount FROM subjectstructure WHERE subjectId=?", [subjectId]))[0]["refCount"];
        if(referencesCount === BigInt(0))
            await dbPool.query("DELETE FROM subject WHERE id=?", [subjectId]);
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);
    }
}

async function getAllSubjects(req:Request,resp:Response) : Promise<void>
{
    /*Gets all subjects in database*/

    if(!req.body.userDetails.isAdmin)
    {
        resp.sendStatus(403);
        return;
    }

    try 
    {
        const subjects = await dbPool.query("SELECT * FROM subject");

        resp.status(200).json({success: true, subjects});
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);
    }
}

async function getAllRubrics(req:Request,resp:Response) : Promise<void>
{
    /*Gets all rubrics in database*/

    if(!req.body.userDetails.isAdmin)
    {
        resp.sendStatus(403);
        return;
    }

    try 
    {
        const rubrics = await dbPool.query("SELECT * FROM rubric");

        resp.status(200).json({success: true, rubrics});
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);
    }
}

async function getStudentsByStd(req:Request,resp:Response) : Promise<void>
{
    /*Returns all students enrolled in the given school*/

    if(!req.params.std || !req.query.year)
    {
        resp.sendStatus(400);
        return;
    }
 
    if(req.body.userDetails.isAdmin)
        req.body.schoolId = req.query.sid;
    else
        req.body.schoolId = req.body.userDetails.id;

    try
    {
        const schoolId : BigInt = BigInt(req.body.schoolId);
        const std : number = parseInt(req.params.std);
        const academicYear : number = parseInt(req.query.year as string);

        //Getting list of students enrolled in the school
        const sqlQuery : string = "SELECT S.id, S.firstName, S.middleName,S.lastName,H.studentDiv,H.rollNo FROM student S JOIN studenthistory H ON S.id=H.studentId WHERE S.schoolId=? AND academicYear=? AND H.std=? ORDER BY H.studentDiv";
        const studentDetails : any = await dbPool!.query(sqlQuery, [schoolId, academicYear, std]);
        delete studentDetails.meta;
        
        //Generating the response
        const studentList : {div:string, students:{id:BigInt,name:string,rollNo:number}[]}[] = [];
        if(studentDetails.length)
            studentList.push({div:studentDetails[0].studentDiv, students:[{id:studentDetails[0].id,name:`${studentDetails[0].firstName} ${studentDetails[0].middleName} ${studentDetails[0].lastName}`, rollNo: studentDetails[0].rollNo}]});
        for(let i = 1; i < studentDetails.length; ++i)
        {
            if(studentDetails[i].studentDiv != studentDetails[i-1].studentDiv)
                studentList.push({div:studentDetails[i].studentDiv, students:[]});
            studentList[studentList.length-1].students.push({id:studentDetails[i].id,name:`${studentDetails[i].firstName} ${studentDetails[i].middleName} ${studentDetails[i].lastName}`, rollNo: studentDetails[i].rollNo})
        }

        resp.status(200).json({success:true, studentList});
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);
    }
}

async function getSubjectRubrics(req:Request,resp:Response) : Promise<void>
{
    /*Gets rubrics associated with the subject*/

    if(!req.query.subjectId || !req.query.schoolId)
    {
        resp.sendStatus(400);
        return;
    }

    if(!req.body.userDetails.isAdmin)
    {
        resp.sendStatus(403);
        return;
    }

    try 
    {
        const subjectId : number = parseInt(req.query.subjectId as string);
        const schoolId : number = parseInt(req.query.schoolId as string);
        const std : number = parseInt(req.query.std as string);

        //Getting the rubrics
        const subjectDetails = await dbPool.query("SELECT R.id,R.rubricName,S.totalMarks,S.std FROM subjectstructure S, rubric R WHERE R.id=S.rubricId AND S.schoolId=? AND S.subjectId=? ORDER BY S.std", [schoolId, subjectId]);
        delete subjectDetails["meta"];
        if(!subjectDetails || subjectDetails.length == 0)
        {
            resp.sendStatus(400);
            return;
        }

        const subjectRubrics : {std:number, rubrics: {rubricId:number,rubricName:string,totalMarks:number}[]}[] = [];
        subjectRubrics.push({std: subjectDetails[0].std, rubrics: [{rubricId:subjectDetails[0].id, rubricName:subjectDetails[0].rubricName, totalMarks:subjectDetails[0].totalMarks}]});
        for(let i = 1; i < subjectDetails.length; ++i)
        {
            if(subjectDetails[i].std !== subjectDetails[i-1].std)
                subjectRubrics.push({std: subjectDetails[i].std, rubrics: []});
            subjectRubrics[subjectRubrics.length-1].rubrics.push({rubricId:subjectDetails[i].id, rubricName:subjectDetails[i].rubricName, totalMarks:subjectDetails[i].totalMarks})
        }
        
        resp.status(200).json({success:true, subjectRubrics});
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);
    }
}

/************************Exports******************** */
export {registerSchool, loginSchool, getAllSchools, addSubject, getAllSubjects, getAllRubrics, getStudentsByStd, 
    getSubjectRubrics, editSubject, deleteSubject};



