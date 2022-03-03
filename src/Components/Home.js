import { useState } from "react";
import {Grid, Card, CardHeader, CardContent, IconButton, Typography, Avatar} from "@mui/material"
import { DeleteOutlined } from "@mui/icons-material";
import {makeStyles} from "@mui/styles";
import { yellow,green } from "@mui/material/colors";

const useStyles = makeStyles({
    avatar: {
        backgroundColor: (card) => {
            console.log(card.catg === "Even")
            return (card.catg === "Even" ? yellow[700] : green[500]);
        }
    }
});

function Home()
{
    const [category,setCategory] = useState("hello");

    return(
        <Grid container spacing={3}>
                {(() => {
                    const cards = [];
                    for(let i = 1; i <= 5; ++i)
                    {
                        cards.push(<Grid item xs={12} md={6}><CardComp title={`Card ${i}`} catg={i % 2 == 0? "Even" : "Odd"}/></Grid>)
                    }
                    return cards;
                })()}
        </Grid>
        )
}

function CardComp(props)
{
    const classes = useStyles({catg: props.catg});
    
    return(<div>
            <Card elevation={3}>
                <CardHeader 
                    avatar={
                        <Avatar className={classes.avatar}>{props.catg[0]}</Avatar>
                    }
                    action={
                        <IconButton>
                            <DeleteOutlined />
                        </IconButton>
                    }
                    title={props.title}
                    subheader={props.catg}
                />
                <CardContent>
                    <Typography variant="body2" color="textSecondary">
                        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nam, eveniet quis quae vel atque maiores quo tempore, impedit eius eaque amet earum illo modi perferendis ullam non adipisci reprehenderit sequi.
                    </Typography>
                </CardContent>
            </Card>
        </div>
    );
}

export default Home;

/*
<Grid container justifyContent="center">
            <FormControl>
                <FormLabel>Greeting type</FormLabel>
                <RadioGroup value={category} onChange={(e) => setCategory(e.target.value)}>
                    <FormControlLabel control={<Radio value="hello"/>} label="Hello" />
                    <FormControlLabel control={<Radio value="gb"/>} label="Good Bye" />
                </RadioGroup>
            </FormControl>
        </Grid>
*/