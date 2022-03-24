
/************************Imports******************** */
import { Router } from "express";
import { verifyToken } from "../Services/Middleware";
import { authenticateAdmin, registerAdmin } from "../Controllers/AdminController";

/*************************Variables***************** */
const router : Router = Router();

/************************Routes******************** */
router.post("/register", registerAdmin);
router.post("/login", authenticateAdmin);

/************************Exports******************** */
export default router;