/********************Imports**************** */
import { useEffect, useState } from "react";
import {Paper,Stack,Autocomplete,TextField,Button,Dialog, DialogTitle, DialogContent, Checkbox, FormControlLabel, FormGroup, Snackbar, Typography} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import { apiBaseUrl, apiHeader } from "../Config/AppConfig";
import { useNavigate } from "react-router";
import {setSubjectDetails} from "../Redux/Slices/NewSubjectSlice";
import { useDispatch, useSelector } from "react-redux";

/********************Variables**************** */
const rubricListApiUrl = `${apiBaseUrl}/school/all/rubric`;

/********************Page**************** */
function SubjectRubric()
{
    const subjectDetails = useSelector((state) => state.newSubject);
    const dispatch = useDispatch();

    const [rubricList, setRubricList] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRubrics, setSelectedRubrics] = useState([]);
    console.log(selectedRubrics)

    useEffect(() => {
        getRubrics(setRubricList);
    }, [])
    
    //Initializing the rubric rows and columns
    const gridCols = [{field:"std", headerName: "STD", flex:1}];
    selectedRubrics.forEach((rubric) => {
        gridCols.push({field: rubric, headerName: rubric, flex:1, editable:true});
    });

    const gridRows = subjectDetails.stds.map((i) => {
        return {id:i, std: `${i}`}});
    
    return (<div className="background">
        <Paper className="entry-grid" elevation={2}>
            <Stack spacing={2}>
                <Typography variant="body1">School: {subjectDetails.schoolName}</Typography>
                <Typography variant="body1">Subject: {subjectDetails.subjectName}</Typography>
                <DataGrid rows={gridRows} columns={gridCols} pageSize={5} autoHeight/>
                <Button onClick={() => setOpenDialog(true)}>Add Rubric</Button>
                {openDialog && <RubricDialog openDialog={openDialog} setOpenDialog={setOpenDialog} dispatch={dispatch} 
                rubricList={rubricList} selectedRubrics={selectedRubrics} setSelectedRubrics={setSelectedRubrics} />}
            </Stack>
        </Paper>
    </div>);
}

/*********************Components******************* */
function RubricDialog({openDialog,setOpenDialog,dispatch, rubricList, selectedRubrics, setSelectedRubrics})
{
    const [rubric, setRubric] = useState("");
    
    const addRubric = () => {
        if(rubric.length)
        {
            const exists = selectedRubrics.filter((rb) => rb === rubric);
            if(!exists.length)
            {
                const newList = [...selectedRubrics];
                newList.push(rubric);
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


/********************Functions**************** */
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

/********************Exports**************** */
export default SubjectRubric;