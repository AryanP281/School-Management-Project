/************************Imports******************** */
import { Router } from "express";
import { editStudentScores, generateStudentReport, getStudentScores } from "../Controllers/StudentController";
import { verifyToken } from "../Services/Middleware";

/*************************Variables***************** */
const router : Router = Router();

/************************Routes******************** */
router.get("/report", verifyToken, generateStudentReport);
router.get("/scores/:id", verifyToken, getStudentScores);
router.post("/edit/scores", verifyToken, editStudentScores);

/************************Exports******************** */
export default router;