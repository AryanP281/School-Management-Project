/************************Imports******************** */
import {Request, Response} from "express";
import { responseCodes } from "../Config/AppConfig";
import {dbPool} from "../Config/MariadbConfig";
import {PoolConnection} from "mariadb";
import pup from "puppeteer";
import hbs from "handlebars";
import fs from "fs";
import path, { resolve } from "path";

/************************Controllers******************** */
async function generateStudentReport(req:Request, resp:Response) : Promise<void>
{
    /*Generates student report pdf */

    if(!req.query.studentId || !req.query.academicYear || !req.query.semester)
    {
        console.log("Incorrect report query");
        resp.sendStatus(400);
        return;
    }

    try
    {
        const studentId : number = parseInt(req.query.studentId as string);
        const academicYear : number = parseInt(req.query.academicYear as string);
        const semester : number = parseInt(req.query.semester as string);

        //Loading student result
        const historyId : BigInt | undefined = ((await dbPool!.query("SELECT id FROM studenthistory WHERE studentId=? AND academicYear=?", [studentId, academicYear]))[0]).id;
        if(!historyId)
        {
            console.log("Incorrect studentId or academic Year");
            resp.sendStatus(400);
            return;
        }
        const resultDetails  = (await dbPool!.query("SELECT subjectId, subjectName,SUM(marksObtained) AS total, SUM(totalMarks) AS outOf, SUM(marksObtained) * 100 / SUM(totalMarks) AS percentage FROM result R JOIN subjectstructure S ON R.subjStructId=S.id JOIN subject J ON J.id=S.subjectId  WHERE R.historyId=? AND R.semester=? GROUP BY subjectId ORDER BY J.id;",[historyId,semester]))
        delete resultDetails["meta"];
        if(resultDetails.length === 0)
        {
            console.log("Incorrect studentId or academic Year");
            resp.sendStatus(400);
            return;
        }

        //Calculating grades
        const percentages : number[] = resultDetails.map((res : any) => res.percentage);
        const grades : string[] = getGrades(percentages);
        resultDetails.forEach((result:any,i:number) => result.grade = grades[i]);

        //Loading the template
        const templateHtml = await new Promise((resolve,reject) => {
            fs.readFile(path.resolve(__dirname, "../Templates/ReportTemplate.handlebars"), "utf-8", (err,data)=> {
                if(err)
                    reject(err);
                else
                    resolve(data);
            })
        });
        const template = hbs.compile(templateHtml);
        const html = template({results: resultDetails}); //Generating the template html

        //Creating the .html file
        await new Promise<void>((resolve,reject) => {
            fs.writeFile(path.resolve(__dirname, "../Templates/Test.html"), html, (err) => {
                if(err)
                    reject(err);
                else
                    resolve();
            })
        });

        //Initializing pdf options
        const pdfFileName : string = `${(new Date()).getTime()}.pdf`;
        const pdfOptions = {
            width: '1230px',
            headerTemplate: "<p></p>",
            footerTemplate: "<p></p>",
            displayHeaderFooter: false,
            margin: {
                top: "10px",
                bottom: "30px"
            },
            printBackground: true,
            path: `${path.resolve(__dirname, "../Static")}/${pdfFileName}`
        };

        //Using puppeteer to save template
        const browser = await pup.launch({
            args: ["--no-sandbox"],
            headless: true
        });
        const page = await browser.newPage();
        await page.goto(resolve(__dirname, "../Templates/Test.html"), {waitUntil: "networkidle0"});
        await page.pdf(pdfOptions);
        await browser.close();
        
        resp.status(200).json({success: true, fileName: pdfFileName});
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);
    }
}

/************************Functions******************** */
function getGrades(percentages : number[]) : string[] 
{
    /*Returns grades for the corresponding percentages */

    const gradePercentageMap : (string|number)[][] = [[0,"E2"],[21,"E1"],[31,"D"],[41,"C2"],[51,"C1"],[61,"B2"],[71,"B1"],[81,"A2"],[91,"A1"]];

    const grades : string[] = [];

    percentages.forEach((percent) => {
        let l = 0;
        let r = gradePercentageMap.length-1;
        let grade = -1;
        while(l <= r)
        {
            let m = Math.floor((l+r)/2);
            if(gradePercentageMap[m][0] < percent)
            {
                grade = m;
                l = m+1;
            }
            else if(gradePercentageMap[m][0] > percent)
                r = m-1;
            else
            {
                grade = m;
                break;
            }
        }
        
        grades.push(gradePercentageMap[grade][1] as string);
    })

    return grades;
}

async function getStudentScores(req:Request,resp:Response) : Promise<void>
{
    /*Returns the scores of the given student*/

    if(!req.params.id || !req.query.sem)
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
        const studentId : BigInt = BigInt(req.params.id);
        const semester : number = parseInt(req.query.sem as string); 

        //Getting student details
        let sqlQuery = "SELECT S.schoolId,H.std,H.id AS historyId FROM student S, studenthistory H WHERE S.id=? AND H.studentId=S.id AND H.academicYear=(SELECT MAX(J.academicYear) FROM studenthistory J WHERE J.studentId=?)";
        const studentDetails : any = (await dbPool.query(sqlQuery, [studentId,studentId]))[0];
        if(!studentDetails)
        {
            resp.sendStatus(400);
            return;
        }

        //Getting subjects and rubrics
        sqlQuery = "SELECT S.id AS subjectId,S.subjectName,R.id AS rubricId,R.rubricName, T.totalMarks FROM subjectstructure T, subject S, rubric R WHERE S.id=T.subjectId AND R.id=T.rubricId AND T.schoolId=? AND T.std=? ORDER BY S.id,R.id";
        const subjectDetails = (await dbPool.query(sqlQuery, [studentDetails.schoolId,studentDetails.std]));
        delete subjectDetails.meta;
        
        const scores : {subjectId:BigInt,subjectName:string,rubrics:{rubricId:BigInt,rubricName:string,score:number,maxScore:number}[]}[] = [];
        let currSubject : {subjectId:BigInt,subjectName:string,rubricId:BigInt,rubricName:string,totalMarks:number} = subjectDetails[0];
        scores.push({subjectId:currSubject.subjectId,subjectName:currSubject.subjectName,rubrics:[{rubricId:currSubject.rubricId,rubricName:currSubject.rubricName,score:0,maxScore:currSubject.totalMarks}]});
        for(let i = 1; i < subjectDetails.length; ++i)
        {
            currSubject = subjectDetails[i];
            if(currSubject.subjectId !== scores[scores.length-1].subjectId)
                scores.push({subjectId:currSubject.subjectId,subjectName:currSubject.subjectName,rubrics:[]});
            scores[scores.length-1].rubrics.push({rubricId:currSubject.rubricId,rubricName:currSubject.rubricName,score:0,maxScore:currSubject.totalMarks});
        }
        
        //Fetching student scores
        sqlQuery = "SELECT S.subjectId,S.rubricId,R.marksObtained FROM result R,subjectstructure S WHERE S.id=R.subjStructId AND historyId=? AND semester=? ORDER BY S.subjectId,S.rubricId;";
        const results = (await dbPool.query(sqlQuery, [studentDetails.historyId, semester]));
        delete results.meta;
        for(let i = 0, j = 0,k=0; i < results.length;)
        {
            if(scores[j].subjectId !== results[i].subjectId)
            {
                j++;
                k = 0;
                continue;
            }
            while(scores[j].rubrics[k].rubricId !== results[i].rubricId)
            {
                k++;
            }
            scores[j].rubrics[k].score = results[i].marksObtained;
            i++;
        }

        resp.status(200).json({success:true, scores});
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);
    }
}

async function editStudentScores(req : Request, resp : Response) : Promise<void>
{
    /*Edits the scores of the given student */

    if(!req.body.changes || !req.body.studentId)
    {
        resp.sendStatus(400);
        return;
    }
    
    if(!req.body.userDetails.isAdmin)
    {
        resp.sendStatus(403);
        return;
    }

    let dbConn : PoolConnection | null = null;
    try
    {
        //Getting connection from pool
        dbConn = await dbPool.getConnection();
        
        //Getting student history
        const studentHistory = (await dbConn!.query("SELECT H.id, H.std, S.schoolId FROM studenthistory H, student S WHERE H.studentId=S.id AND S.id=? AND H.academicYear=(SELECT MAX(J.academicYear) FROM studenthistory J WHERE J.studentId=?)", [req.body.studentId, req.body.studentId]))[0];
        if(!studentHistory)
        {
            resp.sendStatus(400);
            return;
        }

        let sqlQueryArray : string[] = ("SELECT id,subjectId,rubricId FROM subjectstructure WHERE schoolId=? AND std=? AND subjectId IN (").split(" ");
        let params : number[] = [studentHistory.schoolId, studentHistory.std];
        for(const [sem,semValue] of Object.entries(req.body.changes))
        {
            for(const [subject,subjectValue] of Object.entries(semValue as any))
            {
                sqlQueryArray.push("?");
                sqlQueryArray.push(",");
                params.push((subjectValue as any).subjectId);
            }
        }
        sqlQueryArray.pop();
        sqlQueryArray.push(") ORDER BY subjectId");
        const subjStructIds = (await dbConn!.query(sqlQueryArray.join(" "), params));
        delete subjStructIds["meta"];
        if(subjStructIds.length === 0)
        {
            resp.sendStatus(400);
            return;
        }
        
        const subjectRubricMap : any = {};
        let subjId : number = parseInt(subjStructIds[0].subjectId);
        subjectRubricMap[subjId] = {};
        subjectRubricMap[subjId][subjStructIds[0].rubricId] = subjStructIds[0].id;
        for(let i = 1; i < subjStructIds.length; ++i)
        {
            subjId = parseInt(subjStructIds[i].subjectId);
            if(subjStructIds[i].subjectId !== subjStructIds[i-1].subjectId)
                subjectRubricMap[subjId] = {};
            subjectRubricMap[subjId][subjStructIds[i].rubricId] = subjStructIds[i].id;
        }

        //Starting the transaction
        await dbConn!.beginTransaction()

        for(let i = 0; i < Object.keys(req.body.changes).length; ++i)
        {
            const sem = parseInt(Object.keys(req.body.changes)[i]);
            const semValue : any[] = req.body.changes[sem];
            for(let j = 0; j < semValue.length; ++j)
            {
                const subjId : number = parseInt(semValue[j].subjectId);
                for(const [rubric, rubricValue] of Object.entries(semValue[j].rubrics))
                {
                    await dbConn!.query("INSERT INTO result(historyId,subjStructId,semester,marksObtained) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE marksObtained=?", [studentHistory.id, subjectRubricMap[subjId][rubric], sem, rubricValue as number, rubricValue as number]); 
                }
            }
        }

        //Committing the transaction
        await dbConn!.commit();

        resp.status(200).json({success: true})
    }
    catch(err)
    {
        console.log(err);
        resp.sendStatus(500);

        //Rolling back
        await dbConn?.rollback();
    }
    finally
    {
        await dbConn?.release();
    }
}

/************************Exports******************** */
export {generateStudentReport, getStudentScores, editStudentScores};
