// "use client"

// import { useEffect, useRef, useState,useContext } from "react"
// import io from "socket.io-client"
// import {
//   Video,
//   VideoOff,
//   Mic,
//   MicOff,
//   Monitor,
//   MonitorOff,
//   MessageCircle,
//   Phone,
//   Users,
//   Star,
//   Heart,
//   MoreHorizontal,
//   ChevronDown,
//   Copy,
//   Send,
//   X,
// } from "lucide-react"
// import { useNavigate,useLocation } from "react-router-dom"
// import { AuthContext } from "../contexts/AuthContext";
// import withAuth from '../utils/withAuth';

// const serverUrl = "http://localhost:3000"

// const connections = {}
// const signalBuffer = {}
// const peerConfig = {
//   iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
// }

// function VideoMeetComponent() {
//   const navigate = useNavigate()
//   const socketRef = useRef()
//   const socketIdRef = useRef()
//   const localVideoRef = useRef()

//   const [username, setUsername] = useState("")
//   const [askForUsername, setAskForUsername] = useState(true)

//   const [videoAvailable, setVideoAvailable] = useState(true)
//   const [audioAvailable, setAudioAvailable] = useState(true)
//   const [video, setVideo] = useState(true)
//   const [audio, setAudio] = useState(true)
//   const [screenAvailable, setScreenAvailable] = useState(false)
//   const [screen, setScreen] = useState(false)

//   const [showModal, setShowModal] = useState(false)
//   const [newMessage, setNewMessage] = useState(0)
//   const [videos, setVideos] = useState([])
//   const [chatMessages, setChatMessages] = useState([])
//   const [chatInput, setChatInput] = useState("")
//   const [audioDevices, setAudioDevices] = useState([])
//   const [videoDevices, setVideoDevices] = useState([])
//   const [selectedAudio, setSelectedAudio] = useState("")
//   const [selectedVideo, setSelectedVideo] = useState("")

//   const [meetingCode, setMeetingCode] = useState("")
//   const [meetingTime, setMeetingTime] = useState("00:00")
//   const [startTime, setStartTime] = useState(null)
//   const { addToUserHistory } = useContext(AuthContext);
//   const location = useLocation();
//   const { meetCode } = location.state || {};



//   const getPermissions = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//       window.localStream = stream
//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = stream
//       }
//       setVideoAvailable(true)
//       setAudioAvailable(true)
//       setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia)

//       // List devices
//       const devices = await navigator.mediaDevices.enumerateDevices()
//       const audioInputs = devices.filter((d) => d.kind === "audioinput")
//       const videoInputs = devices.filter((d) => d.kind === "videoinput")
//       setAudioDevices(audioInputs)
//       setVideoDevices(videoInputs)
//       if (audioInputs.length) setSelectedAudio(audioInputs[0].deviceId)
//       if (videoInputs.length) setSelectedVideo(videoInputs[0].deviceId)
//     } catch (error) {
//       console.error("Media permission error:", error)
//     }
//   }

//   const getUserMedia = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video, audio })
//       window.localStream = stream
//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = stream
//       }

//       for (const id in connections) {
//         if (id === socketIdRef.current) continue
//         window.localStream.getTracks().forEach((track) => {
//           connections[id].addTrack(track, window.localStream)
//         })
//       }
//     } catch (err) {
//       console.error("Error accessing media devices:", err)
//     }
//   }

//   const gotMessageFromServer = async (fromId, message) => {
//     const signal = JSON.parse(message)
//     let connection = connections[fromId]

//     // If no connection exists, create it and set up handlers
//     if (!connection) {
//       connection = new RTCPeerConnection(peerConfig)
//       connections[fromId] = connection

//       // ICE candidate handling
//       connection.onicecandidate = (e) => {
//         if (e.candidate) {
//           socketRef.current.emit("signal", fromId, JSON.stringify({ ice: e.candidate }))
//         }
//       }

//       // Handle remote tracks
//       connection.ontrack = (event) => {
//         const remoteStream = event.streams[0]
//         console.log("Received remote stream for", fromId, remoteStream)
//         setVideos((prev) => {
//           // Check if this stream already exists to prevent duplicates
//           const existingIndex = prev.findIndex((v) => v.socketId === fromId)
//           if (existingIndex !== -1) {
//             // Update existing stream
//             const updated = [...prev]
//             updated[existingIndex] = { socketId: fromId, stream: remoteStream }
//             return updated
//           }
//           return [...prev, { socketId: fromId, stream: remoteStream }]
//         })
//       }

//       // Add local tracks to connection
//       if (window.localStream) {
//         window.localStream.getTracks().forEach((track) => {
//           connection.addTrack(track, window.localStream)
//         })
//       }
//     }

//     console.log("Signal received from", fromId, signal)

//     try {
//       if (signal.sdp) {
//         const remoteDesc = new RTCSessionDescription(signal.sdp)
//         if (signal.sdp.type === "offer") {
//           await connection.setRemoteDescription(remoteDesc)
//           const answer = await connection.createAnswer()
//           await connection.setLocalDescription(answer)
//           socketRef.current.emit("signal", fromId, JSON.stringify({ sdp: answer }))
//           console.log("Sent answer to", fromId, answer)
//         } else if (signal.sdp.type === "answer") {
//           await connection.setRemoteDescription(remoteDesc)
//         }
//       }

//       if (signal.ice) {
//         await connection.addIceCandidate(new RTCIceCandidate(signal.ice))
//       }
//     } catch (err) {
//       console.error("⚠️ WebRTC signal error:", err)
//     }
//   }

//   const connectToSocketServer = () => {
//     socketRef.current = io(serverUrl)

//     socketRef.current.on("connect", () => {
//       console.log("Socket connected:", socketRef.current.id)
//       socketIdRef.current = socketRef.current.id
//       socketRef.current.emit("join-call", window.location.href)
//     })

//     socketRef.current.on("signal", gotMessageFromServer)

//     socketRef.current.on("user-left", (id) => {
//       if (connections[id]) {
//         connections[id].close()
//         delete connections[id]
//       }
//       setVideos((prev) => prev.filter((v) => v.socketId !== id))
//     })

//     socketRef.current.on("user-joined", ({ id, clients }) => {
//       ;(clients || []).forEach((socketListId) => {
//         if (socketListId === socketIdRef.current) return // Don't connect to self
//         if (connections[socketListId]) return

//         const connection = new RTCPeerConnection(peerConfig)
//         connections[socketListId] = connection

//         // ICE candidate handling
//         connection.onicecandidate = (e) => {
//           if (e.candidate) {
//             socketRef.current.emit("signal", socketListId, JSON.stringify({ ice: e.candidate }))
//           }
//         }

//         // Handle remote tracks
//         connection.ontrack = (event) => {
//           const remoteStream = event.streams[0]
//           console.log("Received remote stream for", socketListId, remoteStream)
//           setVideos((prev) => {
//             // Check if this stream already exists to prevent duplicates
//             const existingIndex = prev.findIndex((v) => v.socketId === socketListId)
//             if (existingIndex !== -1) {
//               // Update existing stream
//               const updated = [...prev]
//               updated[existingIndex] = { socketId: socketListId, stream: remoteStream }
//               return updated
//             }
//             return [...prev, { socketId: socketListId, stream: remoteStream }]
//           })
//         }

//         // Add local tracks to connection
//         if (window.localStream) {
//           window.localStream.getTracks().forEach((track) => {
//             connection.addTrack(track, window.localStream)
//           })
//         }

//         console.log("Added local tracks to connection", socketListId, window.localStream.getTracks())

//         // Replay any buffered signals
//         if (signalBuffer[socketListId]) {
//           signalBuffer[socketListId].forEach((signal) => {
//             gotMessageFromServer(socketListId, JSON.stringify(signal))
//           })
//           delete signalBuffer[socketListId]
//         }
//       })

//       // If this is the local user, create offers to all others
//       if (id === socketIdRef.current) {
//         for (const id2 in connections) {
//           if (id2 === socketIdRef.current) continue
//           console.log("Creating offer/answer for", id2)
//           connections[id2].createOffer().then((description) => {
//             connections[id2].setLocalDescription(description).then(() => {
//               socketRef.current.emit("signal", id2, JSON.stringify({ sdp: description }))
//             })
//           })
//         }
//       }
//     })
//   }

//   const getMedia = async () => {
//     setAskForUsername(false)
//     await getUserMedia();
//     await addToUserHistory(meetCode);
//     console.log("In Get Media",meetCode);
//     connectToSocketServer()
//   }

//   const handleAudioChange = async (e) => {
//     setSelectedAudio(e.target.value)
//     const stream = await navigator.mediaDevices.getUserMedia({
//       video: { deviceId: selectedVideo ? { exact: selectedVideo } : undefined },
//       audio: { deviceId: { exact: e.target.value } },
//     })
//     window.localStream = stream
//     if (localVideoRef.current) localVideoRef.current.srcObject = stream
//   }

//   const handleVideoChange = async (e) => {
//     setSelectedVideo(e.target.value)
//     const stream = await navigator.mediaDevices.getUserMedia({
//       video: { deviceId: { exact: e.target.value } },
//       audio: { deviceId: selectedAudio ? { exact: selectedAudio } : undefined },
//     })
//     window.localStream = stream
//     if (localVideoRef.current) localVideoRef.current.srcObject = stream
//   }

//   const sendChatMessage = () => {
//     if (chatInput.trim() && socketRef.current) {
//       socketRef.current.emit("chat-message", chatInput, username || "Anonymous")
//       setChatInput("")
//     }
//   }

//   const startScreenShare = async () => {
//     try {
//       const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
//       setScreen(true)

//       for (const id in connections) {
//         const sender = connections[id].getSenders().find((s) => s.track && s.track.kind === "video")
//         if (sender) {
//           sender.replaceTrack(screenStream.getVideoTracks()[0])
//         }
//       }
//       //Show Screen in Local Video
//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = screenStream
//       }

//       screenStream.getVideoTracks()[0].onended = async () => {
//         setScreen(false)
//         await getUserMedia()
//         // Replace back to camera in all peer connections
//         for (const id in connections) {
//           const sender = connections[id].getSenders().find((s) => s.track && s.track.kind === "video")
//           if (sender && window.localStream) {
//             sender.replaceTrack(window.localStream.getVideoTracks()[0])
//           }
//         }
//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = window.localStream
//         }
//       }
//     } catch (e) {
//       console.log("Screen Share Error", e)
//     }
//   }

//   const endCall = () => {
//     // Close All Peer Connections
//     for (const id in connections) {
//       if (connections[id]) {
//         connections[id].close()
//         delete connections[id]
//       }
//     }

//     // Stops All Local Media Tracks
//     if (window.localStream) {
//       window.localStream.getTracks().forEach((track) => {
//         console.log("Stopping track:", track)
//         track.stop()
//       })
//       window.localStream = null
//     }

//     // Extra: Stop all streams in all video elements (in case of browser bug)
//     document.querySelectorAll("video").forEach((video) => {
//       if (video.srcObject) {
//         try {
//           video.srcObject.getTracks().forEach((track) => track.stop())
//         } catch {}
//         video.srcObject = null
//       }
//     })

//     // Reset UI State
//     setVideos([])
//     setAskForUsername(true)
//     setShowModal(false)
//     setChatMessages([])
//     setNewMessage(0)
//     setVideo(false)
//     setAudio(false)

//     // Optionally disconnect the socket
//     if (socketRef.current) {
//       socketRef.current.disconnect()
//       socketRef.current = null
//     }

//     setTimeout(() => {
//       navigator.mediaDevices.enumerateDevices().then((devices) => {
//         console.log("Devices after cleanup:", devices)
//       })
//     }, 1000)

//     navigate("/afterCall",{
//       state:{
//         meetCode:meetCode,
//       }
//     })
//   }

//   // Optimized VideoPlayer component to prevent flickering
//   function VideoPlayer({ stream, socketId }) {
//     const ref = useRef()

//     useEffect(() => {
//       if (ref.current && stream) {
//         // Only set srcObject if it's different to prevent flickering
//         if (ref.current.srcObject !== stream) {
//           ref.current.srcObject = stream
//         }
//       }
//     }, [stream])

//     return (
//       <video
//         ref={ref}
//         autoPlay
//         playsInline
//         style={{
//           width: "100%",
//           height: "100%",
//           objectFit: "cover",
//           borderRadius: "1rem",
//           background: "#000",
//         }}
//       />
//     )
//   }

//   const toggleVideo = () => {
//     setVideo((prev) => {
//       const newState = !prev
//       if (window.localStream) {
//         window.localStream.getVideoTracks().forEach((track) => {
//           track.enabled = newState
//         })
//         // Force refresh local video element
//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = null
//           localVideoRef.current.srcObject = window.localStream
//         }
//       }
//       return newState
//     })
//   }

//   const toggleAudio = () => {
//     setAudio((prev) => {
//       const newState = !prev
//       if (window.localStream) {
//         window.localStream.getAudioTracks().forEach((track) => {
//           track.enabled = newState
//         })
//       }
//       return newState
//     })
//   }

//   useEffect(() => {
//     getPermissions()
//   }, [])

//   useEffect(() => {
//     // Generate meeting code from URL
//     const urlParts = window.location.href.split("/")
//     const code = urlParts[urlParts.length - 1] || "abc-defg-hij"
//     setMeetingCode(code)
//   }, [])

//   useEffect(() => {
//     if (!askForUsername && !startTime) {
//       setStartTime(Date.now())
//     }

//     const timer = setInterval(() => {
//       if (startTime) {
//         const elapsed = Date.now() - startTime
//         const minutes = Math.floor(elapsed / 60000)
//         const seconds = Math.floor((elapsed % 60000) / 1000)
//         setMeetingTime(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
//       }
//     }, 1000)

//     return () => clearInterval(timer)
//   }, [startTime, askForUsername])

//   // For Receiving Chat Messages
//   useEffect(() => {
//     if (!socketRef.current) return
//     socketRef.current.on("chat-message", (data, sender, senderId) => {
//       setChatMessages((prev) => [...prev, { data, sender, senderId }])
//       setNewMessage((prev) => prev + 1)
//     })
//     return () => {
//       if (socketRef.current) {
//         socketRef.current.off("chat-message")
//       }
//     }
//   }, [socketRef.current])

//   const copyMeetingCode = () => {
//     navigator.clipboard.writeText(meetingCode)
//   }

//   return (
//     <>
//       <style jsx>{`
//         * {
//           margin: 0;
//           padding: 0;
//           box-sizing: border-box;
//         }

//         .video-meet-container {
//           width: 100vw;
//           height: 100vh;
//           background: linear-gradient(to bottom right, #ff9a56, #ffad56, #ffc056);
//           position: fixed;
//           top: 0;
//           left: 0;
//           overflow: hidden;
//         }

//         /* Background decorative elements */
//         .video-meet-container::before {
//           content: "";
//           position: absolute;
//           top: -50%;
//           right: -50%;
//           width: 100%;
//           height: 100%;
//           background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
//           animation: float 6s ease-in-out infinite;
//         }

//         .video-meet-container::after {
//           content: "";
//           position: absolute;
//           bottom: -30%;
//           left: -30%;
//           width: 60%;
//           height: 60%;
//           background: radial-gradient(circle, rgba(255, 107, 53, 0.2) 0%, transparent 70%);
//           animation: float 8s ease-in-out infinite reverse;
//         }

//         @keyframes float {
//           0%, 100% { transform: translateY(0px) rotate(0deg); }
//           50% { transform: translateY(-20px) rotate(5deg); }
//         }

//         /* Header */
//         .lobby-header {
//           position: absolute;
//           top: 0;
//           left: 0;
//           right: 0;
//           height: 80px;
//           background: rgba(255, 255, 255, 0.95);
//           backdrop-filter: blur(10px);
//           border-bottom: 1px solid rgba(255, 107, 53, 0.2);
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           padding: 0 2rem;
//           z-index: 100;
//         }

//         .brand-section {
//           display: flex;
//           align-items: center;
//           gap: 1rem;
//         }

//         .brand-logo {
//           width: 3rem;
//           height: 3rem;
//           background: linear-gradient(135deg, #ff6b35, #f7931e, #ffd23f);
//           border-radius: 1rem;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
//         }

//         .brand-icon {
//           width: 1.75rem;
//           height: 1.75rem;
//           color: white;
//         }

//         .brand-text h1 {
//           font-size: 2rem;
//           font-weight: 700;
//           background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f);
//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//           background-clip: text;
//           margin: 0;
//         }

//         .brand-text p {
//           font-size: 0.75rem;
//           color: rgba(255, 107, 53, 0.8);
//           font-weight: 500;
//           margin: -0.25rem 0 0 0;
//         }

//         .user-info {
//           display: flex;
//           align-items: center;
//           gap: 1rem;
//           color: #374151;
//           font-weight: 500;
//         }

//         /* Lobby Layout */
//         .lobby-container {
//           width: 100vw;
//           height: 100vh;
//           display: grid;
//           grid-template-columns: 1fr 400px;
//           position: relative;
//           z-index: 10;
//         }

//         /* Video Section */
//         .video-section {
//           display: flex;
//           flex-direction: column;
//           justify-content: center;
//           align-items: center;
//           padding: 2rem;
//           padding-top: 120px;
//           padding-bottom: 120px;
//         }

//         .video-container {
//           position: relative;
//           width: 100%;
//           max-width: 800px;
//           aspect-ratio: 16/9;
//           background: #000;
//           border-radius: 2rem;
//           overflow: hidden;
//           box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
//           border: 3px solid rgba(255, 255, 255, 0.2);
//         }

//         .local-video {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//         }

//         .video-overlay {
//           position: absolute;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           background: linear-gradient(
//             to bottom,
//             rgba(0, 0, 0, 0.3) 0%,
//             transparent 30%,
//             transparent 70%,
//             rgba(0, 0, 0, 0.5) 100%
//           );
//           pointer-events: none;
//         }

//         .username-display {
//           position: absolute;
//           top: 1.5rem;
//           left: 1.5rem;
//           background: rgba(0, 0, 0, 0.7);
//           color: white;
//           padding: 0.75rem 1.25rem;
//           border-radius: 1rem;
//           font-size: 1.125rem;
//           font-weight: 600;
//           backdrop-filter: blur(10px);
//         }

//         .video-controls {
//           position: absolute;
//           bottom: 1.5rem;
//           left: 50%;
//           transform: translateX(-50%);
//           display: flex;
//           gap: 1rem;
//           align-items: center;
//         }

//         .control-btn {
//           width: 3.5rem;
//           height: 3.5rem;
//           border-radius: 50%;
//           border: none;
//           cursor: pointer;
//           transition: all 0.3s ease;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
//           backdrop-filter: blur(10px);
//         }

//         .control-btn-audio {
//           background: ${audio ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 107, 107, 0.9)"};
//           color: ${audio ? "white" : "white"};
//           border: 2px solid ${audio ? "rgba(255, 255, 255, 0.3)" : "transparent"};
//         }

//         .control-btn-video {
//           background: ${video ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 107, 107, 0.9)"};
//           color: ${video ? "white" : "white"};
//           border: 2px solid ${video ? "rgba(255, 255, 255, 0.3)" : "transparent"};
//         }

//         .control-btn-more {
//           background: rgba(255, 255, 255, 0.2);
//           color: white;
//           border: 2px solid rgba(255, 255, 255, 0.3);
//         }

//         .control-btn:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
//         }

//         /* Device Settings */
//         .device-settings {
//           margin-top: 2rem;
//           display: flex;
//           gap: 1rem;
//           justify-content: center;
//           flex-wrap: wrap;
//           max-width: 800px;
//           width: 100%;
//         }

//         .device-group {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           background: rgba(255, 255, 255, 0.9);
//           padding: 0.75rem 1rem;
//           border-radius: 0.5rem;
//           border: 1px solid rgba(0, 0, 0, 0.1);
//           box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
//           min-width: 180px;
//           flex: 1;
//           max-width: 250px;
//           cursor: pointer;
//           transition: all 0.2s ease;
//         }

//         .device-group:hover {
//           box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
//           border-color: rgba(255, 107, 53, 0.3);
//         }

//         .device-icon {
//           width: 1.125rem;
//           height: 1.125rem;
//           color: #5f6368;
//           flex-shrink: 0;
//         }

//         .device-select {
//           border: none;
//           background: transparent;
//           font-size: 0.875rem;
//           font-weight: 400;
//           color: #3c4043;
//           outline: none;
//           cursor: pointer;
//           flex: 1;
//           min-width: 0;
//           appearance: none;
//           text-overflow: ellipsis;
//           overflow: hidden;
//           white-space: nowrap;
//         }

//         .device-select option {
//           color: #3c4043;
//           background: white;
//           padding: 0.5rem;
//         }

//         .device-chevron {
//           width: 1rem;
//           height: 1rem;
//           color: #5f6368;
//           flex-shrink: 0;
//           margin-left: 0.25rem;
//         }

//         /* Join Panel */
//         .join-panel {
//           background: rgba(255, 255, 255, 0.95);
//           backdrop-filter: blur(20px);
//           border-left: 1px solid rgba(255, 107, 53, 0.2);
//           display: flex;
//           flex-direction: column;
//           justify-content: center;
//           align-items: center;
//           padding: 3rem 2rem;
//           position: relative;
//         }

//         .join-content {
//           text-align: center;
//           max-width: 300px;
//         }

//         .ready-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 0.5rem;
//           background: linear-gradient(45deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1));
//           padding: 0.5rem 1rem;
//           border-radius: 50px;
//           border: 2px solid rgba(255, 107, 53, 0.2);
//           margin-bottom: 2rem;
//         }

//         .badge-icon {
//           width: 1rem;
//           height: 1rem;
//         }

//         .badge-icon:first-child {
//           color: #ffd23f;
//           fill: currentColor;
//         }

//         .badge-icon:last-child {
//           color: #ff6b35;
//           fill: currentColor;
//         }

//         .badge-text {
//           color: #ff6b35;
//           font-weight: 500;
//           font-size: 0.875rem;
//         }

//         .ready-title {
//           font-size: 2.5rem;
//           font-weight: 700;
//           color: #374151;
//           margin-bottom: 1rem;
//         }

//         .ready-subtitle {
//           color: #6b7280;
//           font-size: 1.125rem;
//           margin-bottom: 2rem;
//           line-height: 1.6;
//         }

//         .username-input {
//           width: 100%;
//           padding: 1rem 1.5rem;
//           border: 2px solid rgba(255, 107, 53, 0.2);
//           border-radius: 1rem;
//           font-size: 1rem;
//           background: rgba(255, 255, 255, 0.8);
//           transition: all 0.3s ease;
//           outline: none;
//           margin-bottom: 2rem;
//         }

//         .username-input:focus {
//           border-color: #ff6b35;
//           box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
//           background: white;
//         }

//         .join-btn {
//           background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f, #e91e63);
//           background-size: 300% 300%;
//           animation: gradientButton 3s ease infinite;
//           color: white;
//           border: none;
//           padding: 1rem 3rem;
//           border-radius: 1rem;
//           font-size: 1.125rem;
//           font-weight: 600;
//           cursor: pointer;
//           transition: all 0.3s ease;
//           box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
//           width: 100%;
//         }

//         @keyframes gradientButton {
//           0% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//           100% { background-position: 0% 50%; }
//         }

//         .join-btn:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 12px 35px rgba(255, 107, 53, 0.6);
//         }

//         .join-btn:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//           transform: none;
//         }

//         /* Meeting Room Styles */
//         .meeting-container {
//           min-height: 100vh;
//           background: #1a1a1a;
//           position: relative;
//           display: flex;
//           flex-direction: column;
//         }

//         .meeting-content-fullscreen {
//           flex: 1;
//           position: relative;
//           width: 100%;
//           height: 100vh;
//           display: grid;
//           grid-template-columns: 1fr;
//           grid-template-rows: 1fr;
//         }

//         .video-grid-container {
//           position: relative;
//           width: 100%;
//           height: 100%;
//           padding: 1rem;
//           display: grid;
//           gap: 1rem;
//           grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
//           grid-auto-rows: minmax(200px, 1fr);
//           align-content: center;
//           justify-content: center;
//         }

//         .video-card {
//           background: #000;
//           border-radius: 1rem;
//           overflow: hidden;
//           position: relative;
//           border: 2px solid rgba(255, 255, 255, 0.1);
//           transition: all 0.3s ease;
//           min-height: 200px;
//         }

//         .video-card:hover {
//           border-color: rgba(255, 107, 53, 0.5);
//           transform: translateY(-2px);
//           box-shadow: 0 8px 25px rgba(255, 107, 53, 0.2);
//         }

//         .video-card.local {
//           border-color: rgba(255, 107, 53, 0.5);
//           box-shadow: 0 4px 15px rgba(255, 107, 53, 0.2);
//         }

//         .video-label {
//           position: absolute;
//           bottom: 1rem;
//           left: 1rem;
//           background: rgba(0, 0, 0, 0.8);
//           color: white;
//           padding: 0.5rem 1rem;
//           border-radius: 0.5rem;
//           font-size: 0.875rem;
//           font-weight: 500;
//           z-index: 10;
//         }

//         .local-video-meeting {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//         }

//         .video-off-overlay {
//           position: absolute;
//           top: 0;
//           left: 0;
//           width: 100%;
//           height: 100%;
//           background: #333;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-direction: column;
//           gap: 1rem;
//         }

//         .video-off-overlay span {
//           color: rgba(255, 255, 255, 0.7);
//           font-size: 0.875rem;
//         }

//         /* Meeting Info Panel */
//         .meeting-info-panel {
//           position: absolute;
//           bottom: 2rem;
//           left: 2rem;
//           display: flex;
//           flex-direction: column;
//           gap: 0.5rem;
//           z-index: 50;
//         }

//         .meeting-time {
//           color: white;
//           font-size: 1.125rem;
//           font-weight: 500;
//         }

//         .meeting-code-section {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           background: rgba(0, 0, 0, 0.7);
//           padding: 0.5rem 0.75rem;
//           border-radius: 0.5rem;
//           backdrop-filter: blur(10px);
//         }

//         .meeting-code-text {
//           color: white;
//           font-size: 0.875rem;
//           font-family: monospace;
//         }

//         .copy-code-btn {
//           background: none;
//           border: none;
//           color: rgba(255, 255, 255, 0.7);
//           cursor: pointer;
//           padding: 0.25rem;
//           border-radius: 0.25rem;
//           transition: all 0.2s ease;
//         }

//         .copy-code-btn:hover {
//           color: white;
//           background: rgba(255, 255, 255, 0.1);
//         }

//         .controls-container {
//           position: fixed;
//           bottom: 2rem;
//           left: 50%;
//           transform: translateX(-50%);
//           background: rgba(0, 0, 0, 0.8);
//           backdrop-filter: blur(20px);
//           border-radius: 2rem;
//           padding: 1rem 1.5rem;
//           display: flex;
//           gap: 0.75rem;
//           border: 1px solid rgba(255, 255, 255, 0.1);
//           box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
//           z-index: 100;
//         }

//         .meeting-control-btn {
//           width: 3rem;
//           height: 3rem;
//           border-radius: 50%;
//           border: none;
//           cursor: pointer;
//           transition: all 0.3s ease;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           position: relative;
//           box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
//         }

//         .control-btn-mic {
//           background: ${audio ? "rgba(255, 255, 255, 0.1)" : "#ea4335"};
//           color: white;
//         }

//         .control-btn-cam {
//           background: ${video ? "rgba(255, 255, 255, 0.1)" : "#ea4335"};
//           color: white;
//         }

//         .control-btn-screen {
//           background: ${screen ? "#34a853" : "rgba(255, 255, 255, 0.1)"};
//           color: white;
//         }

//         .control-btn-chat {
//           background: rgba(255, 255, 255, 0.1);
//           color: white;
//           position: relative;
//         }

//         .control-btn-more {
//           background: rgba(255, 255, 255, 0.1);
//           color: white;
//         }

//         .control-btn-end {
//           background: #ea4335;
//           color: white;
//         }

//         .meeting-control-btn:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
//         }

//         .chat-badge {
//           position: absolute;
//           top: -0.25rem;
//           right: -0.25rem;
//           background: #ea4335;
//           color: white;
//           border-radius: 50%;
//           width: 1.25rem;
//           height: 1.25rem;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-size: 0.625rem;
//           font-weight: 600;
//           border: 2px solid rgba(0, 0, 0, 0.8);
//         }

//         /* Chat Modal - Right Side */
//         .chat-modal-right {
//           position: fixed;
//           top: 0;
//           right: 0;
//           width: 400px;
//           height: 100vh;
//           background: white;
//           box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
//           z-index: 1000;
//           display: flex;
//           flex-direction: column;
//         }

//         .chat-header {
//           padding: 1rem 1.5rem;
//           border-bottom: 1px solid #e5e7eb;
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//         }

//         .chat-title {
//           font-size: 1.125rem;
//           font-weight: 500;
//           color: #1f2937;
//           margin: 0;
//         }

//         .chat-close-btn {
//           background: none;
//           border: none;
//           color: #6b7280;
//           cursor: pointer;
//           padding: 0.5rem;
//           border-radius: 0.5rem;
//           transition: all 0.2s ease;
//         }

//         .chat-close-btn:hover {
//           background: #f3f4f6;
//           color: #374151;
//         }

//         .chat-body {
//           flex: 1;
//           padding: 1rem 1.5rem;
//           overflow-y: auto;
//           display: flex;
//           flex-direction: column;
//           gap: 1rem;
//         }

//         .chat-info {
//           padding: 1rem;
//           background: #f9fafb;
//           border-radius: 0.5rem;
//           border: 1px solid #e5e7eb;
//         }

//         .chat-info p {
//           margin: 0 0 0.5rem 0;
//           color: #374151;
//           font-weight: 500;
//         }

//         .chat-description {
//           font-size: 0.875rem;
//           color: #6b7280;
//           line-height: 1.4;
//         }

//         .chat-message {
//           padding: 0.75rem;
//           background: #f3f4f6;
//           border-radius: 0.5rem;
//           margin-bottom: 0.5rem;
//         }

//         .chat-sender {
//           font-weight: 600;
//           color: #374151;
//           margin-bottom: 0.25rem;
//           font-size: 0.875rem;
//         }

//         .chat-text {
//           color: #6b7280;
//           font-size: 0.875rem;
//         }

//         .chat-input-container {
//           padding: 1rem 1.5rem;
//           border-top: 1px solid #e5e7eb;
//           display: flex;
//           gap: 0.75rem;
//           align-items: center;
//         }

//         .chat-input {
//           flex: 1;
//           padding: 0.75rem 1rem;
//           border: 1px solid #d1d5db;
//           border-radius: 1.5rem;
//           outline: none;
//           font-size: 0.875rem;
//           background: #f9fafb;
//           transition: all 0.2s ease;
//         }

//         .chat-input:focus {
//           border-color: #3b82f6;
//           background: white;
//         }

//         .chat-send-btn {
//           background: #3b82f6;
//           color: white;
//           border: none;
//           padding: 0.75rem;
//           border-radius: 50%;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }

//         .chat-send-btn:hover {
//           background: #2563eb;
//         }

//         /* Responsive Design */
//         @media (max-width: 1024px) {
//           .lobby-container {
//             grid-template-columns: 1fr 350px;
//           }
          
//           .chat-modal-right {
//             width: 350px;
//           }
//         }

//         @media (max-width: 768px) {
//           .lobby-container {
//             grid-template-columns: 1fr;
//             grid-template-rows: 1fr auto;
//           }

//           .join-panel {
//             border-left: none;
//             border-top: 1px solid rgba(255, 107, 53, 0.2);
//             padding: 2rem;
//           }

//           .video-section {
//             padding: 1rem;
//             padding-top: 100px;
//             padding-bottom: 1rem;
//           }

//           .device-settings {
//             flex-direction: column;
//             align-items: center;
//             gap: 1rem;
//           }

//           .ready-title {
//             font-size: 2rem;
//           }

//           .video-grid-container {
//             grid-template-columns: 1fr;
//             padding: 0.5rem;
//           }

//           .controls-container {
//             padding: 0.75rem 1rem;
//             gap: 0.75rem;
//           }

//           .meeting-control-btn {
//             width: 2.5rem;
//             height: 2.5rem;
//           }

//           .chat-modal-right {
//             width: 100%;
//             height: 80vh;
//             top: 20vh;
//           }
//         }
//       `}</style>

//       <div className="video-meet-container">
//         {askForUsername ? (
//           <>
//             {/* Header */}
//             <div className="lobby-header">
//               <div className="brand-section">
//                 <div className="brand-logo">
//                   <Video className="brand-icon" />
//                 </div>
//                 <div className="brand-text">
//                   <h1>Mulakaat</h1>
//                   <p>मुलाकात</p>
//                 </div>
//               </div>
//               <div className="user-info">
//                 <span>Ready to connect with warmth & joy</span>
//               </div>
//             </div>

//             {/* Lobby Layout */}
//             <div className="lobby-container">
//               {/* Video Section */}
//               <div className="video-section">
//                 <div className="video-container">
//                   <video ref={localVideoRef} autoPlay muted playsInline className="local-video" />
//                   <div className="video-overlay" />

//                   {username && <div className="username-display">{username}</div>}

//                   <div className="video-controls">
//                     <button className="control-btn control-btn-audio" onClick={toggleAudio}>
//                       {audio ? <Mic size={20} /> : <MicOff size={20} />}
//                     </button>
//                     <button className="control-btn control-btn-video" onClick={toggleVideo}>
//                       {video ? <Video size={20} /> : <VideoOff size={20} />}
//                     </button>
//                     <button className="control-btn control-btn-more">
//                       <MoreHorizontal size={20} />
//                     </button>
//                   </div>
//                 </div>

//                 <div className="device-settings">
//                   <div className="device-group">
//                     <Mic className="device-icon" />
//                     <select className="device-select" value={selectedAudio} onChange={handleAudioChange}>
//                       {audioDevices.map((device) => (
//                         <option key={device.deviceId} value={device.deviceId}>
//                           {device.label || "Microphone"}
//                         </option>
//                       ))}
//                     </select>
//                     <ChevronDown className="device-chevron" />
//                   </div>
//                   <div className="device-group">
//                     <Users className="device-icon" />
//                     <select className="device-select">
//                       <option>Speakers (Default)</option>
//                     </select>
//                     <ChevronDown className="device-chevron" />
//                   </div>
//                   <div className="device-group">
//                     <Video className="device-icon" />
//                     <select className="device-select" value={selectedVideo} onChange={handleVideoChange}>
//                       {videoDevices.map((device) => (
//                         <option key={device.deviceId} value={device.deviceId}>
//                           {device.label || "HD Webcam"}
//                         </option>
//                       ))}
//                     </select>
//                     <ChevronDown className="device-chevron" />
//                   </div>
//                 </div>
//               </div>

//               {/* Join Panel */}
//               <div className="join-panel">
//                 <div className="join-content">
//                   <div className="ready-badge">
//                     <Star className="badge-icon" />
//                     <span className="badge-text">Ready to join?</span>
//                     <Heart className="badge-icon" />
//                   </div>

//                   <h2 className="ready-title">Join Meeting</h2>
//                   <p className="ready-subtitle">Enter your name and join the conversation with warmth and joy</p>

//                   <input
//                     type="text"
//                     className="username-input"
//                     placeholder="Your name"
//                     value={username}
//                     onChange={(e) => setUsername(e.target.value)}
//                   />

//                   <button className="join-btn" onClick={getMedia} disabled={!username.trim()}>
//                     Join Now
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className="meeting-container">
//             {/* Meeting Content - Full Screen with Grid */}
//             <div className="meeting-content-fullscreen">
//               <div className="video-grid-container">
//                 {/* Local Video */}
//                 <div className="video-card local">
//                   <video ref={localVideoRef} autoPlay muted playsInline className="local-video-meeting" />
//                   {!video && (
//                     <div className="video-off-overlay">
//                       <Users size={60} color="white" />
//                       <span>Camera is off</span>
//                     </div>
//                   )}
//                   <div className="video-label">You ({username})</div>
//                 </div>

//                 {/* Remote Videos - Show all participants */}
//                 {videos.map(({ socketId, stream }) => (
//                   <div className="video-card" key={socketId}>
//                     <VideoPlayer stream={stream} socketId={socketId} />
//                     <div className="video-label">{socketId}</div>
//                   </div>
//                 ))}
//               </div>

//               {/* Meeting Info - Bottom Left */}
//               <div className="meeting-info-panel">
//                 <div className="meeting-time">{meetingTime}</div>
//                 <div className="meeting-code-section">
//                   <span className="meeting-code-text">{meetingCode}</span>
//                   <button className="copy-code-btn" onClick={copyMeetingCode}>
//                     <Copy size={16} />
//                   </button>
//                 </div>
//               </div>

//               {/* Controls */}
//               <div className="controls-container">
//                 <button className="meeting-control-btn control-btn-mic" onClick={toggleAudio}>
//                   {audio ? <Mic size={20} /> : <MicOff size={20} />}
//                 </button>
//                 <button className="meeting-control-btn control-btn-cam" onClick={toggleVideo}>
//                   {video ? <Video size={20} /> : <VideoOff size={20} />}
//                 </button>
//                 <button
//                   className="meeting-control-btn control-btn-screen"
//                   onClick={screen ? undefined : startScreenShare}
//                   disabled={screen}
//                 >
//                   {screen ? <MonitorOff size={20} /> : <Monitor size={20} />}
//                 </button>
//                 <button className="meeting-control-btn control-btn-chat" onClick={() => setShowModal(!showModal)}>
//                   <MessageCircle size={20} />
//                   {newMessage > 0 && <div className="chat-badge">{newMessage}</div>}
//                 </button>
//                 <button className="meeting-control-btn control-btn-more">
//                   <MoreHorizontal size={20} />
//                 </button>
//                 <button className="meeting-control-btn control-btn-end" onClick={endCall}>
//                   <Phone size={20} />
//                 </button>
//               </div>
//             </div>

//             {/* Chat Modal - Right Side */}
//             {showModal && (
//               <div className="chat-modal-right">
//                 <div className="chat-header">
//                   <h3 className="chat-title">In-call messages</h3>
//                   <button className="chat-close-btn" onClick={() => setShowModal(false)}>
//                     <X size={20} />
//                   </button>
//                 </div>
//                 <div className="chat-body">
//                   <div className="chat-info">
//                     <p>Let contributors send messages</p>
//                     <p className="chat-description">
//                       You can pin a message to make it visible for people who join later. When you leave the call, you
//                       won't be able to access this chat.
//                     </p>
//                   </div>
//                   {chatMessages.map((msg, idx) => (
//                     <div key={idx} className="chat-message">
//                       <div className="chat-sender">{msg.sender}</div>
//                       <div className="chat-text">{msg.data}</div>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="chat-input-container">
//                   <input
//                     type="text"
//                     className="chat-input"
//                     value={chatInput}
//                     onChange={(e) => setChatInput(e.target.value)}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") sendChatMessage()
//                     }}
//                     placeholder="Send a message"
//                   />
//                   <button className="chat-send-btn" onClick={sendChatMessage}>
//                     <Send size={16} />
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </>
//   )
// }

// export default withAuth(VideoMeetComponent);  


//---------------------

"use client"

import { useEffect, useRef, useState } from "react"
import io from "socket.io-client"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  MessageCircle,
  Users,
  MoreHorizontal,
  ChevronDown,
  Copy,
  Send,
  X,
  Hand,
  Captions,
  PhoneOff,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const serverUrl = "http://localhost:3000"

const connections = {}
const signalBuffer = {}
const peerConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
}

export default function VideoMeetComponent() {
  const navigate = useNavigate()
  const socketRef = useRef()
  const socketIdRef = useRef()
  const localVideoRef = useRef()

  const [username, setUsername] = useState("")
  const [askForUsername, setAskForUsername] = useState(true)

  const [videoAvailable, setVideoAvailable] = useState(true)
  const [audioAvailable, setAudioAvailable] = useState(true)
  const [video, setVideo] = useState(true)
  const [audio, setAudio] = useState(true)
  const [screenAvailable, setScreenAvailable] = useState(false)
  const [screen, setScreen] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [newMessage, setNewMessage] = useState(0)
  const [videos, setVideos] = useState([])
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState("")
  const [audioDevices, setAudioDevices] = useState([])
  const [videoDevices, setVideoDevices] = useState([])
  const [selectedAudio, setSelectedAudio] = useState("")
  const [selectedVideo, setSelectedVideo] = useState("")

  const [meetingCode, setMeetingCode] = useState("")
  const [meetingTime, setMeetingTime] = useState("00:00")
  const [startTime, setStartTime] = useState(null)

  const getPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      window.localStream = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      setVideoAvailable(true)
      setAudioAvailable(true)
      setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia)

      // List devices
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = devices.filter((d) => d.kind === "audioinput")
      const videoInputs = devices.filter((d) => d.kind === "videoinput")
      setAudioDevices(audioInputs)
      setVideoDevices(videoInputs)
      if (audioInputs.length) setSelectedAudio(audioInputs[0].deviceId)
      if (videoInputs.length) setSelectedVideo(videoInputs[0].deviceId)
    } catch (error) {
      console.error("Media permission error:", error)
    }
  }

  const getUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio })
      window.localStream = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      for (const id in connections) {
        if (id === socketIdRef.current) continue
        window.localStream.getTracks().forEach((track) => {
          connections[id].addTrack(track, window.localStream)
        })
      }
    } catch (err) {
      console.error("Error accessing media devices:", err)
    }
  }

  const gotMessageFromServer = async (fromId, message) => {
    const signal = JSON.parse(message)
    let connection = connections[fromId]

    // If no connection exists, create it and set up handlers
    if (!connection) {
      connection = new RTCPeerConnection(peerConfig)
      connections[fromId] = connection

      // ICE candidate handling
      connection.onicecandidate = (e) => {
        if (e.candidate) {
          socketRef.current.emit("signal", fromId, JSON.stringify({ ice: e.candidate }))
        }
      }

      // Handle remote tracks - Fixed to prevent flickering
      connection.ontrack = (event) => {
        const remoteStream = event.streams[0]
        console.log("Received remote stream for", fromId, remoteStream)

        // Use callback to prevent unnecessary re-renders
        setVideos((prev) => {
          const existingIndex = prev.findIndex((v) => v.socketId === fromId)
          if (existingIndex !== -1) {
            // Only update if stream is actually different
            if (prev[existingIndex].stream !== remoteStream) {
              const updated = [...prev]
              updated[existingIndex] = { socketId: fromId, stream: remoteStream }
              return updated
            }
            return prev
          }
          return [...prev, { socketId: fromId, stream: remoteStream }]
        })
      }

      // Add local tracks to connection
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => {
          connection.addTrack(track, window.localStream)
        })
      }
    }

    console.log("Signal received from", fromId, signal)

    try {
      if (signal.sdp) {
        const remoteDesc = new RTCSessionDescription(signal.sdp)
        if (signal.sdp.type === "offer") {
          await connection.setRemoteDescription(remoteDesc)
          const answer = await connection.createAnswer()
          await connection.setLocalDescription(answer)
          socketRef.current.emit("signal", fromId, JSON.stringify({ sdp: answer }))
          console.log("Sent answer to", fromId, answer)
        } else if (signal.sdp.type === "answer") {
          await connection.setRemoteDescription(remoteDesc)
        }
      }

      if (signal.ice) {
        await connection.addIceCandidate(new RTCIceCandidate(signal.ice))
      }
    } catch (err) {
      console.error("⚠️ WebRTC signal error:", err)
    }
  }

  const connectToSocketServer = () => {
    socketRef.current = io(serverUrl)

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id)
      socketIdRef.current = socketRef.current.id
      socketRef.current.emit("join-call", window.location.href)
    })

    socketRef.current.on("signal", gotMessageFromServer)

    socketRef.current.on("user-left", (id) => {
      if (connections[id]) {
        connections[id].close()
        delete connections[id]
      }
      setVideos((prev) => prev.filter((v) => v.socketId !== id))
    })

    socketRef.current.on("user-joined", ({ id, clients }) => {
      ;(clients || []).forEach((socketListId) => {
        if (socketListId === socketIdRef.current) return // Don't connect to self
        if (connections[socketListId]) return

        const connection = new RTCPeerConnection(peerConfig)
        connections[socketListId] = connection

        // ICE candidate handling
        connection.onicecandidate = (e) => {
          if (e.candidate) {
            socketRef.current.emit("signal", socketListId, JSON.stringify({ ice: e.candidate }))
          }
        }

        // Handle remote tracks - Fixed to prevent flickering
        connection.ontrack = (event) => {
          const remoteStream = event.streams[0]
          console.log("Received remote stream for", socketListId, remoteStream)

          setVideos((prev) => {
            const existingIndex = prev.findIndex((v) => v.socketId === socketListId)
            if (existingIndex !== -1) {
              if (prev[existingIndex].stream !== remoteStream) {
                const updated = [...prev]
                updated[existingIndex] = { socketId: socketListId, stream: remoteStream }
                return updated
              }
              return prev
            }
            return [...prev, { socketId: socketListId, stream: remoteStream }]
          })
        }

        // Add local tracks to connection
        if (window.localStream) {
          window.localStream.getTracks().forEach((track) => {
            connection.addTrack(track, window.localStream)
          })
        }

        console.log("Added local tracks to connection", socketListId, window.localStream.getTracks())

        // Replay any buffered signals
        if (signalBuffer[socketListId]) {
          signalBuffer[socketListId].forEach((signal) => {
            gotMessageFromServer(socketListId, JSON.stringify(signal))
          })
          delete signalBuffer[socketListId]
        }
      })

      // If this is the local user, create offers to all others
      if (id === socketIdRef.current) {
        for (const id2 in connections) {
          if (id2 === socketIdRef.current) continue
          console.log("Creating offer/answer for", id2)
          connections[id2].createOffer().then((description) => {
            connections[id2].setLocalDescription(description).then(() => {
              socketRef.current.emit("signal", id2, JSON.stringify({ sdp: description }))
            })
          })
        }
      }
    })
  }

  const getMedia = async () => {
    setAskForUsername(false)
    await getUserMedia()
    connectToSocketServer()
  }

  const handleAudioChange = async (e) => {
    setSelectedAudio(e.target.value)
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: selectedVideo ? { exact: selectedVideo } : undefined },
      audio: { deviceId: { exact: e.target.value } },
    })
    window.localStream = stream
    if (localVideoRef.current) localVideoRef.current.srcObject = stream
  }

  const handleVideoChange = async (e) => {
    setSelectedVideo(e.target.value)
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: e.target.value } },
      audio: { deviceId: selectedAudio ? { exact: selectedAudio } : undefined },
    })
    window.localStream = stream
    if (localVideoRef.current) localVideoRef.current.srcObject = stream
  }

  const sendChatMessage = () => {
    if (chatInput.trim() && socketRef.current) {
      socketRef.current.emit("chat-message", chatInput, username || "Anonymous")
      setChatInput("")
    }
  }

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      setScreen(true)

      for (const id in connections) {
        const sender = connections[id].getSenders().find((s) => s.track && s.track.kind === "video")
        if (sender) {
          sender.replaceTrack(screenStream.getVideoTracks()[0])
        }
      }
      //Show Screen in Local Video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream
      }

      screenStream.getVideoTracks()[0].onended = async () => {
        setScreen(false)
        await getUserMedia()
        // Replace back to camera in all peer connections
        for (const id in connections) {
          const sender = connections[id].getSenders().find((s) => s.track && s.track.kind === "video")
          if (sender && window.localStream) {
            sender.replaceTrack(window.localStream.getVideoTracks()[0])
          }
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = window.localStream
        }
      }
    } catch (e) {
      console.log("Screen Share Error", e)
    }
  }

  const endCall = () => {
    // Close All Peer Connections
    for (const id in connections) {
      if (connections[id]) {
        connections[id].close()
        delete connections[id]
      }
    }

    // Stops All Local Media Tracks
    if (window.localStream) {
      window.localStream.getTracks().forEach((track) => {
        console.log("Stopping track:", track)
        track.stop()
      })
      window.localStream = null
    }

    // Extra: Stop all streams in all video elements (in case of browser bug)
    document.querySelectorAll("video").forEach((video) => {
      if (video.srcObject) {
        try {
          video.srcObject.getTracks().forEach((track) => track.stop())
        } catch {}
        video.srcObject = null
      }
    })

    // Reset UI State
    setVideos([])
    setAskForUsername(true)
    setShowModal(false)
    setChatMessages([])
    setNewMessage(0)
    setVideo(false)
    setAudio(false)

    // Optionally disconnect the socket
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    setTimeout(() => {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        console.log("Devices after cleanup:", devices)
      })
    }, 1000)

    navigate("/afterCall")
  }

  // Optimized VideoPlayer component to prevent flickering and fix scaling
  const VideoPlayer = ({ stream, socketId }) => {
    const ref = useRef()

    useEffect(() => {
      if (ref.current && stream) {
        // Only set srcObject if it's different to prevent flickering
        if (ref.current.srcObject !== stream) {
          ref.current.srcObject = stream
        }
      }
    }, [stream])

    return (
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover", // Fixed scaling issue
          background: "#202124",
        }}
      />
    )
  }

  const toggleVideo = () => {
    setVideo((prev) => {
      const newState = !prev
      if (window.localStream) {
        window.localStream.getVideoTracks().forEach((track) => {
          track.enabled = newState
        })
      }
      return newState
    })
  }

  const toggleAudio = () => {
    setAudio((prev) => {
      const newState = !prev
      if (window.localStream) {
        window.localStream.getAudioTracks().forEach((track) => {
          track.enabled = newState
        })
      }
      return newState
    })
  }

  useEffect(() => {
    getPermissions()
  }, [])

  useEffect(() => {
    // Generate meeting code from URL
    const urlParts = window.location.href.split("/")
    const code = urlParts[urlParts.length - 1] || "abc-defg-hij"
    setMeetingCode(code)
  }, [])

  useEffect(() => {
    if (!askForUsername && !startTime) {
      setStartTime(Date.now())
    }

    const timer = setInterval(() => {
      if (startTime) {
        const elapsed = Date.now() - startTime
        const minutes = Math.floor(elapsed / 60000)
        const seconds = Math.floor((elapsed % 60000) / 1000)
        setMeetingTime(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime, askForUsername])

  // For Receiving Chat Messages
  useEffect(() => {
    if (!socketRef.current) return
    socketRef.current.on("chat-message", (data, sender, senderId) => {
      setChatMessages((prev) => [...prev, { data, sender, senderId }])
      setNewMessage((prev) => prev + 1)
    })
    return () => {
      if (socketRef.current) {
        socketRef.current.off("chat-message")
      }
    }
  }, [socketRef.current])

  const copyMeetingCode = () => {
    navigator.clipboard.writeText(meetingCode)
  }

  return (
    <>
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Google Meet Lobby Styles */
        .meet-lobby-container {
          width: 100vw;
          height: 100vh;
          background: #f9f9f9;
          display: flex;
          flex-direction: column;
          font-family: 'Google Sans', Roboto, Arial, sans-serif;
        }

        .meet-header {
          height: 64px;
          background: white;
          border-bottom: 1px solid #e8eaed;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          box-shadow: 0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15);
        }

        .meet-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #5f6368;
          font-size: 22px;
          font-weight: 400;
        }

        .meet-logo-icon {
          width: 32px;
          height: 32px;
          background: #1a73e8;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .meet-main {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 0;
        }

        .meet-video-section {
          background: #f9f9f9;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px;
        }

        .meet-video-preview {
          width: 100%;
          max-width: 640px;
          aspect-ratio: 16/9;
          background: #202124;
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15);
        }

        .meet-local-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1); /* Mirror effect like Google Meet */
        }

        .meet-video-overlay {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
        }

        .meet-control-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15);
        }

        .meet-control-btn:hover {
          transform: scale(1.08);
        }

        .meet-control-btn.mic-on {
          background: #fff;
          color: #3c4043;
        }

        .meet-control-btn.mic-off {
          background: #ea4335;
          color: white;
        }

        .meet-control-btn.cam-on {
          background: #fff;
          color: #3c4043;
        }

        .meet-control-btn.cam-off {
          background: #ea4335;
          color: white;
        }

        .meet-device-settings {
          margin-top: 24px;
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
          max-width: 640px;
          width: 100%;
        }

        .meet-device-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1px solid #dadce0;
          border-radius: 4px;
          padding: 8px 12px;
          min-width: 180px;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }

        .meet-device-selector:hover {
          border-color: #1a73e8;
        }

        .meet-device-icon {
          width: 20px;
          height: 20px;
          color: #5f6368;
        }

        .meet-device-select {
          border: none;
          background: transparent;
          outline: none;
          flex: 1;
          font-size: 14px;
          color: #3c4043;
          cursor: pointer;
        }

        .meet-join-panel {
          background: white;
          border-left: 1px solid #e8eaed;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .meet-join-content {
          text-align: center;
          max-width: 280px;
          width: 100%;
        }

        .meet-meeting-title {
          font-size: 24px;
          font-weight: 400;
          color: #3c4043;
          margin-bottom: 8px;
        }

        .meet-meeting-subtitle {
          font-size: 14px;
          color: #5f6368;
          margin-bottom: 32px;
        }

        .meet-name-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #dadce0;
          border-radius: 4px;
          font-size: 16px;
          outline: none;
          margin-bottom: 24px;
          transition: border-color 0.2s ease;
        }

        .meet-name-input:focus {
          border-color: #1a73e8;
          box-shadow: 0 0 0 1px #1a73e8;
        }

        .meet-join-btn {
          width: 100%;
          background: #1a73e8;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .meet-join-btn:hover:not(:disabled) {
          background: #1557b0;
        }

        .meet-join-btn:disabled {
          background: #f1f3f4;
          color: #9aa0a6;
          cursor: not-allowed;
        }

        /* Google Meet In-Meeting Styles */
        .meet-room-container {
          width: 100vw;
          height: 100vh;
          background: #202124;
          display: flex;
          flex-direction: column;
          font-family: 'Google Sans', Roboto, Arial, sans-serif;
        }

        .meet-room-header {
          height: 56px;
          background: #202124;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          border-bottom: 1px solid #3c4043;
        }

        .meet-room-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .meet-room-time {
          color: #e8eaed;
          font-size: 14px;
          font-weight: 400;
        }

        .meet-room-code {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #3c4043;
          padding: 6px 12px;
          border-radius: 4px;
          color: #e8eaed;
          font-size: 12px;
          font-family: monospace;
        }

        .meet-copy-btn {
          background: none;
          border: none;
          color: #9aa0a6;
          cursor: pointer;
          padding: 2px;
          border-radius: 2px;
          transition: color 0.2s ease;
        }

        .meet-copy-btn:hover {
          color: #e8eaed;
        }

        .meet-participants-count {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #9aa0a6;
          font-size: 14px;
        }

        .meet-video-grid {
          flex: 1;
          padding: 16px;
          display: grid;
          gap: 8px;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          grid-auto-rows: minmax(180px, 1fr);
          align-content: center;
          justify-content: center;
          overflow: hidden;
        }

        .meet-participant-tile {
          background: #202124;
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          border: 2px solid transparent;
          transition: border-color 0.2s ease;
        }

        .meet-participant-tile:hover {
          border-color: #5f6368;
        }

        .meet-participant-tile.speaking {
          border-color: #1a73e8;
        }

        .meet-participant-tile.local {
          border-color: #34a853;
        }

        .meet-participant-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: #202124;
        }

        .meet-participant-video.local {
          transform: scaleX(-1); /* Mirror local video */
        }

        .meet-participant-overlay {
          position: absolute;
          bottom: 8px;
          left: 8px;
          background: rgba(32, 33, 36, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          backdrop-filter: blur(4px);
        }

        .meet-participant-muted {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(234, 67, 53, 0.9);
          color: white;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .meet-video-off-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #3c4043;
          color: #9aa0a6;
          gap: 8px;
        }

        .meet-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #1a73e8;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: 500;
        }

        .meet-controls-bar {
          height: 80px;
          background: #202124;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 16px;
          border-top: 1px solid #3c4043;
        }

        .meet-control-button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          position: relative;
        }

        .meet-control-button:hover {
          transform: scale(1.1);
        }

        .meet-control-button.mic {
          background: ${audio ? "#3c4043" : "#ea4335"};
          color: ${audio ? "#e8eaed" : "white"};
        }

        .meet-control-button.camera {
          background: ${video ? "#3c4043" : "#ea4335"};
          color: ${video ? "#e8eaed" : "white"};
        }

        .meet-control-button.screen {
          background: ${screen ? "#1a73e8" : "#3c4043"};
          color: ${screen ? "white" : "#e8eaed"};
        }

        .meet-control-button.captions {
          background: #3c4043;
          color: #e8eaed;
        }

        .meet-control-button.hand {
          background: #3c4043;
          color: #e8eaed;
        }

        .meet-control-button.chat {
          background: #3c4043;
          color: #e8eaed;
        }

        .meet-control-button.more {
          background: #3c4043;
          color: #e8eaed;
        }

        .meet-control-button.end-call {
          background: #ea4335;
          color: white;
        }

        .meet-notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ea4335;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
          border: 2px solid #202124;
        }

        /* Chat Panel - Google Meet Style */
        .meet-chat-panel {
          position: fixed;
          top: 0;
          right: 0;
          width: 360px;
          height: 100vh;
          background: white;
          border-left: 1px solid #e8eaed;
          display: flex;
          flex-direction: column;
          z-index: 1000;
          box-shadow: -2px 0 8px rgba(0,0,0,0.1);
        }

        .meet-chat-header {
          height: 56px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e8eaed;
        }

        .meet-chat-title {
          font-size: 16px;
          font-weight: 500;
          color: #3c4043;
        }

        .meet-chat-close {
          background: none;
          border: none;
          color: #5f6368;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: background-color 0.2s ease;
        }

        .meet-chat-close:hover {
          background: #f1f3f4;
        }

        .meet-chat-body {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .meet-chat-info {
          background: #f8f9fa;
          border: 1px solid #e8eaed;
          border-radius: 8px;
          padding: 16px;
        }

        .meet-chat-info-title {
          font-size: 14px;
          font-weight: 500;
          color: #3c4043;
          margin-bottom: 8px;
        }

        .meet-chat-info-desc {
          font-size: 12px;
          color: #5f6368;
          line-height: 1.4;
        }

        .meet-chat-message {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 8px;
        }

        .meet-chat-sender {
          font-size: 12px;
          font-weight: 500;
          color: #1a73e8;
          margin-bottom: 4px;
        }

        .meet-chat-text {
          font-size: 14px;
          color: #3c4043;
          line-height: 1.4;
        }

        .meet-chat-input-container {
          padding: 16px;
          border-top: 1px solid #e8eaed;
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }

        .meet-chat-input {
          flex: 1;
          border: 1px solid #dadce0;
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 14px;
          outline: none;
          resize: none;
          min-height: 36px;
          max-height: 100px;
          transition: border-color 0.2s ease;
        }

        .meet-chat-input:focus {
          border-color: #1a73e8;
        }

        .meet-chat-send {
          background: #1a73e8;
          color: white;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .meet-chat-send:hover {
          background: #1557b0;
        }

        .meet-chat-send:disabled {
          background: #f1f3f4;
          color: #9aa0a6;
          cursor: not-allowed;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .meet-main {
            grid-template-columns: 1fr 320px;
          }
          
          .meet-chat-panel {
            width: 320px;
          }
        }

        @media (max-width: 768px) {
          .meet-main {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr auto;
          }

          .meet-join-panel {
            border-left: none;
            border-top: 1px solid #e8eaed;
            padding: 24px;
          }

          .meet-video-section {
            padding: 16px;
          }

          .meet-device-settings {
            flex-direction: column;
            align-items: center;
          }

          .meet-video-grid {
            grid-template-columns: 1fr;
            padding: 8px;
          }

          .meet-controls-bar {
            gap: 4px;
            padding: 0 8px;
          }

          .meet-control-button {
            width: 40px;
            height: 40px;
          }

          .meet-chat-panel {
            width: 100%;
            height: 70vh;
            top: 30vh;
          }
        }
      `}</style>

      {askForUsername ? (
        /* Google Meet Lobby */
        <div className="meet-lobby-container">
          <div className="meet-header">
            <div className="meet-logo">
              <div className="meet-logo-icon">
                <Video size={20} />
              </div>
              <span>Mulakaat</span>
            </div>
            <div style={{ color: "#5f6368", fontSize: "14px" }}>Ready to connect with warmth & joy</div>
          </div>

          <div className="meet-main">
            <div className="meet-video-section">
              <div className="meet-video-preview">
                <video ref={localVideoRef} autoPlay muted playsInline className="meet-local-video" />

                <div className="meet-video-overlay">
                  <button className={`meet-control-btn ${audio ? "mic-on" : "mic-off"}`} onClick={toggleAudio}>
                    {audio ? <Mic size={24} /> : <MicOff size={24} />}
                  </button>
                  <button className={`meet-control-btn ${video ? "cam-on" : "cam-off"}`} onClick={toggleVideo}>
                    {video ? <Video size={24} /> : <VideoOff size={24} />}
                  </button>
                </div>
              </div>

              <div className="meet-device-settings">
                <div className="meet-device-selector">
                  <Mic className="meet-device-icon" />
                  <select className="meet-device-select" value={selectedAudio} onChange={handleAudioChange}>
                    {audioDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || "Microphone"}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} />
                </div>

                <div className="meet-device-selector">
                  <Users className="meet-device-icon" />
                  <select className="meet-device-select">
                    <option>Speakers (Default)</option>
                  </select>
                  <ChevronDown size={16} />
                </div>

                <div className="meet-device-selector">
                  <Video className="meet-device-icon" />
                  <select className="meet-device-select" value={selectedVideo} onChange={handleVideoChange}>
                    {videoDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || "Camera"}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            <div className="meet-join-panel">
              <div className="meet-join-content">
                <h1 className="meet-meeting-title">Ready to join?</h1>
                <p className="meet-meeting-subtitle">Enter your name to join the meeting</p>

                <input
                  type="text"
                  className="meet-name-input"
                  placeholder="Your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                <button className="meet-join-btn" onClick={getMedia} disabled={!username.trim()}>
                  Join now
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Google Meet Room */
        <div className="meet-room-container">
          <div className="meet-room-header">
            <div className="meet-room-info">
              <div className="meet-room-time">{meetingTime}</div>
              <div className="meet-room-code">
                <span>{meetingCode}</span>
                <button className="meet-copy-btn" onClick={copyMeetingCode}>
                  <Copy size={14} />
                </button>
              </div>
            </div>
            <div className="meet-participants-count">
              <Users size={16} />
              <span>{videos.length + 1} participants</span>
            </div>
          </div>

          <div className="meet-video-grid">
            {/* Local Video */}
            <div className="meet-participant-tile local">
              <video ref={localVideoRef} autoPlay muted playsInline className="meet-participant-video local" />
              {!video && (
                <div className="meet-video-off-placeholder">
                  <div className="meet-avatar">{username.charAt(0).toUpperCase()}</div>
                  <span>Camera is off</span>
                </div>
              )}
              <div className="meet-participant-overlay">You ({username})</div>
              {!audio && (
                <div className="meet-participant-muted">
                  <MicOff size={12} />
                </div>
              )}
            </div>

            {/* Remote Videos */}
            {videos.map(({ socketId, stream }) => (
              <div className="meet-participant-tile" key={socketId}>
                <VideoPlayer stream={stream} socketId={socketId} />
                <div className="meet-participant-overlay">{socketId}</div>
              </div>
            ))}
          </div>

          <div className="meet-controls-bar">
            <button
              className="meet-control-button mic"
              onClick={toggleAudio}
              title={audio ? "Turn off microphone" : "Turn on microphone"}
            >
              {audio ? <Mic size={20} /> : <MicOff size={20} />}
            </button>

            <button
              className="meet-control-button camera"
              onClick={toggleVideo}
              title={video ? "Turn off camera" : "Turn on camera"}
            >
              {video ? <Video size={20} /> : <VideoOff size={20} />}
            </button>

            <button className="meet-control-button captions" title="Turn on captions">
              <Captions size={20} />
            </button>

            <button className="meet-control-button hand" title="Raise hand">
              <Hand size={20} />
            </button>

            <button
              className="meet-control-button screen"
              onClick={startScreenShare}
              disabled={screen}
              title={screen ? "Stop presenting" : "Present now"}
            >
              {screen ? <MonitorOff size={20} /> : <Monitor size={20} />}
            </button>

            <button
              className="meet-control-button chat"
              onClick={() => setShowModal(!showModal)}
              title="Chat with everyone"
            >
              <MessageCircle size={20} />
              {newMessage > 0 && <div className="meet-notification-badge">{newMessage}</div>}
            </button>

            <button className="meet-control-button more" title="More options">
              <MoreHorizontal size={20} />
            </button>

            <button className="meet-control-button end-call" onClick={endCall} title="Leave call">
              <PhoneOff size={20} />
            </button>
          </div>

          {/* Chat Panel */}
          {showModal && (
            <div className="meet-chat-panel">
              <div className="meet-chat-header">
                <h3 className="meet-chat-title">In-call messages</h3>
                <button className="meet-chat-close" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="meet-chat-body">
                <div className="meet-chat-info">
                  <div className="meet-chat-info-title">Messages can only be seen by people in the call</div>
                  <div className="meet-chat-info-desc">Messages are deleted when the call ends and can't be saved.</div>
                </div>

                {chatMessages.map((msg, idx) => (
                  <div key={idx} className="meet-chat-message">
                    <div className="meet-chat-sender">{msg.sender}</div>
                    <div className="meet-chat-text">{msg.data}</div>
                  </div>
                ))}
              </div>

              <div className="meet-chat-input-container">
                <textarea
                  className="meet-chat-input"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      sendChatMessage()
                    }
                  }}
                  placeholder="Send a message to everyone"
                  rows={1}
                />
                <button className="meet-chat-send" onClick={sendChatMessage} disabled={!chatInput.trim()}>
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
