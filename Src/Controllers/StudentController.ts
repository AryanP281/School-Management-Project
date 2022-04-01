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

    if(!req.query.studentId && !req.query.academicYear && !req.query.semester)
    {
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
            resp.sendStatus(400);
            return;
        }
        const resultDetails  = (await dbPool!.query("SELECT subjectId, subjectName,SUM(marksObtained) AS total, SUM(totalMarks) AS outOf, SUM(marksObtained) * 100 / SUM(totalMarks) AS percentage FROM result R JOIN subjectstructure S ON R.subjStructId=S.id JOIN subject J ON J.id=S.subjectId  WHERE R.historyId=? AND R.semester=? GROUP BY subjectId ORDER BY subjectName;",[historyId,semester]))
        delete resultDetails["meta"];

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

/************************Exports******************** */
export {generateStudentReport};