/********************Imports**************** */
import { useEffect, useState } from "react";
import {Paper,Stack,Autocomplete,TextField,Button,Dialog, DialogTitle, DialogContent, Checkbox, FormControlLabel, FormGroup, Snackbar, Typography, CircularProgress} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import { apiBaseUrl, apiHeader } from "../Config/AppConfig";
import { useNavigate } from "react-router";
import {resetSubjectDetails, setSubjectStds} from "../Redux/Slices/NewSubjectSlice";
import { useDispatch, useSelector } from "react-redux";

/********************Variables**************** */
const rubricListApiUrl = `${apiBaseUrl}/school/all/rubric`;
const subjectRubricsApiUrl = `${apiBaseUrl}/school/subject/rubric`;
const saveSubjectApiUrl = `${apiBaseUrl}/school/add/subject`;
const saveSubjectChangesApiUrl = `${apiBaseUrl}/school/edit/subject`;

/********************Page**************** */
function SubjectRubric()
{
    const subjectDetails = useSelector((state) => state.newSubject);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [rubricList, setRubricList] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRubrics, setSelectedRubrics] = useState([]);
    const [openLoadingDialog, setOpenLoadingDialog] = useState(false);

    useEffect(() => {
        getRubrics(setRubricList);
        if(subjectDetails.subjectId)
            loadSubjectRubrics(subjectDetails, setSelectedRubrics, dispatch);
    }, [])
    
    //Initializing the rubric rows and columns
    const gridCols = [{field:"std", headerName: "STD", flex:1}];
    const gridRows = [];
    selectedRubrics.forEach((rubric) => {
        gridCols.push({field: rubric.name, headerName: rubric.name, flex:1, editable:true, type: "number", headerAlign:"center"});
    });
    let row = null;
    if(subjectDetails.stds)
    {
        subjectDetails.stds.map((std, i) => {
            row = {id: std, std};
            selectedRubrics.forEach((rubric) => {
                row[rubric.name] = rubric.totalMarks[i].mark;
            });
            gridRows.push(row)
        });
    }

    //Editing cell values
    const editRubricValue = (row) => {
        const newRubric = [...selectedRubrics];
        for(let i = 0; i < newRubric.length; ++i)
        {
            if(newRubric[i].name === row.field)
            {
                for(let j = 0; j < newRubric[i].totalMarks.length; ++j)
                {
                    if(newRubric[i].totalMarks[j].std === row.id)
                    {
                        newRubric[i].totalMarks[j].mark = row.value;
                    }
                }
            }
        }
        
        setSelectedRubrics(newRubric);
    };
    
    return (<div className="background">
        <Paper className="entry-grid" elevation={2}>
            <Stack spacing={2}>
                <Typography variant="body1">School: {subjectDetails.schoolName}</Typography>
                <Typography variant="body1">Subject: {subjectDetails.subjectName}</Typography>
                <DataGrid rows={gridRows} columns={gridCols} pageSize={3} autoHeight
                onCellEditCommit={editRubricValue}/>
                <Button onClick={() => setOpenDialog(true)}>Add Rubric</Button>
                <Button variant="contained" style={{marginTop: 40}}
                onClick={() => {
                    if(!subjectDetails.subjectId)
                        saveSubject(selectedRubrics, subjectDetails, setOpenLoadingDialog, navigate, dispatch);
                    else
                        saveSubjectChanges(selectedRubrics, subjectDetails, setOpenLoadingDialog, navigate, dispatch);
                }}
                >Save Subject</Button>
                {openDialog && <RubricDialog openDialog={openDialog} setOpenDialog={setOpenDialog} stds={subjectDetails.stds} 
                rubricList={rubricList} selectedRubrics={selectedRubrics} setSelectedRubrics={setSelectedRubrics} />}
                {openLoadingDialog && <LoadingDialog />}
            </Stack>
        </Paper>
    </div>);
}

/*********************Components******************* */
function RubricDialog({openDialog,setOpenDialog,stds, rubricList, selectedRubrics, setSelectedRubrics})
{
    const [rubric, setRubric] = useState("");
    
    const addRubric = () => {
        if(rubric.length)
        {
            const exists = selectedRubrics.filter((rb) => rb.name === rubric);
            if(!exists.length)
            {
                const newList = [...selectedRubrics];
                newList.push({name: rubric, totalMarks: stds.map((v) => {return {std:v, mark:0}})});
                setSelectedRubrics(newList);
                setOpenDialog(false);
            }
        }
    };

    return (
        <Dialog maxWidth="md" fullWidth open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>New Rubric</DialogTitle>
            <DialogContent className="subject-entry">
                <Stack spacing={8}>
                    <Autocomplete disablePortal freeSolo options={rubricList}
                    renderInput={(params) => <TextField {...params} label="Subject"/>}
                    onChange={(e,newVal) => setRubric(newVal.label)}
                    onInputChange={(e,newVal) => setRubric(newVal)}
                    />

                    <Button variant="contained" onClick={() => addRubric()} >Add Rubric</Button>
                </Stack>
            </DialogContent>
        </Dialog>
    )
}

function LoadingDialog()
{
    return (
        <Dialog maxWidth="sm" fullWidth>
            <DialogTitle>Saving Subject</DialogTitle>
            <DialogContent>
                <CircularProgress />
            </DialogContent>
        </Dialog>
    );
}

/********************Functions**************** */
async function loadSubjectRubrics(subjectDetails,setSelectedRubrics, dispatch)
{
    /*Gets list of the rubrics associated with the subject and their values */

    try
    {
        const resp = await fetch(`${subjectRubricsApiUrl}?schoolId=${subjectDetails.schoolId}&subjectId=${subjectDetails.subjectId}`, {
            method: "GET",
            headers: apiHeader()
        });
        if(resp.status !== 200)
            throw new Error(resp.status);

        const data = await resp.json();

        const stds = data.subjectRubrics.map((entry) => entry.std);
        const rubricData = {};
        stds.forEach((std, i) => {
            data.subjectRubrics[i].rubrics.forEach((rb) => {
                if(!rubricData[rb.rubricId])
                    rubricData[rb.rubricId] = {name:rb.rubricName, totalMarks:[]};
                rubricData[rb.rubricId].totalMarks.push({std:stds[i],mark:rb.totalMarks});
            })
        });

        const selectedRubrics = [];
        for(const [rubric,rubricValue] of Object.entries(rubricData))
        {
            selectedRubrics.push({name: rubricValue.name, totalMarks: rubricValue.totalMarks});
        }

        dispatch(setSubjectStds({stds:stds}));
        setSelectedRubrics(selectedRubrics);
    }
    catch(err)
    {
        console.log(err);
        //setToastError("Failed to load. Try again");
        //setTimeout(() => setToastError(null), 2000);
    }
}

async function getRubrics(setRubricList)
{
    /*Gets list of all rubrics */

    try
    {
        const resp = await fetch(rubricListApiUrl, {
            method: "GET",
            headers: apiHeader()
        });
        if(resp.status !== 200)
            throw new Error(resp.status);

        const data = await resp.json();

        const rubricList = []
        data.rubrics.forEach((rubric) => {
            rubricList.push({id: rubric.id, label: rubric.rubricName});
        })
        setRubricList(rubricList);
    }
    catch(err)
    {
        console.log(err);
        //setToastError("Failed to load. Try again");
        //setTimeout(() => setToastError(null), 2000);
    }
}

async function saveSubject(selectedRubrics, subjectDetails, setOpenLoadingDialog, navigate, dispatch)
{
    /*Saves the subject to the backend*/
    
    setOpenLoadingDialog(true);
    const subject = {schoolId: subjectDetails.schoolId, subject: subjectDetails.subjectName, rubrics: selectedRubrics};

    try
    {
        const resp = await fetch(saveSubjectApiUrl, {
            method: "PUT",
            headers: {
                "Authorization" : localStorage.getItem("token"),
                "Content-Type": "application/json"   
            },
            body: JSON.stringify({subjectDetails:subject})
        });

        if(resp.status !== 200)
            throw Error(resp.status);

        setOpenLoadingDialog(false);
        dispatch(resetSubjectDetails());
        navigate("/admin/school/subject", {replace: true});
    }
    catch(err)
    {
        console.log(err);
        alert("Failed to save subject. Try again");
    }
}

async function saveSubjectChanges(selectedRubrics, subjectDetails, setOpenLoadingDialog, navigate, dispatch)
{
    /*Saves the subject to the backend*/
    
    setOpenLoadingDialog(true);
    const subject = {subjectId:subjectDetails.subjectId, schoolId: subjectDetails.schoolId, subject: subjectDetails.subjectName, rubrics: selectedRubrics};

    try
    {
        const resp = await fetch(saveSubjectChangesApiUrl, {
            method: "PUT",
            headers: {
                "Authorization" : localStorage.getItem("token"),
                "Content-Type": "application/json"   
            },
            body: JSON.stringify({subjectDetails:subject})
        });

        if(resp.status !== 200)
            throw Error(resp.status);

        setOpenLoadingDialog(false);
        dispatch(resetSubjectDetails());
        navigate("/admin/school/subject", {replace: true});
    }
    catch(err)
    {
        console.log(err);
        alert("Failed to save subject. Try again");
    }
}

/********************Exports**************** */
export default SubjectRubric;