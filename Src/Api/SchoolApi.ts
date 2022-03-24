/************************Imports******************** */
import { Router } from "express";
import { addSubject, getAllRubrics, getAllSchools, getAllSubjects, registerSchool } from "../Controllers/SchoolController";
import { verifyToken } from "../Services/Middleware";

/*************************Variables***************** */
const router : Router = Router();

/************************Routes******************** */
router.post("/register", verifyToken, registerSchool);
router.get("/all/school", verifyToken, getAllSchools);
router.put("/add/subject", verifyToken, addSubject);
router.get("/all/subject", verifyToken, getAllSubjects);
router.get("/all/rubric", verifyToken, getAllRubrics);

/************************Exports******************** */
export default router;