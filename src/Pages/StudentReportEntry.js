/********************Imports**************** */
import {Stack, Paper, Button, Typography, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
import { useParams } from "react-router";

/************************Variables***************/


/*********************Page******************* */
function StudentReportEntry()
{
    const {studentId} = useParams();

    return(<div className="background">
        <Paper className="entry-grid" elevation={2}>
            <Stack spacing={2}>
                <Typography>Name: Aryan Pathare</Typography>
                <Typography>School: Rustomjee International</Typography>
                <Typography>Std: 1st</Typography>
                <Typography>Div: A</Typography>

                <RadioGroup defaultValue={"1"} style={{flexDirection: "row"}}>
                    <FormControlLabel value="1" control={<Radio />} label="Semester 1" />
                    <FormControlLabel value="2" control={<Radio />} label="Semester 2" />
                </RadioGroup>

                <ReportGrid />

                <Button variant="contained" style={{alignSelf: "center", width: "50%"}}>Save</Button>
            </Stack>
        </Paper>
    </div>)
}

/*********************Components******************* */
function ReportGrid()
{
    const cols = [{field:"sbj", headerName: "Subject", flex: 2}, {field: "tw", headerName: "ORAL", flex:1, editable:true},{field: "pra", headerName: "PRA", flex:1, editable:true},
    {field: "ac", headerName: "ACVT", flex:1, editable:true}];
    const rows = [{id:1,sbj:"English",tw:20,pra:40,ac:18},{id:2,sbj:"Maths",tw:20,pra:40,ac:18},{id:3,sbj:"Science",tw:20,pra:40,ac:18}]
    
    return(<DataGrid rows={rows} columns={cols} pageSize={10} autoHeight />)
}

/********************Exports**************** */
export default StudentReportEntry;