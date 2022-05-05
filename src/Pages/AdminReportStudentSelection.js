
/********************Imports**************** */
import { Autocomplete,TextField,Stack, Paper, Button,CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { apiBaseUrl } from "../Config/AppConfig";
import { setStudentDetails } from "../Redux/Slices/StudentSlice";
import SecondaryActionBar from "../Components/SecondaryActionBar";
import { LoadingScreen } from "./SchoolStudentSelection";

/************************Variables***************/
const loadStudentLisApitUrl = `${apiBaseUrl}/school/all/students/std`;
const schoolListApiUrl = `${apiBaseUrl}/school/all/school`;
const stds = [];
for(let i = 1; i <= 10; ++i)
{
    stds.push({label:`${i}`, id:i});
}
const academicYearRegexPattern = /^\d\d\d\d$/; //The regex pattern for checking entered academic year

/*********************Page******************* */
function AdminReportStudentSelection()
{
    const [schoolList, setSchoolList] = useState([]);
    const [selectedSchool,setSelectedSchool] = useState(null);
    const [academicYear, setAcademicYear] = useState(undefined);
    const [studentStd, setStudentStd] = useState(undefined);
    const [studentList, setStudentList] = useState({});
    const [studentDiv, setStudentDiv] = useState(undefined);
    const [selectedStudent, setSelectedStudent] = useState({});
    const [rollNos, setRollNos] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    //Checking if logged in
    if(!localStorage.getItem("token"))
        navigate("/school/login", {replace: true});

    //Loading school list
    useEffect(() => {
        if(localStorage.getItem("token"))
            loadSchoolList(setSchoolList, setLoadingData);
    },[]);

    //Loading std wise student list
    useEffect(() => {
        //Loading the list of students in given std
        if(studentStd && academicYear && (!studentList[academicYear] || !studentList[academicYear][studentStd]))
            loadStdStudents(selectedSchool,academicYear, studentStd, studentList, setStudentList, setLoadingData);
    }, [studentStd, academicYear]);

    //Creating division and rollno lists
    let divs = [];
    if(academicYear && studentList[academicYear] && studentList[academicYear][studentStd])
    {
        divs = studentList[academicYear][studentStd].map((div,index) => {return {label: div.div, id:index}});
    }
    useEffect(() => {
        if(academicYear && studentList[academicYear] && studentList[academicYear][studentStd])
        {
            let newRollNos = [];
            studentList[academicYear][studentStd][studentDiv].students.forEach((student) => newRollNos.push({label:`${student.rollNo}`, id: student.id}));
            newRollNos = newRollNos.sort((a,b) => {
                const roll1 = parseInt(a.label);
                const roll2 = parseInt(b.label);
                if(roll1 < roll2)
                    return -1;
                else if(roll1 > roll2)
                    return 1;
                return 0;
            });
            setRollNos(newRollNos);
        }
    }, [studentDiv])

    return(<div className="background-bar">
            <SecondaryActionBar homeAddr="/home/admin"/>
            <Paper className="entry-grid" elevation={2}>
                <Stack spacing={4}>
                <Autocomplete disablePortal options={schoolList}
                    renderInput={(params) => <TextField {...params} label="School" />} 
                    isOptionEqualToValue={(option,value) => option.id === value.id}
                    onChange={(e,newVal) => setSelectedSchool(newVal.id)}
                    style={{flexBasis: "66%"}}
                    />
                <TextField disabled={!selectedSchool} variant="outlined" label="Academic Year" onChange={(e) => {
                    if(validateAcademicYear(e.target.value))
                        setAcademicYear(e.target.value)
                    else
                        setAcademicYear(null);
                    }
                    }/>
                <Stack direction="row" spacing={1}>
                    <Autocomplete disablePortal options={stds} disabled={!academicYear}
                    renderInput={(params) => <TextField {...params} label="Std" />} style={{flexGrow: 1}}
                    onChange={(event,val) => setStudentStd(val.id)}/>
                    <Autocomplete disablePortal options={divs} disabled={divs.length === 0}
                    renderInput={(params) => <TextField {...params} label="Div" />} style={{flexGrow: 1}} 
                    onChange={(event,val) => setStudentDiv(val.id)}
                    />
                </Stack>
                <Autocomplete disablePortal options={rollNos} disabled={divs.length === 0}
                renderInput={(params) => <TextField {...params} label="Roll No" />} style={{flexGrow: 1}}
                onChange={(event,val) => setSelectedStudent({id:val.id, rollNo: parseInt(val.label)})} 
                />
                <Button variant="contained" style={{width: "50%", alignSelf: "center"}} color="primary" size="large"
                onClick={() => selectStudent({studentId: selectedStudent.id, studentStd, studentDiv, studentRollNo: selectedStudent.rollNo}, academicYear,dispatch, navigate)}
                >Select Student</Button>
                {loadingData && <LoadingScreen />}
            </Stack>
            </Paper>
        </div>)
}

/*********************Components******************* */

/*********************Functions******************* */
async function loadSchoolList(setSchoolList, setLoadingData)
{
    try
    {
        const resp = await fetch(schoolListApiUrl, {
            method: "GET",
            headers: {
                "Authorization" : localStorage.getItem("token")
            }
        });
        if(resp.status !== 200)
            throw new Error(resp.status);

        const data = await resp.json();

        const schoolList = []
        data.schools.forEach((school) => {
            schoolList.push({id: school.id, label: school.schoolName, subjects: school.subjects});
        })

        console.log(schoolList)
        setSchoolList(schoolList);
    }
    catch(err)
    {
        console.log(err);
        alert("Failed to load data");
    }
    finally 
    {
        setLoadingData(false);
    }
}


async function loadStdStudents(schoolId, year, std, studentList, setStudentList, setLoadingData)
{
    /*Loads the list of students for the given std */

    setLoadingData(true);

    try
    {
        const resp = await fetch(`${loadStudentLisApitUrl}/${std}?sid=${schoolId}&year=${year}`, {
            method: "GET",
            headers: {
                "Authorization" : localStorage.getItem("token")
            }
        });
        if(resp.status !== 200)
            throw new Error(resp.status);
        
        const data = await resp.json();
        const newStudentList = {...studentList};
        if(!newStudentList[year])
            newStudentList[year] = {};
        newStudentList[year][std] = data.studentList;

        setStudentList(newStudentList);
    }
    catch(err)
    {
        console.log(err);
        alert("Failed to load data. Try again");
    }
    finally {
        setLoadingData(false);
    }
}

function validateAcademicYear(year)
{
    /*Checks if the entered academic year is valid */

    return year.match(academicYearRegexPattern);
}

function selectStudent(studentDetails, academicYear, dispatch, navigation)
{
    /*Saves the students details in slice */
    
    dispatch(setStudentDetails(studentDetails));
    navigation(`/report/${academicYear}`);
}

/********************Exports**************** */
export default AdminReportStudentSelection;