
/********************Imports**************** */
import { Autocomplete,TextField,Stack, Paper, Button } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router";

/************************Variables***************/
const schoolsList = [{label: "School 1", id:1},{label: "School 2", id:2},{label: "School 3", id:3},{label: "School 4", id:4}];
const stds = [{label: "1st", id:1},{label: "2nd", id:2},{label: "3rd", id:3},{label: "4th", id:4},{label: "5th", id:5}];
const divs = [{label: "A", id:1},{label: "B", id:2},{label: "C", id:3}];
const rollNos = [];
for(let i = 1; i <= 60; ++i)
{
    rollNos.push({label: `Roll No ${i}`, id: i});
}

/*********************Page******************* */
function ReportStudentSelection()
{
    const [schoolId, setSchoolId] = useState(undefined);
    const [studentStd, setStudentStd] = useState(undefined);
    const [studentDiv, setStudentDiv] = useState(undefined);
    const navigate = useNavigate();

    return(<div className="background">
            <Paper className="entry-grid" elevation={2}>
                <Stack spacing={4}>
                <Autocomplete disablePortal options={schoolsList} 
                renderInput={(params) => <TextField {...params} label="School" />} 
                isOptionEqualToValue={(option,value) => option.id === value.id}
                onChange={(event, newVal) => setSchoolId(newVal.id)}
                style={{flexBasis: "66%"}}
                />
                <Stack direction="row" spacing={1}>
                    <Autocomplete disablePortal options={stds} disabled={schoolId === undefined}
                    renderInput={(params) => <TextField {...params} label="Std" />} style={{flexGrow: 1}}
                    onChange={(event,val) => setStudentStd(val.id)}/>
                    <Autocomplete disablePortal options={divs} disabled={schoolId === undefined}
                    renderInput={(params) => <TextField {...params} label="Div" />} style={{flexGrow: 1}} 
                    onChange={(event,val) => setStudentDiv(val.id)}
                    />
                </Stack>
                <Autocomplete disablePortal options={rollNos} 
                renderInput={(params) => <TextField {...params} label="Roll No" />} style={{flexGrow: 1}} />
                <Button variant="contained" style={{width: "50%", alignSelf: "center"}} color="primary" size="large"
                onClick={() => navigate("/report/student/1")}
                >Select Student</Button>
            </Stack>
            </Paper>
        </div>)
}

/*********************Functions******************* */

/********************Exports**************** */
export default ReportStudentSelection;