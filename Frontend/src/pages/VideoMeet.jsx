import React, { useRef, useState, useEffect } from "react";
import styles from '../styles/videoComponent.module.css';
import { TextField, Button } from "@mui/material";
import io from "socket.io-client";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'

const serverUrl = "http://localhost:3000";

let connections = {};
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};


export default function VideoMeetComponent() {
  let socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();
  let videoRef = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState([]);
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();
  let [showModal, setShowModal] = useState(true);
  let [screenAvailable, setScreenAvailable] = useState();
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessage, setNewMessage] = useState(0);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  let [videos, setVideos] = useState([]);

  //const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

  const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

  const silence = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  const black = ({ width = 640, height = 480 } = {}) => {
    const canvas = Object.assign(document.createElement("canvas"), { width, height });
    canvas.getContext('2d').fillRect(0, 0, width, height);
    const stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: true });
  };

  let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoRef.current?.srcObject.getTracks();
                tracks.forEach(track => track.stop())
            } catch (e) {
                console.error("getUserMedia Error:", e);
            }
        }
    }

  const getUserMediaSuccess = async (stream) => {
    try {
      window.localStream.getTracks().forEach(track => track.stop());
    } catch (e) {
      console.log("Error:", e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      connections[id].addStream(window.localStream);
      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
          .then(() => {
            socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }));
          }).catch(e => console.log("Error-",e));
      });
    }

    stream.getTracks().forEach(track => {
      track.onended = () => {
        setVideo(false);
        setAudio(false);
        try {
          let tracks = localVideoRef.current?.srcObject?.getTracks();
          if (tracks) tracks.forEach(track => track.stop());
        } catch (e) {
          console.error("Stream cleanup error:", e);
        }

        const blackSilence = (...args) => new MediaStream([black(...args), silence()]);
        window.localStream = blackSilence();
        localVideoRef.current.srcObject = window.localStream;

        for (let id in connections) {
          connections[id].addStream(window.localStream);
          connections[id].createOffer().then((description) => {
            connections[id].setLocalDescription(description).then(() => {
              socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }));
            }).catch(e => console.log("Error-",e));
          });
        }
      };
    });
  };

 const gotMessageFromServer = (fromId, message) => {
  const signal = JSON.parse(message);

  if (!connections[fromId]) {
    console.warn(`❌ No connection found for ${fromId} — buffering signal`);
    if (!signalBuffer[fromId]) signalBuffer[fromId] = [];
    signalBuffer[fromId].push(signal);
    return;
  }

  if (signal.sdp) {
    connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
      if (signal.sdp.type === "offer") {
        connections[fromId].createAnswer().then((description) => {
          connections[fromId].setLocalDescription(description).then(() => {
            socketRef.current.emit("signal", fromId, JSON.stringify({ sdp: connections[fromId].localDescription }));
          }).catch(console.error);
        }).catch(console.error);
      }
    }).catch(console.error);
  }

  if (signal.ice) {
    connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(console.error);
  }
};




const signalBuffer = {}; // 🔁 Buffer signals until connection is ready

const connectToSocketServer = () => {
  socketRef.current = io.connect(serverUrl, { secure: false });

  socketRef.current.on("signal", gotMessageFromServer);

  socketRef.current.on("connect", () => {
    socketIdRef.current = socketRef.current.id;
    console.log("✅ Socket connected with ID:", socketIdRef.current);

    socketRef.current.emit("join-call", window.location.href);

    socketRef.current.on("chat-message", () => {});
    socketRef.current.on("user-left", (id) => {
      setVideos(prev => prev.filter(video => video.socketId !== id));
    });

    socketRef.current.on("user-joined", ({ id, clients }) => {
      console.log("🟢 User joined:", id);
      console.log("🧩 Active clients:", clients);

      (Array.isArray(clients) ? clients : []).forEach((socketListId) => {
        if (connections[socketListId]) return;

        console.log("📡 Setting up RTCPeerConnection for:", socketListId);
        const connection = new RTCPeerConnection(peerConfigConnections);
        connections[socketListId] = connection;

        connection.onicecandidate = (event) => {
          if (event.candidate) {
            socketRef.current.emit("signal", socketListId, JSON.stringify({ ice: event.candidate }));
          }
        };

        connection.onaddstream = (event) => {
          console.log("📺 onaddstream triggered for:", socketListId, event.stream);

          setVideos(prevVideos => {
            const videoExists = prevVideos.some(v => v.socketId === socketListId);
            if (videoExists) {
              return prevVideos.map(video =>
                video.socketId === socketListId ? { ...video, stream: event.stream } : video
              );
            } else {
              return [...prevVideos, {
                socketId: socketListId,
                stream: event.stream,
                autoPlay: true,
                playsInline: true,
              }];
            }
          });
        };

        if (window.localStream) {
          console.log("🎥 Adding localStream to connection:", socketListId);
          connection.addStream(window.localStream);
        } else {
          console.log("⚫ No localStream — using blackSilence for:", socketListId);
          const blackSilence = (...args) => new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          connection.addStream(window.localStream);
        }

        // 🔁 Replay buffered signals if any
        if (signalBuffer[socketListId]) {
          console.log(`🚀 Replaying ${signalBuffer[socketListId].length} buffered signals for ${socketListId}`);
          signalBuffer[socketListId].forEach(signal => {
            gotMessageFromServer(socketListId, JSON.stringify(signal));
          });
          delete signalBuffer[socketListId];
        }
      });

      if (id === socketIdRef.current) {
        for (let id2 in connections) {
          if (id2 === socketIdRef.current) continue;

          try {
            console.log("📤 Creating offer for:", id2);
            connections[id2].createOffer().then(description => {
              connections[id2].setLocalDescription(description).then(() => {
                socketRef.current.emit("signal", id2, JSON.stringify({ sdp: connections[id2].localDescription }));
              }).catch(err => console.error("❌ setLocalDescription error:", err));
            }).catch(err => console.error("❌ createOffer error:", err));
          } catch (err) {
            console.error("❌ Connection setup error:", err);
          }
        }
      }
    });
  });
};


  const getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    setAskForUsername(false);
    connectToSocketServer();
  };

  useEffect(() => {
    console.log("Asking for Permissions");
    getPermissions();
  }, []);

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [video, audio]);

  let handleVideo = () => {
    setVideo(!video);
  }

  let handleAudio = () => {
    setAudio(!audio);
  }


  return (
    <div>
      {askForUsername ? (
        <div className="videoParent">
          <h2>Enter Into Lobby</h2><br />
          <TextField
            id="outlined-basic"
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            variant="outlined"
          />
          <Button variant="contained" onClick={getMedia}>Connect</Button>
          <div className="videoDiv">
            <video ref={localVideoRef} autoPlay muted />
          </div>
        </div>
      ) : (
                <div className={styles.meetVideoContainer}>

                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton style={{ color: "red" }}>
                            <CallEndIcon  />
                        </IconButton>
                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        {screenAvailable === true ?
                            <IconButton style={{ color: "white" }}>
                                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton> : <></>}

                        <Badge badgeContent={newMessage} max={999} color='orange'>
                            <IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
                                <ChatIcon />                        </IconButton>
                        </Badge>

                    </div>

                    <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted />
                        {videos.map(video => (
                        <div className={styles.conferenceView} key={video.socketId}>
                            <h2>{video.socketId}</h2>
                            <video
                                data-socket={video.socketId}
                                autoPlay
                                playsInline
                                ref={ref => {
                                    if (ref && video.stream && ref.srcObject !== video.stream) {
                                    ref.srcObject = video.stream;
                                    }
                                }}
                            />               
                        </div>
                        ))}
                </div>
      )}
    </div>
  );
}
