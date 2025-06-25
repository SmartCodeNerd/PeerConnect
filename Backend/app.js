import mongoose from "mongoose";
import { createServer } from "node:http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./src/config/db.js";
import connectToServer from "./src/controllers/socketManager.js";
import userRoutes from "./src/routes/userRoutes.js";

const port = process.env.PORT || 3000;
//To Create an instance of express
const app = express();
//Creates a http server from the express instance
const server = createServer(app);
//Connects both the express and the socket.io Server
const io = connectToServer(server);

app.use(cors()); // Cross Origin Resource Sharing

//Middlewares to convert the incoming data into readable format
app.use(express.json({limit:"50kb"}));
app.use(express.urlencoded({limit:"50kb",extended:true}));

app.use("/user",userRoutes);

app.get("/home",(req,res) => {
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