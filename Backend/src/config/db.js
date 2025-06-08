import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

const connectDB = async () => {
    await mongoose.connect(MONGO_URL);
    console.log("MongoDB Connected");
};

export default connectDB;

