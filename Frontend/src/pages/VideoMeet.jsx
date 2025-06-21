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
    let [videoAvailable,setVideoAvailable] = useState(false);
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
            const videoPermission = await navigator.mediaDevices.getUserMedia({video:true});
            if(videoPermission) {
                setVideoAvailable(true);
            }
            else {
                setVideoAvailable(false);
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({audio:true});
            if(audioPermission) {
                setAudioAvailable(true);
            }
            else {
                setAudioAvailable(false);
            }
        }
        catch(err) {

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
                 
                <div>
                    <video ref={localVideoRef} autoplay muted></video>
                </div>
            </div> 
            : 
            <></>
        }
        </div>
    )
}