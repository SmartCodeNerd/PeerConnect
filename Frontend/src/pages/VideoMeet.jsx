import react from "react"
import '../styles/videoComponent.css'
import {useRef,useState,isChrome,useEffect} from "react";
import { TextField,Button } from "@mui/material";

const serverUrl = "http://localhost:3000";

let connections = {};

const peerConfigConnections = {
    "iceServers": [
        {"urls":"stun:stun.l.google.com.19302"}
    ]
}

export default function VideoMeetComponent() {
    let socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoRef = useRef();
    let [videoAvailable,setVideoAvailable] = useState(true);
    let [audioAvailable,setAudioAvailable] = useState(true);
    let [video,setVideo] = useState([]);
    let [audio,setAudio] = useState();
    let [screen,setScreen] = useState();
    let [showModal,setShowModal] = useState();
    let [screenAvailable,setScreenAvailable] = useState();
    let [messages,setMessages] = useState([]);
    let [message,setMessage] = useState([]);
    let [newMessage,setNewMessage] = useState(0);
    let [askForUsername,setAskForUsername] = useState(true);
    let [username,setUsername] = useState("");
    let [videos,setVideos] = useState();

    const videoRef = useRef();

    //Checking that the current browser is Chromium based or not...for WebRTC's working
    if(isChrome === false) {}
    
    const getPermissions = async () => {
        try {
            //Taking Video Permission
            const videoPermission = await navigator.mediaDevices.getUserMedia({video:true});
            if(videoPermission) {
                setVideoAvailable(true);
            } 
            else {
                setVideoAvailable(false);
            }
            //Taking Audio Permission
            const audioPermission = await navigator.mediaDevices.getUserMedia({audio:true});
            if(audioPermission) {
                setAudioAvailable(true);
            }
            else {
                setAudioAvailable(false);
            }   
            //This is for screen share..not taking permission but asking for which screen to share
            if(navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            }
            else {
                setScreenAvailable(false);
            }
            if(videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({video:videoAvailable,audio:audioAvailable});

                if(userMediaStream) {
                    window.localStream = userMediaStream;
                    if(localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }
        }
        catch(err) {
            console.log("err",err);
        }
    }

    let getUserMediaSuccess = async (stream) => {
        try{
            window.localStream.getTracks().forEach(track => track.stop());
        }
        catch(e) {
            console.log("Error-",e);
        }
        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for(id in connections) {
            if(id === socketIdRef.current) continue;
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                    .then(() => {
                        socketIdRef.current.emit("signal",id,JSON.stringify({"sdp":connections[id].localDescription}));
                    })
                    .catch(e => console.log("Error-",e));
                });
            }
        stream.getTracks.forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
            catch(e){
                console.log("Error-",e)
            }
            //Todo Blacksilence

            for(id in connections) {
                connections[id].addStream(window.localStream);
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                    .then(()=>{
                        socketRef.current.emit("signal",id,JSON.stringify({"sdp":connections[id].localDescription}))
                    })
                    .catch(e => console.log("Error-",e));
                })
            }
        })
    }
    //For Audio there is Audio Context...and for video there is Canvas
    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();//It basically generates a constant tone
    }

    let getUserMedia = async () => {
        try {
        if((video && videoAvailable) || (audio && audioAvailable)) {
                navigator.mediaDevices.getUserMedia({video:true,audio:true});
        }
        else {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop);
        }
        }
        catch(e) {
            console.log(e);
        }
    }

    useEffect(() => {
        getPermissions();
    },[])
    

    //Whenever the audio or the video changes,this getUserMedia will execute automatically...
    useEffect(() => {
        if(video != undefined && audio != undefined) {
                getUserMedia();
        }
    },[video,audio]);

    let gotMessageFromServer = (fromId,message) => {
        let signal = JSON.parse(message);

        if(fromId != socketIdRef.current) {
            if(signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                        if(signal.sdp.type === "offer") {
                            connections[fromId].createAnswer().then((description) => {
                                connections[fromId].setLocalDescription(description).then(() => {
                                    socketIdRef.current.emit("signal",fromId,JSON.stringify({"sdp":connections[fromId].localDescription}));
                                })
                                // .catch(e) {
                                //     console.log("Error-",e);
                                // }
                            })
                            // .catch(e) {
                            //     console.log("Error-",e);
                            // }
                        }
                })
                .catch(e => console.log("Error-",e));
            }
            if(signal.ice) {
                connections[fromId]
                .addIceCandidate(new RTCIceCandidate(signal.ice))
                .catch(e=>console.log("Error",e))
            }
        }   
    }

    //addMessages

    let addMessage = () => {

    }


    let connectToSocketServer = () => {
        socketRef.current = io.connect(serverUrl,{ secure:false });
        socketRef.current.on('signal',gotMessageFromServer);    
        socketRef.current.on("connect",() => {
            socketRef.current.emit("join-call",window.location.href);
            socketIdRef.current = socketRef.current.id;
            socketRef.current.on("chat-message",addMessage);
            socketRef.current.on("user-left",(id) => {
                setVideo((videos)=>videos.filter((video)=>video.socketId != id));
            });
            socketRef.current.on("user-joined",(id,clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

                    connections[socketListId].onicecandidate = (event) => {
                        if(event.candidate != null) {
                            socketRef.current.emit("signal",socketListId,JSON.stringify({'ice':event.candidate}));
                        }
                    }

                    connections[socketListId].onnaddstream = (event) => {
                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if(videoExists) {
                            setVideo(videos => {
                                const updatedVideos = videos.map(video => 
                                    video.socketId === socketListId ? { ...video , stream:event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos
                            })
                        } else {
                            let newVideo = {
                                socketId:socketListId,
                                stream:event.stream,
                                autoPlay:true,
                                playsinline:true
                            }
                            setVideos(videos=>{
                                const updatedVideos = [...videos,newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            })
                        }
                    };
                    
                    if(window.localStream != undefined && window.localStream != null) {
                        connections[socketListId].addStream(window.localStream);
                    }
                    else {
                        //When Video is turned off...a black screen is displayed
                        //let blackSilence = 
                    }                    
                })

                if(id === socketIdRef.current) {
                    for(let id2 in connections) {
                        //socketIdRef.current -> means self...
                        if(id2 === socketIdRef.current) continue;
                        try {
                            connections[id2].addStream(window.localStream);
                        }
                        catch(e) {

                        }
                        connections[id2].createOffer().then((description)=>{
                            connections[id2].setLocalDescription(description)
                            .then(()=>{
                                //Main code for handshaking process...sdp->session description  
                                socketRef.current.emit("signal",id2,JSON.stringify({"sdp":connections[id2].localDescription}));
                            })
                            .catch((e) => {
                                console.log("Error",e); 
                            })
                        })
                    }
                }
            })
        })
    }

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    return (
        <div>
            {askForUsername === true ? 
            <div className="videoParent">
                <h2>Enter Into Lobby</h2><br></br>
                <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
                <Button variant="contained" onClick={connectToSocketServer}>Connect</Button>
                 
                <div className="videoDiv">
                    <video ref={localVideoRef} autoPlay muted></video>
                </div>
            </div> 
            : 
            <></>
        }
        </div>
    )
}