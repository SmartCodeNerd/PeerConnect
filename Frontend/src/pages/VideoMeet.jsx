import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import {
  Badge,
  IconButton,
  TextField,
  Button
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import styles from '../styles/videoComponent.module.css';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  MessageCircle,
  Phone,
  Users,
  Star,
  Heart,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react"


const serverUrl = 'http://localhost:3000';


let connections = {};
const signalBuffer = {};
const peerConfig = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

export default function VideoMeetComponent() {
  const navigate = useNavigate();
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef();

  const [username, setUsername] = useState('');
  const [askForUsername, setAskForUsername] = useState(true);
  const [showLobby, setShowLobby] = useState(true);

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [screen, setScreen] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [newMessage, setNewMessage] = useState(0);
  const [videos, setVideos] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState('');
  const [selectedVideo, setSelectedVideo] = useState('');

  const mockChatMessages = [
    { sender: "John Doe", data: "Hello everyone!" },
    { sender: "Jane Smith", data: "Great to see you all" },
  ]

  const getPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      window.localStream = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setVideoAvailable(true);
      setAudioAvailable(true);
      setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

          // List devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter(d => d.kind === 'audioinput');
    const videoInputs = devices.filter(d => d.kind === 'videoinput');
    setAudioDevices(audioInputs);
    setVideoDevices(videoInputs);
    if (audioInputs.length) setSelectedAudio(audioInputs[0].deviceId);
    if (videoInputs.length) setSelectedVideo(videoInputs[0].deviceId);
    } catch (error) {
      console.error('Media permission error:', error);
    }
  };

  const getUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio });
      window.localStream = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      for (let id in connections) {
        if (id === socketIdRef.current) continue;
        window.localStream.getTracks().forEach(track => {
          connections[id].addTrack(track, window.localStream);
        });
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };

  const gotMessageFromServer = async (fromId, message) => {
  const signal = JSON.parse(message);
  let connection = connections[fromId];

  // If no connection exists, create it and set up handlers
  if (!connection) {
    connection = new RTCPeerConnection(peerConfig);
    connections[fromId] = connection;

    // ICE candidate handling
    connection.onicecandidate = e => {
      if (e.candidate) {
        socketRef.current.emit('signal', fromId, JSON.stringify({ ice: e.candidate }));
      }
    };

    // Handle remote tracks
    connection.ontrack = event => {
      const remoteStream = event.streams[0];
      console.log('Received remote stream for', fromId, remoteStream);
      setVideos(prev => {
        if (prev.some(v => v.socketId === fromId)) return prev;
        return [...prev, { socketId: fromId, stream: remoteStream }];
      });
    };

    // Add local tracks to connection
        if (window.localStream) {
          window.localStream.getTracks().forEach(track => {
            connection.addTrack(track, window.localStream);
          });
        }
      }

      console.log('Signal received from', fromId, signal);

      try {
        if (signal.sdp) {
          const remoteDesc = new RTCSessionDescription(signal.sdp);
          if (signal.sdp.type === 'offer') {
            await connection.setRemoteDescription(remoteDesc);
            const answer = await connection.createAnswer();
            await connection.setLocalDescription(answer);
            socketRef.current.emit('signal', fromId, JSON.stringify({ sdp: answer }));
            console.log('Sent answer to', fromId, answer);
          } else if (signal.sdp.type === 'answer') {
            await connection.setRemoteDescription(remoteDesc);
          }
        }

        if (signal.ice) {
          await connection.addIceCandidate(new RTCIceCandidate(signal.ice));
        }
      } catch (err) {
        console.error('⚠️ WebRTC signal error:', err);
      }
  };

  const connectToSocketServer = () => {
      socketRef.current = io(serverUrl);

      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current.id);
        socketIdRef.current = socketRef.current.id;
        socketRef.current.emit('join-call', window.location.href);
      });

      socketRef.current.on('signal', gotMessageFromServer);

      socketRef.current.on('user-left', id => {
        if (connections[id]) {
          connections[id].close();
          delete connections[id];
        }
        setVideos(prev => prev.filter(v => v.socketId !== id));
      });

      socketRef.current.on('user-joined', ({ id, clients }) => {
        (clients || []).forEach(socketListId => {
          if (socketListId === socketIdRef.current) return; // Don't connect to self
          if (connections[socketListId]) return;

          const connection = new RTCPeerConnection(peerConfig);
          connections[socketListId] = connection;

          // ICE candidate handling
          connection.onicecandidate = e => {
            if (e.candidate) {
              socketRef.current.emit('signal', socketListId, JSON.stringify({ ice: e.candidate }));
            }
          };

          // Handle remote tracks
          connection.ontrack = event => {
          const remoteStream = event.streams[0];
          console.log('Received remote stream for', socketListId, remoteStream);
          setVideos(prev => {
            // Avoid duplicates
            if (prev.some(v => v.socketId === socketListId)) return prev;
            return [...prev, { socketId: socketListId, stream: remoteStream }];
          });
        };

          // Add local tracks to connection
          if (window.localStream) {
            window.localStream.getTracks().forEach(track => {
              connection.addTrack(track, window.localStream);
            });
          }

          console.log('Added local tracks to connection', socketListId, window.localStream.getTracks());

          // Replay any buffered signals
          if (signalBuffer[socketListId]) {
            signalBuffer[socketListId].forEach(signal => {
              gotMessageFromServer(socketListId, JSON.stringify(signal));
            });
            delete signalBuffer[socketListId];
          }
        });

        // If this is the local user, create offers to all others
        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            console.log('Creating offer/answer for', id2);
            connections[id2].createOffer().then(description => {
              connections[id2].setLocalDescription(description).then(() => {
                socketRef.current.emit('signal', id2, JSON.stringify({ sdp: description }));
              });
            });
          }
        }
      });
  };

  const getMedia = async () => {
    setAskForUsername(false);
    await getUserMedia();
    connectToSocketServer();
  };

  const handleAudioChange = async (e) => {
  setSelectedAudio(e.target.value);
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId: selectedVideo ? { exact: selectedVideo } : undefined },
    audio: { deviceId: { exact: e.target.value } }
  });
  window.localStream = stream;
  if (localVideoRef.current) localVideoRef.current.srcObject = stream;
  };

  const handleVideoChange = async (e) => {
  setSelectedVideo(e.target.value);
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId: { exact: e.target.value } },
    audio: { deviceId: selectedAudio ? { exact: selectedAudio } : undefined }
  });
  window.localStream = stream;
  if (localVideoRef.current) localVideoRef.current.srcObject = stream;
  };
  
  const sendChatMessage = () => {
    if(chatInput.trim() && socketRef.current) {
      socketRef.current.emit('chat-message',chatInput,username || 'Anonymous');
      setChatInput('');
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video:true });
      setScreen(true);

      for(let id in connections) {
        const sender = connections[id]
          .getSenders()
          .find(s => s.track && s.track.kind === 'video');
        if(sender) {
          sender.replaceTrack(screenStream.getVideoTracks()[0]);
        }
      }
      //Show Screen in Local Video
      if(localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

       screenStream.getVideoTracks()[0].onended = async () => {
      setScreen(false);
      await getUserMedia();
      // Replace back to camera in all peer connections
      for (let id in connections) {
        const sender = connections[id]
          .getSenders()
          .find(s => s.track && s.track.kind === 'video');
        if (sender && window.localStream) {
          sender.replaceTrack(window.localStream.getVideoTracks()[0]);
        }
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = window.localStream;
      }
    };

    } catch(e) {
      console.log("Screen Share Error",e);
    }

  };

  const endCall = () => {
  // Close All Peer Connections
  for(let id in connections) {
    if(connections[id]) {
      connections[id].close();
      delete connections[id];
    }
  }

  // Stops All Local Media Tracks
  if(window.localStream) {
    window.localStream.getTracks().forEach(track => {
      console.log('Stopping track:', track);
      track.stop();
    });
    window.localStream = null;
  }

  // Extra: Stop all streams in all video elements (in case of browser bug)
  document.querySelectorAll('video').forEach(video => {
    if (video.srcObject) {
      try {
        video.srcObject.getTracks().forEach(track => track.stop());
      } catch {}
      video.srcObject = null;
    }
  });

  // Reset UI State
  setVideos([]);
  setAskForUsername(true);
  setShowModal(false);
  setChatMessages([]);
  setNewMessage(0);
  setVideo(false);
  setAudio(false);

  // Optionally disconnect the socket
  if(socketRef.current) {
    socketRef.current.disconnect();
    socketRef.current = null;
  }

  setTimeout(() => {
  navigator.mediaDevices.enumerateDevices().then(devices => {
    console.log('Devices after cleanup:', devices);
  });
}, 1000);


  navigate('/afterCall');
};

  function VideoPlayer({ stream }) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  //For Recieving Chat Messages
  useEffect(() => {
  if (!socketRef.current) return;
  socketRef.current.on('chat-message', (data, sender, senderId) => {
    setChatMessages(prev => [...prev, { data, sender, senderId }]);
    setNewMessage(prev => prev + 1);
  });
  return () => {
    if (socketRef.current) {
      socketRef.current.off('chat-message');
    }
  };
}, [socketRef.current]);

  return <video ref={ref} autoPlay playsInline className={styles.remoteVideo} />;
}

  const toggleVideo = () => {
    setVideo(prev => {
        const newState = !prev;
        if (window.localStream) {
            window.localStream.getVideoTracks().forEach(track => {
                track.enabled = newState;
            });
            // Force refresh local video element
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = null;
                localVideoRef.current.srcObject = window.localStream;
            }
        }
        return newState;
      });
    };

  const toggleAudio = () => {
      setAudio(prev => {
          const newState = !prev;
          if (window.localStream) {
          window.localStream.getAudioTracks().forEach(track => {
              track.enabled = newState;
          });
          }
          return newState;
      });
  };

  useEffect(() => {
    getPermissions();
  }, []);

  return (
    <>
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .video-meet-container {
          width: 100vw;
          height: 100vh;
          background:rgba(255, 255, 255, 0.95);
          position: fixed;
          top: 0;
          left: 0;
          overflow: hidden;
        }

        /* Background decorative elements */
        .video-meet-container::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          animation: float 6s ease-in-out infinite;
        }

        .video-meet-container::after {
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
        .lobby-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 107, 53, 0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          z-index: 100;
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: 1rem;
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

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #374151;
          font-weight: 500;
        }

        /* Lobby Layout */
        .lobby-container {
          width: 100vw;
          height: 100vh;
          display: grid;
          grid-template-columns: 1fr 400px;
          position: relative;
          z-index: 10;
        }

        /* Video Section */
        .video-section {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          padding-top: 120px;
          padding-bottom: 120px;
        }

        .video-container {
          position: relative;
          width: 100%;
          max-width: 800px;
          aspect-ratio: 16/9;
          background: #000;
          border-radius: 2rem;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          // border: 3px solid rgba(255, 255, 255, 0.2);
        }

        .local-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.3) 0%,
            transparent 30%,
            transparent 70%,
            rgba(0, 0, 0, 0.5) 100%
          );
          pointer-events: none;
        }

        .username-display {
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          // background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 0.75rem 1.25rem;
          border-radius: 1rem;
          font-size: 1.25rem;
          font-weight: 500;
          // backdrop-filter: blur(10px);
        }

        .video-controls {
          position: absolute;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .control-btn {
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
        }

        .control-btn-audio {
          background: ${audio ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 107, 107, 0.9)"};
          color: ${audio ? "white" : "white"};
          border: 2px solid ${audio ? "rgba(255, 255, 255, 0.3)" : "transparent"};
        }

        .control-btn-video {
          background: ${video ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 107, 107, 0.9)"};
          color: ${video ? "white" : "white"};
          border: 2px solid ${video ? "rgba(255, 255, 255, 0.3)" : "transparent"};
        }

        .control-btn-more {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .control-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        }

        /* Device Settings */
        .device-settings {
          margin-top: 2rem;
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          max-width: 800px;
          width: 100%;
        }

        .device-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.9);
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          min-width: 180px;
          flex: 1;
          max-width: 250px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .device-group:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          border-color: rgba(255, 107, 53, 0.3);
       }

        .device-icon {
          width: 1.125rem;
          height: 1.125rem;
          color: #5f6368;
          flex-shrink: 0;
       }

        .device-select {
          border: none;
          background: transparent;
          font-size: 0.875rem;
          font-weight: 400;
          color: #3c4043;
          outline: none;
          cursor: pointer;
          flex: 1;
          min-width: 0;
          appearance: none;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }

        .device-select option {
          color: #3c4043;
          background: white;
          padding: 0.5rem;
        }

        .device-chevron {
          width: 1rem;
          height: 1rem;
          color: #5f6368;
          flex-shrink: 0;
          margin-left: 0.25rem;
       }

        /* Join Panel */
        .join-panel {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          //border-left: 1px solid rgba(255, 107, 53, 0.2);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 3rem 2rem;
          position: relative;
          margin-right:5rem;
        }

        .join-content {
          text-align: center;
          max-width: 300px;
        }

        .ready-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(45deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1));
          padding: 0.5rem 1rem;
          border-radius: 50px;
          border: 2px solid rgba(255, 107, 53, 0.2);
          margin-bottom: 2rem;
        }

        .badge-icon {
          width: 1rem;
          height: 1rem;
        }

        .badge-icon:first-child {
          color: #ffd23f;
          fill: currentColor;
        }

        .badge-icon:last-child {
          color: #ff6b35;
          fill: currentColor;
        }

        .badge-text {
          color: #ff6b35;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .ready-title {
          font-size: 2rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
        }

        .ready-subtitle {
          color: #6b7280;
          font-size: 1.125rem;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .username-input {
          width: 100%;
          padding: 1rem 1.5rem;
          border: 2px solid rgba(255, 107, 53, 0.2);
          border-radius: 1rem;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;
          outline: none;
          margin-bottom: 2rem;
        }

        .username-input:focus {
          border-color: #ff6b35;
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
          background: white;
        }

        .join-btn {
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f, #e91e63);
          background-size: 300% 300%;
          animation: gradientButton 3s ease infinite;
          color: white;
          border: none;
          padding: 1rem 3rem;
          border-radius: 1rem;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
          width: 100%;
        }

        @keyframes gradientButton {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .join-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(255, 107, 53, 0.6);
        }

        .join-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Meeting Room Styles */
        .meeting-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .meeting-header {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .meeting-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .meeting-info {
          color: white;
          font-size: 0.875rem;
        }

        .participants-count {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 107, 53, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 1rem;
          border: 1px solid rgba(255, 107, 53, 0.3);
        }

        .meeting-content {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 1rem;
          padding: 1rem;
          position: relative;
        }

        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          height: fit-content;
        }

        .video-card {
          background: rgba(0, 0, 0, 0.8);
          border-radius: 1rem;
          overflow: hidden;
          position: relative;
          aspect-ratio: 16/9;
          border: 2px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .video-card:hover {
          border-color: rgba(255, 107, 53, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.2);
        }

        .video-card.local {
          border-color: rgba(255, 107, 53, 0.5);
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.2);
        }

        .video-label {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          z-index: 10;
        }

        .local-video-meeting {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sidebar {
          background: rgba(0, 0, 0, 0.8);
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .controls-container {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(20px);
          border-radius: 2rem;
          padding: 1rem 2rem;
          display: flex;
          gap: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          z-index: 100;
        }

        .meeting-control-btn {
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .control-btn-mic {
          background: ${audio ? "linear-gradient(45deg, #51cf66, #40c057)" : "linear-gradient(45deg, #ff6b6b, #ee5a52)"};
          color: white;
        }

        .control-btn-cam {
          background: ${video ? "linear-gradient(45deg, #339af0, #228be6)" : "linear-gradient(45deg, #ff6b6b, #ee5a52)"};
          color: white;
        }

        .control-btn-screen {
          background: ${screen ? "linear-gradient(45deg, #ffd23f, #ff6b35)" : "linear-gradient(45deg, #6b7280, #4b5563)"};
          color: white;
        }

        .control-btn-chat {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          position: relative;
        }

        .control-btn-end {
          background: linear-gradient(45deg, #ff6b6b, #ee5a52);
          color: white;
        }

        .meeting-control-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .meeting-control-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .chat-badge {
          position: absolute;
          top: -0.5rem;
          right: -0.5rem;
          background: #ff6b35;
          color: white;
          border-radius: 50%;
          width: 1.5rem;
          height: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
          border: 2px solid rgba(0, 0, 0, 0.9);
        }

        /* Chat Modal */
        .chat-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          width: 90%;
          max-width: 500px;
          height: 70vh;
          border: 2px solid rgba(255, 107, 53, 0.2);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-header {
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f);
          color: white;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .chat-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }

        .chat-close-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .chat-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .chat-body {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .chat-message {
          background: rgba(255, 107, 53, 0.1);
          padding: 0.75rem 1rem;
          border-radius: 1rem;
          border: 1px solid rgba(255, 107, 53, 0.2);
        }

        .chat-sender {
          font-weight: 600;
          color: #ff6b35;
          margin-bottom: 0.25rem;
        }

        .chat-text {
          color: #374151;
        }

        .chat-input-container {
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(255, 107, 53, 0.2);
          display: flex;
          gap: 0.75rem;
        }

        .chat-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 2px solid rgba(255, 107, 53, 0.2);
          border-radius: 1rem;
          outline: none;
          font-size: 0.875rem;
          background: rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;
        }

        .chat-input:focus {
          border-color: #ff6b35;
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
        }

        .chat-send-btn {
          background: linear-gradient(45deg, #ff6b35, #f7931e);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 1rem;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
        }

        .chat-send-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.5);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .lobby-container {
            grid-template-columns: 1fr 350px;
          }
        }

        @media (max-width: 768px) {
          .lobby-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr auto;
          }

          .join-panel {
            border-left: none;
            border-top: 1px solid rgba(255, 107, 53, 0.2);
            padding: 2rem;
          }

          .video-section {
            padding: 1rem;
            padding-top: 100px;
            padding-bottom: 1rem;
          }

          .device-settings {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }

          .ready-title {
            font-size: 2rem;
          }

          .meeting-content {
            grid-template-columns: 1fr;
            padding: 0.5rem;
          }

          .sidebar {
            order: -1;
            height: 200px;
          }

          .controls-container {
            padding: 0.75rem 1rem;
            gap: 0.75rem;
          }

          .meeting-control-btn {
            width: 3rem;
            height: 3rem;
          }

          .chat-modal {
            width: 95%;
            height: 80vh;
          }
        }
      `}</style>

      <div className="video-meet-container">
        {askForUsername ? (
          <>
            {/* Header */}
            <div className="lobby-header">
              <div className="brand-section">
                <div className="brand-logo">
                  <Video className="brand-icon" />
                </div>
                <div className="brand-text">
                  <h1>Mulakaat</h1>
                  <p>मुलाकात</p>
                </div>
              </div>
              {/* <div className="user-info">
                <span>Ready to connect with warmth & joy</span>
              </div> */}
            </div>

            {/* Lobby Layout */}
            <div className="lobby-container">
              {/* Video Section */}
              <div className="video-section">
                <div className="video-container">
                  <video ref={localVideoRef} autoPlay muted playsInline className="local-video" />
                  <div className="video-overlay" />

                  {username && <div className="username-display">{username}</div>}

                  <div className="video-controls">
                    <button className="control-btn control-btn-audio" onClick={toggleAudio}>
                      {audio ? <Mic size={20} /> : <MicOff size={20} />}
                    </button>
                    <button className="control-btn control-btn-video" onClick={toggleVideo}>
                      {video ? <Video size={20} /> : <VideoOff size={20} />}
                    </button>
                    {/* <button className="control-btn control-btn-more">
                      <MoreHorizontal size={20} />
                    </button> */}
                  </div>
                </div>

                <div className="device-settings">
                  <div className="device-group">
                    <Mic className="device-icon" />
                    <select className="device-select" value={selectedAudio} onChange={handleAudioChange}>
                      {audioDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || "Microphone"}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} color="#ff6b35" />
                  </div>
                  <div className="device-group">
                    <Video className="device-icon" />
                    <select className="device-select" value={selectedVideo} onChange={handleVideoChange}>
                      {videoDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || "Camera"}
                        </option>
                      ))}
                    </select>
                    {/* <ChevronDown size={16} color="#ff6b35" /> */}
                  </div>
                </div>
              </div>

              {/* Join Panel */}
              <div className="join-panel">
                <div className="join-content">
                  {/* <div className="ready-badge">
                    <Star className="badge-icon" />
                    <span className="badge-text">Ready to join?</span>
                    <Heart className="badge-icon" />
                  </div> */}

                  <h2 className="ready-title">Ready to Join?</h2>
                  {/* <p className="ready-subtitle">Enter your name and join the conversation with warmth and joy</p> */}

                  <input
                    type="text"
                    className="username-input"
                    placeholder="Your name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />

                  <button className="join-btn" onClick={getMedia} disabled={!username.trim()}>
                    Join Now
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="meeting-container">
            {/* Meeting Header */}
            <div className="meeting-header">
              <div className="meeting-brand">
                <div className="brand-logo">
                  <Video className="brand-icon" />
                </div>
                <div className="brand-text">
                  <h1>Mulakaat</h1>
                  <p>मुलाकात</p>
                </div>
              </div>
              <div className="meeting-info">
                <div className="participants-count">
                  <Users size={16} />
                  <span>{videos.length + 1} participants</span>
                </div>
              </div>
            </div>

            {/* Meeting Content */}
            <div className="meeting-content">
              <div className="video-grid">
                {/* Local Video */}
                <div className="video-card local">
                  <video ref={localVideoRef} autoPlay muted playsInline className="local-video-meeting" />
                  <div className="video-label">You</div>
                </div>

                {/* Remote Videos */}
                {videos.map(({ socketId, stream }) => (
                  <div className="video-card" key={socketId}>
                    <VideoPlayer stream={stream} />
                    <div className="video-label">{socketId}</div>
                  </div>
                ))}
              </div>

              <div className="sidebar">{/* Sidebar content can be added here */}</div>
            </div>

            {/* Controls */}
            <div className="controls-container">
              <button className="meeting-control-btn control-btn-mic" onClick={toggleAudio}>
                {audio ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <button className="meeting-control-btn control-btn-cam" onClick={toggleVideo}>
                {video ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
              <button
                className="meeting-control-btn control-btn-screen"
                onClick={screen ? undefined : startScreenShare}
                disabled={screen}
              >
                {screen ? <MonitorOff size={20} /> : <Monitor size={20} />}
              </button>
              <button className="meeting-control-btn control-btn-chat" onClick={() => setShowModal(!showModal)}>
                <MessageCircle size={20} />
                {newMessage > 0 && <div className="chat-badge">{newMessage}</div>}
              </button>
              <button className="meeting-control-btn control-btn-end" onClick={endCall}>
                <Phone size={20} />
              </button>
            </div>

            {/* Chat Modal */}
            {showModal && (
              <div className="chat-modal">
                <div className="chat-header">
                  <h3 className="chat-title">Chat</h3>
                  <button className="chat-close-btn" onClick={() => setShowModal(false)}>
                    Close
                  </button>
                </div>
                <div className="chat-body">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className="chat-message">
                      <div className="chat-sender">{msg.sender}:</div>
                      <div className="chat-text">{msg.data}</div>
                    </div>
                  ))}
                </div>
                <div className="chat-input-container">
                  <input
                    type="text"
                    className="chat-input"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendChatMessage()
                    }}
                    placeholder="Type a message..."
                  />
                  <button className="chat-send-btn" onClick={sendChatMessage}>
                    Send
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

