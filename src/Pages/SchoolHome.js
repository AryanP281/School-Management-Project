
/******************Imports****************** */
import { AppBar, Card, CardContent, Grid, IconButton, Toolbar, Typography, Button } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from "react-router";

/******************Variables****************** */


/*******************Page********************* */
function SchoolHome()
{
    const navigate = useNavigate();

    if(!localStorage.getItem("token"))
        navigate("/school/login")
    
    return(<div style={{width: "100%", height: "100%"}}>
            <ActionBar isHome={true} />

            <Grid container className="school-menu" spacing={2}> 
                <Grid item xs={6} >
                    <Card className="school-option-card" onClick={() => navigate("/school/report/student")}>
                        <CardContent className="school-option">
                            <Typography>Student Report</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6}>
                    <Card className="school-option-card">
                        <CardContent className="school-option">
                            <Typography>Leaving Certificate</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6}>
                    <Card className="school-option-card">
                        <CardContent className="school-option">
                            <Typography>Domicile Certificate</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

        </div>)
}

/*******************Components********************* */
function ActionBar()
{

    return (<AppBar position="sticky">
            <Toolbar>
                <Typography style={{flexGrow: 1}}>Welcome</Typography>
                <IconButton>
                    <LogoutIcon style={{color: "white"}}/>
                </IconButton>
            </Toolbar>
        </AppBar>)
}

/******************Functions****************** */

/******************Exports****************** */
export default SchoolHome;
export {ActionBar};