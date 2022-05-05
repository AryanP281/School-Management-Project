/**************Imports************* */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {initializeDatabase} from "./Config/MariadbConfig";
import adminRouter from "./Api/AdminApi";
import schoolRouter from "./Api/SchoolApi";
import studentRouter from "./Api/StudentApi";
import {scheduleFileDeleteJob} from "./Config/AppConfig";

/**************Variables******** */
dotenv.config();
const SERVER_PORT : number = parseInt(process.env.PORT!) || 5000;
const JWT_SECRET : string = process.env.JWTSECRET!;

/**************Initialization******** */
const expressApp : express.Application = express();

//Setting middleware
expressApp.use(express.json());
expressApp.use(express.urlencoded({extended: false}));
expressApp.use(cors());
expressApp.use("/pdf",express.static("Static"));

//Server test route
expressApp.use("/server/test",async (req : express.Request, resp : express.Response) => {
    resp.sendStatus(200);
});

//Setting up routes
expressApp.use("/admin", adminRouter);
expressApp.use("/school", schoolRouter);
expressApp.use("/student", studentRouter);
expressApp.use("/pdf",express.static(__dirname + "/Static"));

//Starting express server
expressApp.listen(SERVER_PORT, "0.0.0.0", () => console.log(`Express server started at port ${SERVER_PORT}`));

//Initalizing database
initializeDatabase();

//Scheduling file delete job
scheduleFileDeleteJob();

/************************Exports******************** */
export {JWT_SECRET};
