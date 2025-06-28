import Router from "express";
const   router = Router();
import User from "../models/userModel.js";
import {register,login,logout, getHistory, addToUserHistory,addFeedback} from "../controllers/userController.js";

router.post("/auth/register",register);
router.post("/auth/login", login);
router.post("/auth/logout",logout);
router.get("/get-all-activity",getHistory);
router.post("/add-to-activity",addToUserHistory);
router.post("/add-feedback",addFeedback);

export default router;

