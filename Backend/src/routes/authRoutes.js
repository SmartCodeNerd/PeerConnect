import Router from "express";
const router = Router();
import User from "../models/userModel.js";
import {register,login,logout} from "../controllers/authController.js";

router.post("/register",register);
router.post("/login", login);
router.post("/logout",logout)

export default router;

