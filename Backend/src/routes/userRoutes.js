import Router from "express";
const router = Router();
import User from "../models/userModel.js";

router.get("/login", (req,res) => {
    res.send("Login Successful");
});

export default router;

