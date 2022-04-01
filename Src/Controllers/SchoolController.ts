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

async function getAllSubjects(req:Request,resp:Response) : Promise<void>
{
    /*Gets all subjects in database*/
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

/************************Exports******************** */
export {registerSchool, loginSchool, getAllSchools, addSubject, getAllSubjects, getAllRubrics};



