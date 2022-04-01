/************************Imports******************** */
import { Router } from "express";
import { generateStudentReport } from "../Controllers/StudentController";
import { verifyToken } from "../Services/Middleware";

/*************************Variables***************** */
const router : Router = Router();

/************************Routes******************** */
router.get("/report", generateStudentReport);

/************************Exports******************** */
export default router;