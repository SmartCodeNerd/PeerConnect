import { Server } from "socket.io";

const connectToServer = (server) => {
    const io = new Server(server);
    console.log("Socket Connected");
    return io;
}

export default connectToServer;