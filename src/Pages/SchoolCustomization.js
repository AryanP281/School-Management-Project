
/********************Imports**************** */
import { Autocomplete,TextField,Stack, Paper, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import SecondaryActionBar from "../Components/SecondaryActionBar";
import { apiBaseUrl } from "../Config/AppConfig";
import {LoadingScreen} from "./SchoolStudentSelection";

/************************Variables***************/
const schoolListApiUrl = `${apiBaseUrl}/school/all/school`;
const saveResourcesApiUrl = `${apiBaseUrl}`;

/*********************Page******************* */
function SchoolCustomization()
{   
    const [schoolList, setSchoolList] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
    const [resourceUrls, setResourceUrls] = useState([null]);
    const navigate = useNavigate();    

    useEffect(() => {
        loadSchoolList(setSchoolList, setLoadingData, navigate);
    },[]);
    
    return(<div className="background-bar">
            <SecondaryActionBar homeAddr="/home/admin" />
            <Paper className="entry-grid" elevation={2} style={{flexBasis: "80%"}}>
                <Stack spacing={4}>
                    <Autocomplete disablePortal options={schoolList}
                    renderInput={(params) => <TextField {...params} label="School" />} 
                    isOptionEqualToValue={(option,value) => option.id === value.id}
                    onChange={(e,newVal) => setSelectedSchool(newVal.id)}
                    style={{flexBasis: "66%"}}
                    />
                    <Stack direction="row" spacing={2}>
                        {resourceUrls[0] && <Typography variant="caption" style={{textAlign: "center"}}>{resourceUrls[0]}</Typography>}
                        <Button component="label" color="primary">
                            Upload Header
                            <input id="school-header-img" type="file" hidden 
                            onChange={(e) => setResourceDisplayUrl(resourceUrls,setResourceUrls, 0, e)}/>
                        </Button>
                    </Stack>
                    <Button variant="contained">Save</Button>
                </Stack>
            </Paper>
            {loadingData && <LoadingScreen />}
        </div>)
}

/*********************Components******************* */


/*********************Functions******************* */
async function loadSchoolList(setSchoolList, setLoadingData, navigate)
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
        if(!data.success)
        {
            switch(data.code)
            {
                case 1 : navigate("/admin/home"); break;
            }
        }

        const schoolList = []
        data.schools.forEach((school) => {
            schoolList.push({id: school.id, label: school.schoolName, subjects: school.subjects});
        })

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

function setResourceDisplayUrl(urls, setUrls, resourceIndex, event)
{
    /*Sets the display url for the given resource */

    if(event.target.files && event.target.files[0])
    {
        console.log(event.target.files)
        const updatedUrls = [...urls];
        updatedUrls[resourceIndex] = event.target.files[0].name
        setUrls(updatedUrls);
    }
}

async function saveResources(setLoadingData)
{
    /*Sends the uploaded resources to server*/

    setLoadingData(true);

    try
    {
        const resp = await fetch(saveResourcesApiUrl, {
            method: "POST",
            headers: {
                "Authorization": localStorage.getItem("token")
            }
        });
    }
    catch(err)
    {
        console.log(err);
        alert("Failed to save resources");
        setLoadingData(false);
    }
}

/********************Exports**************** */
export default SchoolCustomization;