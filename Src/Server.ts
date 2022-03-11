/**************Imports************* */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {initializeDatabase,dbPool} from "./Config/MariadbConfig";

/**************Variables******** */
dotenv.config();
const SERVER_PORT : number = parseInt(process.env.PORT!) || 5000;

/**************Initialization******** */
const expressApp : express.Application = express();

//Setting middleware
expressApp.use(express.json());
expressApp.use(express.urlencoded({extended: false}));
expressApp.use(cors());

//Server test route
expressApp.use("/server/test",async (req : express.Request, resp : express.Response) => {
    resp.sendStatus(200);
});

//Starting express server
expressApp.listen(SERVER_PORT, "0.0.0.0", () => console.log(`Express server started at port ${SERVER_PORT}`));

//Initalizing database
initializeDatabase();