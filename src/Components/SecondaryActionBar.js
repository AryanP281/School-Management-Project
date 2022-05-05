
/********************Imports******************** */

import { Button } from "@mui/material";
import { useNavigate } from "react-router";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/********************Components***************** */
function SecondaryActionBar({homeAddr})
{
    const navigate = useNavigate();
    
    return (<div className="secondary-action-bar">
            <Button variant="text" style={{color: "white"}} startIcon={<ArrowBackIcon />}
            onClick={() => navigate(homeAddr)}>Return To Home</Button>
        </div>)
}

/********************Exports******************** */
export default SecondaryActionBar;