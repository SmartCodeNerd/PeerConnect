import react from "react"

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
    
    return (
        <div>Video Meet-{window.location.href}</div>
    )
}