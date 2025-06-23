import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};    

    const connectToServer = (server) => {
        console.log("Something Connected");
    const io = new Server(server, {
        //Resolving CORS issues
        cors:  {
            origin:"*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true,
        }
    });
    console.log("Socket Connected");

    //on is used to recieve the message and emit is used to send the message
    //If this route is hit,means someone is connected to this
    io.on("connection",(socket) => {
        console.log("🔥 New socket connected:", socket.id); 
        socket.on("join-call", (path) => {
    console.log("User joined path: " + path);
    console.log("Success");

    if (connections[path] === undefined) {
        connections[path] = [];
    }
    console.log("Success");
    const existingClients = [...connections[path]]; // before pushing the new socket
    connections[path].push(socket.id);
    timeOnline[socket.id] = new Date();
    console.log("Existing Clients",existingClients);
    for (let a = 0; a < connections[path].length; a++) {
        const socketId = connections[path][a];
        io.to(socketId).emit("user-joined", {
  id: socket.id,
  clients: existingClients
});
    }

    if (messages[path] !== undefined) {
        for (let a = 0; a < messages[path].length; a++) {
            io.to(socket.id).emit("chat-message", 
                messages[path][a]['data'],
                messages[path][a]['sender'],
                messages[path][a]['socket-id-sender']
            );
        }
    }
});


        //socket.to method in Socket.IO is used to send a message to all sockets in a specific room, except the sender.
        socket.on("signal",(toId,message) => {
            console.log(`📶 Signal from ${socket.id} to ${toId}:`, message);
            io.to(toId).emit("signal",socket.id,message);
        });

        socket.on("chat-message",(data,sender) => {
            //Refer to README.md file Ex-1
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room,isFound],[roomKey,roomValue]) => {
                    if(!isFound && roomValue.includes(socket.id)) {
                        return [roomKey,true];
                    }
                    return [room,isFound];
                },['',false]);
            if(found === true){
                if(messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = [];
                }

                messages[matchingRoom].push({'sender':sender,'data':data,'socket-id-sender':socket.id});
                console.log("message",matchingRoom,":",sender,data);

                connections[matchingRoom].forEach(element => {
                    io.to(element).emit("chat-message",data,sender,socket.id);
                });
            }
        });

        socket.on("disconnect",() => {
            let diffTime = new Date() - timeOnline[socket.id];
            console.log("User disconnected: " + socket.id + " after " + diffTime + "ms");
            //Remove the user from the connections object
            for(let path in connections) {
                if(connections[path].includes(socket.id)) {
                    connections[path] = connections[path].filter(id => id !== socket.id);
                    // Notify other users in the room about the disconnection
                    connections[path].forEach(element => {
                        io.to(element).emit("user-disconnected", socket.id);
                    });
                    // If the room is empty, delete it
                    if(connections[path].length === 0) {
                        delete connections[path];
                        delete messages[path];
                    }
                }
            }
        });
    });

    return io;
}

export default connectToServer;