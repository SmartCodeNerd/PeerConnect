import mongoose from "mongoose";
import { createServer } from "node:http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./src/config/db.js";
import connectToServer from "./src/controllers/socketManager.js";

const port = process.env.PORT || 3000;
const app = express();
const server = createServer(app);
const io = connectToServer(server);

app.use(cors());
app.use(express.json({limit:"50kb"}));
app.use(express.urlencoded({limit:"50kb",extended:true}));

app.get("/home",(req,res) => {
    console.log(req.body);
    console.log("Done");
    res.send("Success");
})

const startServer = async () => {
    await connectDB();
    server.listen(port , () => {
    console.log("Server Started-Welcome to PeerConnect ");
});
}

startServer();
