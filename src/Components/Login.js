
/*************************Imports********************* */
import { useState } from "react";
import {Grid, Paper, Avatar, Stack, TextField, Checkbox, FormControlLabel, Button, Typography} from "@mui/material"
import {Lock} from "@mui/icons-material"
import { makeStyles } from "@mui/styles";
import "../Stylesheets/Login.css"

/**************************Styles****************** */
const useStyles = makeStyles({
    loginBoxPaper: {
        width: "25%",
        height: "75%", 
        padding: 10
    },
    textInput: {
        marginTop: 20,
        flexGrow: 1
    }
});

const loginBoxPaperStyle = {
    width: "25%",
    height: "75%", 
    padding: 10
};

const textInputStyle = {
    marginTop: 20,
    flexGrow: 1
};

/**************************Components****************** */
function LoginPage()
{
    //const classes = useStyles();
    const [userDetails, setUserDetails] = useState({email:"", password:""});
    
    return (<Grid container justifyContent="center" alignItems="center" style={{height: "100%"}}>
            <Paper className="login-box-paper" elevation={10}>
                <Stack alignItems="center" spacing={2}>
                    <Avatar style={{backgroundColor: "green"}}><Lock /></Avatar>
                    <Typography variant="h4">Sign In</Typography>
                </Stack>
                <form noValidate autoComplete="off" onSubmit={(e) => {
                    e.preventDefault();
                    console.log(userDetails)
                }}>
                    <TextField className="login-input" required fullWidth variant="filled" helperText="Email" 
                    placeholder="Enter Email" color="secondary"
                    onChange={(e) => setUserDetails({email:e.target.value, password:userDetails.password})}
                    />
                    <Stack direction="row" spacing={2}>
                        <TextField className="login-input" required variant="filled" helperText="Password" 
                        placeholder="Enter Email" type="password" color="secondary"
                        onChange={(e) => setUserDetails({email:userDetails.email, password:e.target.value})}
                        />
                        <FormControlLabel control={<Checkbox />} label="Show" />
                    </Stack>
                    <FormControlLabel control={<Checkbox />} label="Remember Me"/> 
                    <Button fullWidth variant="contained" type="submit" style={{marginTop: 20, fontWeight: "bold"}}>Sign In</Button>       
                </form>
            </Paper>
        </Grid>)
}

/*************************Exports********************* */
export default LoginPage;