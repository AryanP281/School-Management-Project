/************************Imports******************** */
import { Router } from "express";
import { addSubject, deleteSubject, editSubject, getAllRubrics, getAllSchools,getAllSubjects, getStudentsByStd, getSubjectRubrics, loginSchool, registerSchool } from "../Controllers/SchoolController";
import { verifyToken } from "../Services/Middleware";

/*************************Variables***************** */
const router : Router = Router();

/************************Routes******************** */
router.post("/register", verifyToken, registerSchool);
router.post("/login", loginSchool);
router.get("/all/school", verifyToken, getAllSchools);
router.put("/add/subject", verifyToken, addSubject);
router.put("/edit/subject", verifyToken, editSubject);
router.put("/delete/subject", verifyToken, deleteSubject);
router.get("/all/subject", verifyToken, getAllSubjects);
router.get("/all/rubric", verifyToken, getAllRubrics);
router.get("/all/students/std/:std", verifyToken, getStudentsByStd);
router.get("/subject/rubric", verifyToken, getSubjectRubrics);

/************************Exports******************** */
export default router;