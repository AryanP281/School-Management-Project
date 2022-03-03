
import {Drawer,Typography,List,ListItem,ListItemText,ListItemIcon,AppBar,Toolbar} from "@mui/material";
import {makeStyles} from "@mui/styles";
import { SubjectOutlined } from "@mui/icons-material";
import {useNavigate, useLocation} from "react-router-dom";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => {return {
    page: {
        width: "100%",
        padding: theme.spacing(3),
    },
    drawer: {
        width: drawerWidth
    },
    drawerPaper: {
        width: drawerWidth
    },
    active: {
        backgroundColor: "#f4f4f4"
    },
    appbar: {
        width: `calc(100vw - ${drawerWidth}px) !important`,
        left: `${drawerWidth}px !important`
    },
    toolbar: theme.mixins.toolbar
}});

function Layout(props)
{
    const classes = useStyles();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            text: "Home",
            icon: <SubjectOutlined color="secondary"/>,
            path: "/"
        },
        {
            text: "Login",
            icon: <SubjectOutlined color="secondary"/>,
            path: "/login"
        }
    ];

    return(
        <div>
            <AppBar className={classes.appbar}>
                <Toolbar>
                    <Typography>Welcome to notes website</Typography>
                </Toolbar>
            </AppBar>
        
            <div style={{display: "flex"}}>
                <Drawer className={classes.drawer} variant="permanent" anchor="left" classes={{paper: classes.drawerPaper}}>
                    <div><Typography variant="h5">Notes</Typography></div>
                    <List>
                        {menuItems.map((item,id) => (
                            <ListItem key={id} button onClick={() => navigate(item.path)} 
                            className={location.pathname === item.path ? classes.active : undefined}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItem>
                        ))}
                    </List>
                </Drawer>
                <div className={classes.page}>
                    <div className={classes.toolbar} />
                    {props.children}
                </div>
            </div>
        </div>
    )
}

export default Layout;