/********************Imports**************** */
import { useEffect, useState } from "react";
import {Paper,Stack,Autocomplete,TextField,Button,Dialog, DialogTitle, DialogContent, Checkbox, FormControlLabel, FormGroup, Snackbar} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import { apiBaseUrl, apiHeader } from "../Config/AppConfig";
import { useNavigate } from "react-router";
import {setSubjectDetails} from "../Redux/Slices/NewSubjectSlice";
import { useDispatch } from "react-redux";

/********************Variables**************** */
const schoolListApiUrl = `${apiBaseUrl}/school/all/school`;
const subjectListApiUrl = `${apiBaseUrl}/school/all/subject`;
const stdList = [];

//Initializing std list
for(let i = 1; i <= 10; ++i)
{
    stdList.push({id:i, label: `STD ${i}`});
}

/********************Page**************** */
function SubjectManagement()
{
    const [schoolList, setSchoolList] = useState([]);
    const [subjList, setSubjList] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [toastError, setToastError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if(localStorage.getItem("token"))
            getSchools(setSchoolList, setToastError, setSubjList);
        else
            navigate("/login", {replace: true});
    }, []);

    useEffect(() => {
        if(openDialog && !subjList.length)
            getSubjects(setSubjList, setToastError);
    }, [openDialog])
    
    //Generating the subject table rows and columns
    const subjectCols = [{field: "sub", headerName: "Subject", flex:1}, 
    {field: "btn", headerName: "Edit Rubric", flex:1, renderCell: (vals) => {
        return(<Button>Edit</Button>)
    }}];
    const schoolSubjects = [];
    let schoolName = "";
    if(selectedSchool)
    {
        let school = undefined;
        for(let i = 0; i < schoolList.length; ++i)
        {
            if(schoolList[i].id === selectedSchool)
            {
                school = schoolList[i];
                break;
            }
        }

        school.subjects.forEach((subj) => {
            schoolSubjects.push({id: subj.id, sub: subj.name});
        });

        schoolName = school.label;
    }
    
    return (
        <div className="background">
            <Paper className="entry-grid" elevation={2}>
                <Stack spacing={4}>
                    <Autocomplete disablePortal options={schoolList}
                    renderInput={(params) => <TextField {...params} label="School" />} 
                    isOptionEqualToValue={(option,value) => option.id === value.id}
                    onChange={(e,newVal) => setSelectedSchool(newVal.id)}
                    style={{flexBasis: "66%"}}
                    />
                    <DataGrid rows={schoolSubjects} columns={subjectCols} pageSize={5} autoHeight/>
                    <Button variant="filled" onClick={() => setOpenDialog(true)} disabled={!selectedSchool}>Add new subject</Button>
                </Stack>
                <SubjectDialog subjList={subjList} openDialog={openDialog} setOpenDialog={setOpenDialog} 
                schoolId={selectedSchool} dispatch={dispatch} navigate={navigate} schoolName={schoolName}/>
            </Paper>
            <Snackbar anchorOrigin={{vertical : "top", horizontal: "center"}} open={toastError} message={toastError}/>
        </div>
    );
}


/*********************Components******************* */
function SubjectDialog({subjList,openDialog,setOpenDialog,schoolId,dispatch, navigate, schoolName})
{
    const [subjectName, setSubjectName] = useState("");
    const [checkedStds, setCheckedStds] = useState([false,false,false,false,false,false,false,false,false,false])

    const getStdsCheckbox = () => {
        const checkBoxes = [];
        for(let i = 1; i <= 10; ++i)
        {
            checkBoxes.push(<FormControlLabel name={i} key={i} control={<Checkbox onChange={(e) => {
              const newChecked = [...checkedStds];
              newChecked[e.target.name-1] = !newChecked[e.target.name-1];
              setCheckedStds(newChecked);   
            }}/>} label={`STD ${i}`}/>);
        }

        return checkBoxes;
    };
    
    return (
        <Dialog maxWidth="md" fullWidth open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>New Subject</DialogTitle>
            <DialogContent className="subject-entry">
                <Stack spacing={2}>
                    <Autocomplete disablePortal freeSolo options={subjList}
                    renderInput={(params) => <TextField {...params} label="Subject"/>}
                    onChange={(e,newVal) => setSubjectName(newVal.label)}
                    onInputChange={(e,newVal) => setSubjectName(newVal)}
                    />
                    <FormGroup style={{flexDirection: "row"}}>
                        {getStdsCheckbox()}
                    </FormGroup>

                    <Button variant="contained" onClick={() => {
                        createSubject(schoolId, schoolName,subjectName, checkedStds, dispatch);
                        navigate("/school/subject/rubric");
                    }}>Add Rubric</Button>
                </Stack>
            </DialogContent>
        </Dialog>
    )
}


/********************Functions**************** */
async function getSchools(setSchoolList, setToastError)
{
    /*Gets list of all schools */

    try
    {
        const resp = await fetch(schoolListApiUrl, {
            method: "GET",
            headers: apiHeader()
        });
        if(resp.status !== 200)
            throw new Error(resp.status);

        const data = await resp.json();

        const schoolList = []
        data.schools.forEach((school) => {
            schoolList.push({id: school.id, label: school.schoolName, subjects: school.subjects});
        })
        setSchoolList(schoolList);


    }
    catch(err)
    {
        console.log(err);
        setToastError("Failed to load. Try again");
        setTimeout(() => setToastError(null), 2000);
    }
}

async function getSubjects(setSubjList, setToastError)
{
    /*Gets list of all subjects */

    try
    {
        const resp = await fetch(subjectListApiUrl, {
            method: "GET",
            headers: apiHeader()
        });
        if(resp.status !== 200)
            throw new Error(resp.status);

        const data = await resp.json();

        const subjList = [];
        data.subjects.forEach((subj) => {
            subjList.push({id:subj.id, label: subj.subjectName});
        })
        setSubjList(subjList);
    }
    catch(err)
    {
        console.log(err);
        setToastError("Failed to load. Try again");
        setTimeout(() => setToastError(null), 2000);
    }
}

function createSubject(schoolId, schoolName, subjectName, selectedStds, dispatch)
{
    /*Adds the subject to redux */

    const stds = [];
    selectedStds.forEach((status, std) => {
        if(status)
            stds.push(std+1);
    });

    dispatch(setSubjectDetails({schoolId, schoolName, subjectName, stds}));
}

/********************Exports**************** */
export default SubjectManagement;

/*
<Autocomplete disablePortal options={stdList}
                    renderInput={(params) => <TextField {...params} label="Std" />} 
                    isOptionEqualToValue={(option,value) => option.id === value.id}
                    onChange={(e,newVal) => setSelectedSchool(newVal.id)}
                    style={{flexBasis: "66%"}}
                    />
*/