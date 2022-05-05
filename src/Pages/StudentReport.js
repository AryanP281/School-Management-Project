
/********************Imports**************** */
import { RadioGroup, FormControlLabel, Radio, Paper, Typography, Stack, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { apiBaseUrl } from "../Config/AppConfig";

/************************Variables***************/
const studentReportApiUrl = `${apiBaseUrl}/student/report`
const viewReportApiUrl = `${apiBaseUrl}/pdf`;

/*********************Page******************* */
function StudentReport()
{
    const studentDetails = useSelector((state) => state.student);
    const [sem,setSem] = useState(1);
    const academicYear = useParams().year;
    const navigate = useNavigate();
    console.log(academicYear)
    
    return (<div className="background">
        <Paper className="sem-selector">
            <Stack spacing={3}>
                <Typography variant="h5">Select Semester</Typography>
                <RadioGroup defaultValue={"1"} style={{flexDirection: "row"}} onChange={(e) => setSem(e.target.value)}>
                    <FormControlLabel value="1" control={<Radio />} label="Semester 1" />
                    <FormControlLabel value="2" control={<Radio />} label="Semester 2" />
                </RadioGroup>
                <Button variant="contained" style={{marginTop: 40}} 
                onClick={() => getReportUrl(studentDetails, academicYear, sem, navigate)}>Get Report</Button>
            </Stack>
        </Paper>
    </div>)
}

/*********************Components******************* */


/*********************Functions******************* */
async function getReportUrl(studentDetails, year, sem, navigate)
{
    /*Gets the url for the student report */

    try
    {
        const resp = await fetch(`${studentReportApiUrl}?studentId=${studentDetails.studentId}&academicYear=${year}&semester=${sem}`,{
            method: "GET",
            headers: {
                "Authorization": localStorage.getItem("token")
            }
        });
        if(resp.status !== 200)
            throw new Error(resp.status);
        
        const data = await resp.json();
        if(!data.success)
        {
            switch(data.code)
            {
                case 1 : navigate("/school/login"); break;
            }
            return;
        }

        window.open(`${viewReportApiUrl}/${data.fileName}`);
    }
    catch(err)
    {
        console.log(err);
        alert("Failed to generate report. Try again !");
    }
}

/********************Exports**************** */
export default StudentReport;