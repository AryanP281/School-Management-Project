/********************Imports**************** */
import {Stack, Paper, Button, Typography, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {useSelector} from "react-redux";
import {apiBaseUrl} from "../Config/AppConfig";

/************************Variables***************/
const getStudentScoresApiUrl = `${apiBaseUrl}/student/scores`;
const saveScoresApiUrl = `${apiBaseUrl}/student/edit/scores`;
let scoreChangesBuffer = {}; //Buffer to keep track of the changes to the scores
let changeSaveInterval = null; //The timer used to periodically save changes
const saveFrequency = 60000; //The save time interval in ms

/*********************Page******************* */
function StudentReportEntry()
{
    const studentDetails = useSelector((state) => state.student);
    const [studentScores,setStudentScores] = useState({});
    const [semester, setSemester] = useState(1);
    const [saving, setSaving] = useState(false);
    const [refresh,setRefresh] = useState(false);
    const navigate = useNavigate();
    //console.log(studentScores)

    useEffect(() => {
        //Scheduling save jobs
        changeSaveInterval = setInterval(() => saveChanges(studentDetails.studentId, saving, setSaving, navigate), saveFrequency);
        
        return () => {clearInterval(changeSaveInterval)};
    }, []);

    useEffect(() => {
        if(!studentScores[semester])
            loadStudentScores(studentDetails.studentId, semester, studentScores,setStudentScores, navigate);
    }, [semester]);


    return(<div className="background">
        <Paper className="entry-grid" elevation={2}>
            <Stack spacing={2}>
                <Typography>Name: {studentDetails.studentName}</Typography>
                <Typography>School: {studentDetails.schoolName}</Typography>
                <Typography>Std: {studentDetails.studentStd}</Typography>
                <Typography>Div: {studentDetails.studentDiv}</Typography>

                <RadioGroup defaultValue={"1"} style={{flexDirection: "row"}} onChange={(e) => setSemester(e.target.value)}>
                    <FormControlLabel value="1" control={<Radio />} label="Semester 1" />
                    <FormControlLabel value="2" control={<Radio />} label="Semester 2" />
                </RadioGroup>

                {studentScores[semester] && <ReportGrid semester={semester} studentScores={studentScores} 
                setStudentScores={setStudentScores} refresh={refresh} setRefresh={setRefresh}/>}

                <Button variant="contained" disabled={saving} style={{alignSelf: "center", width: "50%"}}
                onClick={() => saveChanges(studentDetails.studentId, saving, setSaving, navigate)}>Save</Button>
            </Stack>
        </Paper>
    </div>)
}

/*********************Components******************* */
function ReportGrid({semester, studentScores, setStudentScores, refresh, setRefresh})
{
    
    //Generating cols
    const rubricSet = new Map();
    const scores = studentScores[semester];
    scores.forEach((subj) => subj.rubrics.forEach((rub) => rubricSet.set(rub.rubricId, rub.rubricName)));
    const cols = [{field:"sbj", headerName: "Subject", flex: 2}];
    for(const [key,value] of rubricSet.entries())
    {
        cols.push({field: key.toString(), headerName: value, flex: 1, editable: true});
    }
    
    //Generating rows
    const rows = [];
    scores.forEach((subj)=>{
        const newRow = {id:subj.subjectId, sbj:subj.subjectName};
        subj.rubrics.forEach((rubric) => {
            newRow[rubric.rubricId.toString()] = rubric.score;
        })
        rows.push(newRow);
    });
    
    return(<DataGrid rows={rows} columns={cols} pageSize={10} autoHeight 
        onCellEditCommit={(e) => editScore({id:e.id, field: e.field, oldValue: e.row[e.field] ,newValue:parseInt(e.value)}, 
        semester, studentScores, setStudentScores,refresh,setRefresh)}/>)
}

/*********************Functions******************* */
async function loadStudentScores(studentId, semester,studentScores,setStudentScores,navigate)
{
    /*Loads the student scores*/

    try
    {
        const resp = await fetch(`${getStudentScoresApiUrl}/${studentId}?sem=${semester}`, {
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
                case 1 : navigate("/admin/login"); break;
            }
        }

        const updatedScores = {...studentScores};
        updatedScores[semester] = data.scores;
        setStudentScores(updatedScores);
    }
    catch(err)
    {
        console.log(err);
        alert("Failed to load student scores");
    }  

}

async function saveChanges(studentId, saving, setSaving, navigate)
{
    /*Saves the report changes from buffer*/

    //Checking if any changes are to be made
    if(Object.keys(scoreChangesBuffer).length === 0 || saving)
    {
        return;
    }

    //Setting save lock
    setSaving(true);

    //Creating the request payload
    const changes = {};
    for (const [sem,semValue] of Object.entries(scoreChangesBuffer))
    {
        changes[sem] = [];
        for(const [subj,subjValue] of Object.entries(semValue))
        {
            const rubricChanges = {};
            for(const [rubric, rubricValue] of Object.entries(subjValue)) 
            {
                rubricChanges[rubric] = rubricValue;
            }
            changes[sem].push({subjectId: subj, rubrics: rubricChanges});
        }
    }

    try
    {
        console.log(changes);
        const resp = await fetch(saveScoresApiUrl, {
            method: "POST",
            headers: {
                "Authorization": localStorage.getItem("token"),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({studentId, changes: changes})
        });

        if(resp.status !== 200)
            throw new Error(resp.status);

        const data = await resp.json();
        if(!data.success)
        {
            switch(data.code)
            {
                case 1 : navigate("/admin/login"); break; 
            }
        }

        //Clearing changes buffer
        scoreChangesBuffer = {};
    }
    catch(err) 
    {
        console.log(err);
        console.log("Failed to save changes");
    } 
    finally
    {
        setSaving(false);
    }  
}

function editScore(row, semester, studentScores, setStudentScores,refresh,setRefresh)
{
    /*Adds the change to scores to the buffer */

    //Checking if the new score is a number
    try
    {
        row.field = parseInt(row.field);
    
        //Checking if new score is in range
        if(row.newValue < 0 || row.newValue > ((studentScores[semester].find((e) => e.subjectId === row.id)).rubrics.find((e) => e.rubricId === row.field)).maxScore)
        {
            console.log("Overflow")
            setRefresh(!refresh);
            return;
        }

        //Adding the change to buffer
        if(row.oldValue !== row.newValue)
        {
            if(!scoreChangesBuffer[semester])
                scoreChangesBuffer[semester] = {};
            if(!scoreChangesBuffer[semester][row.id])
                scoreChangesBuffer[semester][row.id] = {};
            scoreChangesBuffer[semester][row.id][row.field] = row.newValue;
        }

        //Updating the student scores
        const updatedScores = {...studentScores};
        for(let i = 0; i < updatedScores[semester].length; i++)
        {
            if(updatedScores[semester][i].subjectId === row.id)
            {
                for(let j = 0; j < updatedScores[semester][i].rubrics.length; ++j)
                {
                    if(updatedScores[semester][i].rubrics[j].rubricId === row.field)
                    {
                        updatedScores[semester][i].rubrics[j].score = row.newValue;
                        break;
                    }
                }
                break;
            }
        }
        setStudentScores(updatedScores);
    }
    catch(err)
    {
        setRefresh(!refresh);
        return;
    }
}

/********************Exports**************** */
export default StudentReportEntry;