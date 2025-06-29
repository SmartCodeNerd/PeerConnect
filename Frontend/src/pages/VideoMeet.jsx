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
  ChevronDown,
  Copy,
  Send,
  X,
  PhoneOff,
} from "lucide-react"
import { useNavigate,useLocation } from "react-router-dom"
import withAuth from "../utils/withAuth"
const serverUrl = "http://localhost:3000"

const connections = {}
const signalBuffer = {}
const peerConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
}

function VideoMeetComponent() {
  const navigate = useNavigate()
  const socketRef = useRef()
  const socketIdRef = useRef()
  const localVideoRef = useRef()
  const location = useLocation();
  const {meetCode} = location.state || {};

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
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser does not support mediaDevices API");
      } 
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
  console.log("🎥 [gotMessageFromServer] ontrack fired for:", fromId, remoteStream)

  setVideos((prev) => {
    const existing = prev.find((v) => v.socketId === fromId)
    if (existing) {
      if (existing.stream?.id === remoteStream.id) {
        console.log("⚠️ [gotMessageFromServer] Stream unchanged for", fromId, "- skipping update")
        return prev
      }

      console.log("🔁 [gotMessageFromServer] Stream changed for", fromId, "- updating stream")
      return prev.map((v) =>
        v.socketId === fromId ? { ...v, stream: remoteStream } : v
      )
    }

    console.log("➕ [gotMessageFromServer] Adding new stream for", fromId)
    return [...prev, { socketId: fromId, stream: remoteStream }]
  })
}


      // Add local tracks to connection
      if (window.localStream) {
  window.localStream.getTracks().forEach((track) => {
    const alreadySent = connection.getSenders().some((s) => s.track?.id === track.id)
    if (!alreadySent) {
      connection.addTrack(track, window.localStream)
    }
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
    (clients || []).forEach((socketListId) => {
      if (socketListId === socketIdRef.current || connections[socketListId]) return

      const connection = new RTCPeerConnection(peerConfig)
      connections[socketListId] = connection

      // Handle ICE candidates
      connection.onicecandidate = (e) => {
        if (e.candidate) {
          socketRef.current.emit("signal", socketListId, JSON.stringify({ ice: e.candidate }))
        }
      }

      // Handle incoming remote stream
      connection.ontrack = (event) => {
  const remoteStream = event.streams[0]
  console.log("🎥 [user-joined] ontrack fired for:", socketListId, remoteStream)

  setVideos((prev) => {
    const existing = prev.find((v) => v.socketId === socketListId)
    if (existing) {
      if (existing.stream?.id === remoteStream.id) {
        console.log("⚠️ [user-joined] Stream unchanged for", socketListId, "- skipping update")
        return prev
      }

      console.log("🔁 [user-joined] Stream changed for", socketListId, "- updating stream")
      return prev.map((v) =>
        v.socketId === socketListId ? { ...v, stream: remoteStream } : v
      )
    }

    console.log("➕ [user-joined] Adding new stream for", socketListId)
    return [...prev, { socketId: socketListId, stream: remoteStream }]
  })
}


      // Add local tracks to connection
      if (window.localStream) {
  window.localStream.getTracks().forEach((track) => {
    const alreadySent = connection.getSenders().some((s) => s.track?.id === track.id)
    if (!alreadySent) {
      connection.addTrack(track, window.localStream)
    }
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

    // Only the joining peer initiates offers
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

    navigate("/afterCall",{
      state:{
        meetCode:meetCode,
      }
    })
  }

  // Optimized VideoPlayer component to prevent flickering and fix scaling
  const VideoPlayer = ({ stream, socketId }) => {
  const ref = useRef()

  useEffect(() => {
  if (ref.current && stream && ref.current.srcObject?.id !== stream.id) {
    console.log(`[VideoPlayer] Updating stream for ${socketId}`)
    ref.current.srcObject = stream
  } else {
    console.log(`[VideoPlayer] Skipping update for ${socketId}, stream.id unchanged`)
  }
}, [stream, socketId])


  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={socketId === socketIdRef.current} // Always mute remote video in local view (or conditionally if needed)
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        backgroundColor: "#000",
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
    console.log("Toggle Audio",audio);
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

        .dashboard-container {
           height: 100vh; /* Full viewport height */
          background: linear-gradient(to bottom right, #f2e6d8, #f4d9dc, #f3e6c6);
          position: relative;
          overflow: hidden; /* Prevent scrolling */
        }

        .dashboard-container::after {
          content: "";
          position: absolute;
          bottom: -30%;
          left: -30%;
          width: 60%;
          height: 60%;
          background: radial-gradient(circle, rgba(255, 107, 53, 0.2) 0%, transparent 70%);
          animation: float 8s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        /* Header */
        .header {
          border-bottom: 1px solid rgba(255, 107, 53, 0.2);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 2px 10px rgba(255, 107, 53, 0.1);
        }

        .header-container {
          max-width: 100%;
          margin: 0;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          padding-bottom: 1rem;
          width: 100%;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-logo {
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, #ff6b35, #f7931e, #ffd23f);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
        }

        .brand-icon {
          width: 1.75rem;
          height: 1.75rem;
          color: white;
        }

        .brand-text h1 {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .brand-text p {
          font-size: 0.75rem;
          color: rgba(255, 107, 53, 0.8);
          font-weight: 500;
          margin: -0.25rem 0 0 0;
        }

        .meet-lobby-container, .meet-room-container {
        height: calc(100vh - 64px); /* Adjust for header height */
        width: 100%;
        position: relative;
        font-family: 'Arial', sans-serif;
        overflow: hidden; /* Prevent scrolling */
    }

        /* Lobby Styles */
        .meet-lobby-container {
          display: flex;
          flex-direction: column;
        }

        .meet-main {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 0;
        }

        .meet-video-section {
          //background:linear-gradient(to bottom right, #f2e6d8, #f4d9dc, #f3e6c6);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .meet-video-preview {
          width: 100%;
          max-width: 640px;
          aspect-ratio: 16/9;
          background: #202124;
          border-radius: 1rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(255, 107, 53, 0.2);
          border: 2px solid rgba(255, 107, 53, 0.1);
        }

        .meet-local-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1);
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
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
          background: rgba(255, 107, 53, 0.1);
          color: #ff6b35;
          border: 2px solid rgba(255, 107, 53, 0.2);
        }

        .meet-control-btn:hover {
          transform: scale(1.08);
          background: rgba(255, 107, 53, 0.2);
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
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid rgba(255, 107, 53, 0.2);
          border-radius: 1rem;
          padding: 8px 12px;
          min-width: 180px;
          cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .meet-device-selector:hover {
          border-color: #ff6b35;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
        }

        .meet-device-icon {
          width: 20px;
          height: 20px;
          color: #ff6b35;
        }

        .meet-device-select {
          border: none;
          background: transparent;
          outline: none;
          flex: 1;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
        }

        .meet-join-panel {
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
          margin-right:9rem;
        }

        .meet-meeting-title {
          font-size: 24px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .meet-meeting-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 32px;
        }

        .meet-name-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid rgba(255, 107, 53, 0.2);
          border-radius: 1rem;
          font-size: 16px;
          outline: none;
          margin-bottom: 24px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          background: rgba(255, 255, 255, 0.8);
        }

        .meet-name-input:focus {
          border-color: #ff6b35;
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
          background: white;
        }

        .meet-join-btn {
          width: 100%;
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f, #e91e63);
          background-size: 300% 300%;
          animation: gradientButton 3s ease infinite;
          color: white;
          border: none;
          border-radius: 1rem;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
        }

        @keyframes gradientButton {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .meet-join-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(255, 107, 53, 0.6);
        }

        .meet-join-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Room Styles */
        .meet-room-container {
          display: flex;
          flex-direction: column;
        }

        .meet-room-header {
          height: 56px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          border-bottom: 1px solid rgba(255, 107, 53, 0.2);
          box-shadow: 0 2px 10px rgba(255, 107, 53, 0.1);
        }

        .meet-room-info {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-left:0;
        }

        .meet-room-time {
          color: #374151;
          font-size: 14px;
          font-weight: 500;
        }

        .meet-room-code {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 107, 53, 0.1);
          padding: 6px 12px;
          border-radius: 1rem;
          color: #ff6b35;
          font-size: 12px;
          font-family: monospace;
          border: 2px solid rgba(255, 107, 53, 0.2);
        }

        .meet-copy-btn {
          background: none;
          border: none;
          color: #ff6b35;
          cursor: pointer;
          padding: 2px;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }

        .meet-copy-btn:hover {
          background: rgba(255, 107, 53, 0.2);
          color: #e53935;
        }

        .meet-participants-count {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
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
          border-radius: 1rem;
          position: relative;
          overflow: hidden;
          border: 2px solid rgba(255, 107, 53, 0.1);
          transition: border-color 0.2s ease, transform 0.3s ease;
        }

        .meet-participant-tile:hover {
          border-color: #ff6b35;
          transform: translateY(-2px);
        }

        .meet-participant-tile.local {
          border-color: #ff6b35;
        }

        .meet-participant-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: #202124;
        }

        .meet-participant-video.local {
          transform: scaleX(-1);
        }

        .meet-participant-overlay {
          position: absolute;
          bottom: 8px;
          left: 8px;
          background: rgba(255, 255, 255, 0.8);
          color: #374151;
          padding: 4px 8px;
          border-radius: 0.5rem;
          font-size: 12px;
          font-weight: 500;
          backdrop-filter: blur(10px);
        }

        .meet-participant-muted {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: #ea4335;
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
          background: #ff6b35;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: 500;
        }

        .meet-controls-bar {
          height: 100px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 0 16px;
          border-top: 1px solid rgba(255, 107, 53, 0.2);
          box-shadow: 0 -2px 10px rgba(255, 107, 53, 0.1);
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
          transition: all 0.3s ease;
          background: rgba(255, 107, 53, 0.1);
          color: #ff6b35;
          border: 2px solid rgba(255, 107, 53, 0.2);
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
          margin-bottom:5px;
        }

        .meet-control-button:hover {
          transform: scale(1.1);
          background: rgba(255, 107, 53, 0.2);
        }

        .meet-control-button.mic {
          background: ${audio ? "rgba(255, 107, 53, 0.1)" : "#ea4335"};
          color: ${audio ? "#ff6b35" : "white"};
        }

        .meet-control-button.camera {
          background: ${video ? "rgba(255, 107, 53, 0.1)" : "#ea4335"};
          color: ${video ? "#ff6b35" : "white"};
        }

        .meet-control-button.screen {
          background: ${screen ? "#34a853" : "rgba(255, 107, 53, 0.1)"};
          color: ${screen ? "white" : "#ff6b35"};
        }

        .meet-control-button.captions, .meet-control-button.hand, .meet-control-button.chat, .meet-control-button.more {
          background: rgba(255, 107, 53, 0.1);
          color: #ff6b35;
        }

        .meet-control-button.end-call {
          background: linear-gradient(45deg, #ff6b6b, #ee5a52);
          color: white;
          border: none;
        }

        .meet-control-button.end-call:hover {
          background: linear-gradient(45deg, #ff5252, #e53935);
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
          border: 2px solid rgba(255, 255, 255, 0.8);
        }

        /* Chat Panel */
        .meet-chat-panel {
          position: fixed;
          top: 64px; /* Offset for header */
          right: 0;
          width: 360px;
          height: calc(100vh - 64px);
          background: rgba(255, 255, 255, 0.9);
          border-left: 1px solid rgba(255, 107, 53, 0.2);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }

        .meet-chat-header {
          height: 56px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 107, 53, 0.2);
        }

        .meet-chat-title {
          font-size: 16px;
          font-weight: 500;
          color: #374151;
        }

        .meet-chat-close {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 8px;
          border-radius: 0.5rem;
          transition: background-color 0.2s ease;
        }

        .meet-chat-close:hover {
          background: rgba(107, 114, 128, 0.1);
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
          background: rgba(255, 107, 53, 0.1);
          border: 2px solid rgba(255, 107, 53, 0.2);
          border-radius: 1rem;
          padding: 16px;
        }

        .meet-chat-info-title {
          font-size: 14px;
          font-weight: 500;
          color: #ff6b35;
          margin-bottom: 8px;
        }

        .meet-chat-info-desc {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.4;
        }

        .meet-chat-message {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 1rem;
          padding: 12px;
          margin-bottom: 8px;
          border: 2px solid rgba(255, 107, 53, 0.1);
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.1);
        }

        .meet-chat-sender {
          font-size: 12px;
          font-weight: 500;
          color: #ff6b35;
          margin-bottom: 4px;
        }

        .meet-chat-text {
          font-size: 14px;
          color: #374151;
          line-height: 1.4;
        }

        .meet-chat-input-container {
          padding: 16px;
          border-top: 1px solid rgba(255, 107, 53, 0.2);
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }

        .meet-chat-input {
          flex: 1;
          border: 2px solid rgba(255, 107, 53, 0.2);
          border-radius: 1rem;
          padding: 8px 16px;
          font-size: 14px;
          outline: none;
          resize: none;
          min-height: 36px;
          max-height: 100px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          background: rgba(255, 255, 255, 0.9);
        }

        .meet-chat-input:focus {
          border-color: #ff6b35;
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
        }

        .meet-chat-send {
          background: linear-gradient(45deg, #ff6b35, #f7931e);
          color: white;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
        }

        .meet-chat-send:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.5);
        }

        .meet-chat-send:disabled {
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
          cursor: not-allowed;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }

          .meet-main {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr auto;
          }

          .meet-join-panel {
            border-left: none;
            padding: 24px;
          }

          .meet-video-section {
            padding: 3rem;
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
            top: 64px;
          }

          .btns {
            display: flex;
            flex: 1;
            justify-content: center;
            align-items: center;
            gap: 8px;
            flex-wrap: nowrap; /* This prevents wrapping */
          }

      `}</style>

      <div className="dashboard-container">
        {/* Header */}
        <header className="header">
          <div className="header-container">
            <div className="nav-brand">
              <div className="brand-logo">
                <Video className="brand-icon" />
              </div>
              <div className="brand-text">
                <h1>Mulakaat</h1>
                <p>मुलाकात</p>
              </div>
            </div>
          </div>
        </header>

        {askForUsername ? (
          /* Lobby */
          <div className="meet-lobby-container">
            <div className="meet-main">
              <div className="meet-video-section">
                <div className="meet-video-preview">
                  <video ref={localVideoRef} autoPlay muted playsInline className="meet-local-video" />
                  <div className="meet-video-overlay">
                    <button className="meet-control-btn" onClick={toggleAudio}>
                      {audio ? <Mic size={24} /> : <MicOff size={24} />}
                    </button>
                    <button className="meet-control-btn" onClick={toggleVideo}>
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
          /* Room */
          <div className="meet-room-container"> 
            <div className="meet-video-grid">
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

              {videos.map(({ socketId, stream }) => (
                <div className="meet-participant-tile" key={socketId}>
                  <VideoPlayer stream={stream} socketId={socketId} />
                  <div className="meet-participant-overlay">{socketId}</div>
                </div>
              ))}
            </div>

            <div className="meet-controls-bar">

              <div className="meet-room-info">
                <div className="meet-room-time">{meetingTime}</div>
                <div className="meet-room-code">
                  <span>{meetingCode}</span>
                  <button className="meet-copy-btn" onClick={copyMeetingCode}>
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              

              <button className="meet-control-button mic" onClick={toggleAudio} title={audio ? "Mute" : "Unmute"}>
                {audio ? <Mic size={20} /> : <MicOff size={20} />}
              </button>

              <button
                className="meet-control-button camera"
                onClick={toggleVideo}
                title={video ? "Turn off camera" : "Turn on camera"}
              >
                {video ? <Video size={20} /> : <VideoOff size={20} />}
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

              <button className="meet-control-button end-call" onClick={endCall} title="Leave call">
                <PhoneOff size={20} />
              </button>


              <div className="meet-participants-count">
                <Users size={16} />
                <span>{videos.length + 1} participants</span>
              </div>
            </div>

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
      </div>
    </>
  ) 
}

export default withAuth(VideoMeetComponent);