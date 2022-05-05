
/********************Imports**************** */
import { Autocomplete,TextField,Stack, Paper, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiBaseUrl, apiHeader } from "../Config/AppConfig";
import { LoadingScreen } from "./SchoolStudentSelection";
import { setStudentDetails } from "../Redux/Slices/StudentSlice";
import { useDispatch } from "react-redux";
import SecondaryActionBar from "../Components/SecondaryActionBar";

/************************Variables***************/
const schoolListApiUrl = `${apiBaseUrl}/school/all/school`;
const loadStudentListApiUrl = `${apiBaseUrl}/school/all/students/std`;
const year = (new Date()).getFullYear(); //Getting the current year

/*********************Page******************* */
function AdminStudentSelection()
{
    const [schoolList, setSchoolList] = useState([]);
    const [schoolId, setSchoolId] = useState(undefined);
    const [studentStd, setStudentStd] = useState(undefined);
    const [studentDiv, setStudentDiv] = useState(undefined);
    const [rollNos, setRollNos] = useState([]);
    const [studentList, setStudentList] = useState({});
    const [loadingData, setLoadingData] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState({});
    const navigate = useNavigate();
    const dispatch = useDispatch();

    //Loading schools list
    useEffect(() => {
        if(localStorage.getItem("token"))
            getSchools(setSchoolList);
        else
            navigate("/login", {replace: true});
    }, []);

    useEffect(() => {
        if(schoolId && studentStd && (!studentList[schoolId] || !studentList[schoolId][studentStd]))
            loadStdStudents(schoolId, studentStd, studentList, setStudentList, setLoadingData);
    }, [schoolId, studentStd])

    const stds = [];
    for(let i = 1; i <= 10; ++i)
    {
        stds.push({label: `${i}`, id: i});
    }

    //Creating division and rollno lists
    let divs = [];
    if(schoolId && studentList[schoolId] && studentList[schoolId][studentStd])
    {
        divs = studentList[schoolId][studentStd].map((div,index) => {return {label: div.div, id:index}});
    }

    useEffect(() => {
        if(schoolId && studentList[schoolId] && studentList[schoolId][studentStd])
        {
            let newRollNos = [];
            studentList[schoolId][studentStd][studentDiv].students.forEach((student) => newRollNos.push({label:`${student.rollNo}`, id: student.id, name: student.name}));
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

    //Getting school name
    const school = (schoolList.filter((sch) => sch.id === schoolId))[0];
    let schoolName = "";
    if(school)
        schoolName = school.label;

    //Getting div name
    const div = (divs.filter((d) => d.id === studentDiv))[0];
    let divName = "";
    if(div)
        divName = div.label;

    return(<div className="background-bar">
            <SecondaryActionBar homeAddr="/home/admin"/>
            <Paper className="entry-grid" elevation={2} style={{flexBasis: "80%"}}>
                <Stack spacing={4}>
                <Autocomplete disablePortal options={schoolList} disabled={schoolList.length === 0}
                renderInput={(params) => <TextField {...params} label="School" />} 
                isOptionEqualToValue={(option,value) => option.id === value.id}
                onChange={(event, newVal) => setSchoolId(newVal.id)}
                style={{flexBasis: "66%"}}
                />
                <Stack direction="row" spacing={1}>
                    <Autocomplete disablePortal options={stds} disabled={schoolId === undefined}
                    renderInput={(params) => <TextField {...params} label="Std" />} style={{flexGrow: 1}}
                    onChange={(event,val) => setStudentStd(val.id)}/>
                    <Autocomplete disablePortal options={divs} disabled={studentStd === undefined}
                    renderInput={(params) => <TextField {...params} label="Div" />} style={{flexGrow: 1}} 
                    onChange={(event,val) => setStudentDiv(val.id)}
                    />
                </Stack>
                <Autocomplete disablePortal options={rollNos}
                renderInput={(params) => <TextField {...params} label="Roll No" />} style={{flexGrow: 1}} 
                onChange={(e,newVal) => setSelectedStudent({id:newVal.id, rollNo: parseInt(newVal.label), name: newVal.name})}
                />
                <Button variant="contained" style={{width: "50%", alignSelf: "center"}} color="primary" size="large"
                onClick={() => selectStudent({schoolId, schoolName, studentId: selectedStudent.id, studentName: selectedStudent.name,
                    studentStd, studentDiv : divName, studentRollNo: selectedStudent.rollNo}, dispatch, navigate)}
                >Select Student</Button>
                {loadingData && <LoadingScreen />}
            </Stack>
            </Paper>
        </div>)
}

/*********************Functions******************* */
async function getSchools(setSchoolList)
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
            schoolList.push({id: school.id, label: school.schoolName});
        })
        setSchoolList(schoolList);
    }
    catch(err)
    {
        console.log(err);
    }
}

async function loadStdStudents(schoolId,std, studentList, setStudentList, setLoadingData)
{
    /*Loads the list of students for the given std */

    setLoadingData(true);

    try
    {
        const resp = await fetch(`${loadStudentListApiUrl}/${std}?year=${year}&sid=${schoolId}`, {
            method: "GET",
            headers: {
                "Authorization" : localStorage.getItem("token")
            }
        });
        if(resp.status !== 200)
            throw new Error(resp.status);
        
        const data = await resp.json();
        const newStudentList = {...studentList};
        if(!newStudentList[schoolId])
            newStudentList[schoolId] = {};
        newStudentList[schoolId][std] = data.studentList;

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

function selectStudent(studentDetails, dispatch, navigate)
{
    /*Saves the students details in slice */
    
    dispatch(setStudentDetails(studentDetails));
    navigate("/admin/student/report");
}

/********************Exports**************** */
export default AdminStudentSelection;