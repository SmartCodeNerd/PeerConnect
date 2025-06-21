import react from "react"
import '../styles/videoComponent.css'

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
    if(isChrome() === false) {}
    
    return (
        // {askForUsername === true ? 
        //     <div>


        //     </div> 
        //     : 
        //     <></>
        // }
        <div>Hello</div>
    )
}