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
    let [video,setVideo] = useState();
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
            console.log(err);
        }
    }

    useEffect(() => {
        getPermissions();
    },[])

    return (
        <div>
            {askForUsername === true ? 
            <div>
                <h2>Enter Into Lobby</h2><br></br>
                <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
                <Button variant="contained">Connect</Button>
                 
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