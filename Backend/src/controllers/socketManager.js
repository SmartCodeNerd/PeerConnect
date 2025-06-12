import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};    

    const connectToServer = (server) => {
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
        
        socket.on("join-call", (path) => {
            //Here path means the room or channel that the user wants to join
            console.log("User joined path: " + path);
            //If no one has joined this path yet, we create a new array for it
            if(connections[path] === undefined)
            {
                connections[path] = [];
            }
            //If the user is already connected to this path, we do not add them again
            connections[path].push(socket.id);
            timeOnline[socket.id] = new Date();// Store the time when the user connected

            for(let a=0;a<connections[path].length;a++)
            {
                //We emit the join event to all the users in the path
                io.to(connections[path][a]).emit("user-joined",socket.id);
            }

            if(messages[path] !== undefined)
            {
                for(let a=0;a<messages[path].length;a++)
                {
                    io.to(socket.id).emit("chat-message",messages[path][a]['data'],
                        messages[path][a]['sender'],messages[path][a]['socket-id-sender'])
                }
            }

        }); 

        //socket.to method in Socket.IO is used to send a message to all sockets in a specific room, except the sender.
        socket.on("signal",(toId,message) => {
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