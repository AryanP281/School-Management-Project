
/******************Imports****************** */
import { AppBar, Card, CardContent, Grid, IconButton, Toolbar, Typography } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from "react-router";
import {ActionBar} from "./SchoolHome";

/******************Variables****************** */


/*******************Page********************* */
function AdminHome()
{
    const navigate = useNavigate();

    if(!localStorage.getItem("token"))
        navigate("/admin/login")
    
    return(<div style={{width: "100%", height: "100%"}}>
            <ActionBar isHome={true}/>

            <Grid container className="school-menu" spacing={2}>
                <Grid item xs={6} >
                    <Card className="school-option-card" onClick={() => navigate("/admin/school/subject")}>
                        <CardContent className="school-option">
                            <Typography>Subject Management</Typography>
                        </CardContent>
                    </Card>
                </Grid> 
                <Grid item xs={6} >
                    <Card className="school-option-card" onClick={() => navigate("/admin/student")}>
                        <CardContent className="school-option">
                            <Typography>Student Marks Entry</Typography>
                        </CardContent>
                    </Card>
                </Grid> 
                <Grid item xs={6} >
                    <Card className="school-option-card" onClick={() => navigate("/admin/report/student")}>
                        <CardContent className="school-option">
                            <Typography>Student Report</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6}>
                    <Card className="school-option-card" onClick={() => navigate("/admin/report/student")}>
                        <CardContent className="school-option">
                            <Typography>Leaving Certificate</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6}>
                    <Card className="school-option-card" onClick={() => navigate("/admin/report/student")}>
                        <CardContent className="school-option">
                            <Typography>Domicile Certificate</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6}>
                    <Card className="school-option-card" onClick={() => navigate("/admin/customization")}>
                        <CardContent className="school-option">
                            <Typography>School Customization</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

        </div>)
}

/*******************Components********************* */

/******************Functions****************** */

/******************Exports****************** */
export default AdminHome;