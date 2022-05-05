/**********************Imports**************** */
import cron from "node-cron";
import fs from "fs";
import { resolve } from "path";

/**********************Variables**************** */
const responseCodes = {
    success: 0,
    invalidToken: 1,
    alreadyExists: 2,
    doesntExist:3,
    incorrectPassword:4
};

/**********************Functions**************** */
function scheduleFileDeleteJob()
{
    /*Starting node cron job for deleting generated files*/
    
    const scheduleString : string = "0 0 */1 * * *";
    
    cron.schedule(scheduleString, () => {
        //Getting files in directory
        const files : string[] = fs.readdirSync(resolve(__dirname, "../Static"));

        //Generating file creation dates
        const now : number = (new Date()).getTime();
        const fileCreationTimes : number[] = files.map((file) => parseInt(file.split('.')[0]));

        fileCreationTimes.forEach((time) => {
            //Checking if file was created more than 60 seconds ago
            if((now - time) / 1000 >= 60)
                fs.unlinkSync(resolve(__dirname, `../Static/${time}.pdf`)); //Deleting the file
        });
    });
}

/**********************Exports**************** */
export {responseCodes, scheduleFileDeleteJob};