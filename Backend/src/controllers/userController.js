import User from "../models/userModel.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Meeting from "../models/meetingModel.js";
import Feedback from "../models/feedbackModel.js";

const register = async (req,res) => {
    console.log("CP-1");
    const {name,username,password} = req.body;

    if(!name || !username || !password) 
        return res.status(httpStatus.BAD_REQUEST).json({message:"All Fields are required"});
    try{
        const isExisting = await User.findOne({username:username});
        if(isExisting) {
            //Early Return Statements
            return res.status(httpStatus.FOUND).json({message:"User Already Exists"});
        }
        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = await User.create({
            name,
            username,
            password:hashedPassword,
        });

        console.log(newUser);
        
        return res.status(httpStatus.CREATED).json({message:"User Registered Successfully"});
    }
    catch(e) {
        return res.json({message:`Something Went Wrong-${e}`});
    }
};

const login = async (req,res) => {
    const {username,password} = req.body;
    console.log("In Login",req.body);
    if(!username || !password) 
        return res.status(httpStatus.BAD_REQUEST).json({message:"All Fields are required"});
    try {
        const user = await User.findOne({username:username});
        if(!user) {
            return res.status(httpStatus.NOT_FOUND).json({message:"User Not Found"});
        }
        console.log("Hello");
        console.log("user",user);
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch) {
            return res.status(httpStatus.BAD_REQUEST).json({message:"Invalid Password"});
        }
        console.log("isMatch",isMatch);
        let token = crypto.randomBytes(20).toString("hex");
        if(!user.token)
        user.token = token;
        else
        return res.status(httpStatus.BAD_REQUEST).json({message:"Logout Not Done"});
        await  user.save();
        return res.status(httpStatus.OK).json({message:"User Logged in Successfully",token:token});
    } 
    catch(e) {
        return res.status(500).json({message:`Something Went Wrong-${e}`});
    }
};

const logout = async (req,res) => {
    const {username,token} = req.body;
    console.log("Logout");
    console.log("Body",req.body);
    let user = await User.findOne({username:username});
    if(!user) {
        return res.status(httpStatus.NOT_FOUND).json({message:"User Not Found"});
    }
    console.log("Before Logout",user);
    const isMatch = (user.token === token);
    console.log("isMatch",isMatch);
    if(!isMatch) {
        return res.status(httpStatus.BAD_REQUEST).json({message:"Invalid Token"});
    }
    await user.updateOne({ $unset: { token: 1 } });
    user = await User.findOne({username:username});
    console.log("After Logout",user);
    return res.status(httpStatus.OK).json({message:"Logged out Successfully"});
}

const getHistory = async (req, res) => { 
    const { token } = req.query;

    try {
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(401).json({ message: "Invalid token" });
        }
        //console.log("User",user);
        const meetings = await Meeting.find({ userId: user._id });
        //console.log("Meeting", meetings);
        res.json({ meetings });
    }
    catch (e) {
        console.log("Get History Error", e);
        res.json({ message: `Something Went Wrong-${e}` });
    }
}

const addToUserHistory = async (req, res) => {
    //console.log("Req Body",req.body);
    const { token, meetingCode } = req.body;
    //console.log("Req Body",req.body);
    console.log("Coming");
    console.log(req.body);
    try {
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
        }

        const newMeetingDetails = {
            meetingCode:meetingCode,
            userId: user._id, // Use userId (capital I) for consistency
        };

        console.log("Before Creation");
        await Meeting.create(newMeetingDetails);
        console.log("After Creation");

        res.status(httpStatus.CREATED).json({ message: "Added to History Details" });
    } catch (e) {
        console.log("Add To History Error", e);
        res.status(500).json({ message: `Add To History Error-${e}` });
    }
};

const addFeedback = async (req, res) => {
  try {
    console.log("Add feedback");
    const { meetCode, stars, message, token } = req.body;
    console.log(req.body);
    const user = await User.findOne({ token: token });
    if (!user) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
    }
    console.log(user);
    const meeting = await Meeting.findOne({meetingCode:meetCode});
    if (!meeting) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid Meeting Code" });
    }
    console.log(meeting);

    // Basic validation for required fields
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: "Stars must be between 1 and 5." });
    }

    const feedback = new Feedback({
      user: user._id || undefined,         // optional
      meeting: meeting._id || undefined,   // optional
      stars,
      message,
    });

    await feedback.save();

    return res.status(201).json({
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export {
    register,
    login,
    logout,
    getHistory,
    addToUserHistory,
    addFeedback
};