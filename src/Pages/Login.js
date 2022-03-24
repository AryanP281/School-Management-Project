
/******************Imports****************** */
import { VisibilityOutlined } from "@mui/icons-material";
import {Grid,Paper, TextField, Typography,Stack, IconButton, Button, FormControlLabel,Checkbox, Alert} from "@mui/material";
import { useState } from "react";
import {responseCodes, apiBaseUrl} from "../Config/AppConfig";
import { useNavigate } from "react-router-dom";

/******************Variables****************** */
const authApiUrl = `${apiBaseUrl}/admin/login`;

/*******************Page********************* */
function Login()
{
    const [userCreds, setUserCreds] = useState({email:"",password:""});
    const [showAlert, setShowAlert] = useState(false);
    const [credErrors, setCredErrors] = useState([false,false]);    
    const [showPassword, setShowPassword] = useState(false);
    const nav = useNavigate();
    
    return (
        <Grid className="background" container justifyContent="center" alignItems="center">
            <Paper className="login-box" elevation={3}>
                <Typography variant="h4" style={{alignSelf: "center"}}>Sign In</Typography><br/>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    authenticate(userCreds, setShowAlert, setCredErrors, nav);
                }}>
                    <Stack spacing={2}>
                        <TextField variant="outlined" label="Login Id" fullWidth required 
                        onChange={(e) => {
                            setUserCreds({email: e.target.value, password:userCreds.password})
                            if(credErrors[0])
                                setCredErrors([false,credErrors[1]]);
                        }}
                        error={credErrors[0]}
                        helperText={credErrors[0] ? "Incorrect email" : ""}
                        />
                        <Stack direction="row">
                            <TextField variant="outlined" label="Password" required style={{flexGrow: 1,marginRight: 2}}
                            onChange={(e) => {
                                setUserCreds({email:userCreds.email, password: e.target.value});
                                if(credErrors[1])
                                    setCredErrors([credErrors[0], false]);
                            }}
                            type={showPassword ? "text" : "password"}
                            error={credErrors[1]}
                            helperText={credErrors[1] ? "Incorrect password" : ""}
                            />
                            <IconButton onClick={(e) => setShowPassword(!showPassword)}
                            style={{color: showPassword ? "green" : ""}} size="large"
                            ><VisibilityOutlined/></IconButton>
                        </Stack>
                        <Button type="submit" variant="contained" className="login-btn" size="large">Login</Button>
                        {showAlert && <Alert severity="error" variant="filled">Failed to login. Try again later !</Alert>}
                    </Stack>
                </form>
            </Paper>
        </Grid>
    );
}

async function authenticate(userCreds, setShowAlert, setCredErrors, nav)
{
    /*Logins the the admin */

    try
    {
        const resp = await fetch(authApiUrl,{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userCreds)
        });

        if(resp.status === 500)
            throw new Error(resp.status);
        
        const data = await resp.json();
        if(!data.success)
        {
            switch(data.code)
            {
                case responseCodes.adminDoesntExist : setCredErrors([true,false]); break;
                case responseCodes.incorrectPassword : setCredErrors([false,true]); break;
            }

            return;
        }

        //Saving the token
        localStorage.setItem("token", data.token);
        nav("/", {replace: true});
    }
    catch(err)
    {
        console.log(err);
        setShowAlert(true);

        //Setting timer to auto close error alert
        setTimeout(() => setShowAlert(false), 3000);
    }
}

/******************Exports****************** */
export default Login;