import React, { useRef, useState, useEffect } from "react";
import styles from '../styles/videoComponent.module.css';
import { TextField, Button } from "@mui/material";
import io from "socket.io-client";

const serverUrl = "http://localhost:3000";

let connections = {};
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

export default function VideoMeetComponent() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef();
  const videoRef = useRef();

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState([]);
  const [audio, setAudio] = useState(false);
  const [screen, setScreen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessage, setNewMessage] = useState(0);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [videos, setVideos] = useState([]);

  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

  const getPermissions = async () => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach(track => track.stop());
      }
      const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      setVideoAvailable(true);
      setAudioAvailable(true);

      window.localStream = userMediaStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = userMediaStream;
      }

      setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);
    } catch (err) {
      console.error("getPermissions Error:", err);
      setVideoAvailable(false);
      setAudioAvailable(false);
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

  const getUserMedia = async () => {
    try {
      if ((video && videoAvailable) || (audio && audioAvailable)) {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } else {
        const tracks = localVideoRef.current?.srcObject?.getTracks();
        if (tracks) tracks.forEach(track => track.stop());
      }
    } catch (e) {
      console.error("getUserMedia Error:", e);
    }
  };

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
          }).catch(console.error);
      });
    }

    stream.getTracks().forEach(track => {
      track.onended = () => {
        setVideo(false);
        setAudio(false);
        try {
          const tracks = localVideoRef.current?.srcObject?.getTracks();
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
            }).catch(console.error);
          });
        }
      };
    });
  };

  const gotMessageFromServer = (fromId, message) => {
    const signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
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
    }
  };

  const connectToSocketServer = () => {
    socketRef.current = io.connect(serverUrl, { secure: false });
    socketRef.current.on("signal", gotMessageFromServer);
    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", () => {});
      socketRef.current.on("user-left", (id) => {
        setVideos(prev => prev.filter(video => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        (Array.isArray(clients) ? clients : []).forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

          connections[socketListId].onicecandidate = event => {
            if (event.candidate != null) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ ice: event.candidate }));
            }
          };

          connections[socketListId].onaddstream = event => {
            const exists = videos.find(video => video.socketId === socketListId);

            if (exists) {
              setVideos(videos =>
                videos.map(video =>
                  video.socketId === socketListId ? { ...video, stream: event.stream } : video
                )
              );
            } else {
              const newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoPlay: true,
                playsInline: true
              };
              setVideos(prev => [...prev, newVideo]);
            }
          };

          if (window.localStream) {
            connections[socketListId].addStream(window.localStream);
          } else {
            const blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            try {
              connections[id2].addStream(window.localStream);
              connections[id2].createOffer().then(description => {
                connections[id2].setLocalDescription(description).then(() => {
                  socketRef.current.emit("signal", id2, JSON.stringify({ sdp: connections[id2].localDescription }));
                }).catch(console.error);
              });
            } catch (e) {
              console.error(e);
            }
          }
        }
      });
    });
  };

  const getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [video, audio]);

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
          <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted />
          {videos.map(video => (
            <div key={video.socketId}>
              <h2>{video.socketId}</h2>
              <video
                data-socket={video.socketId}
                ref={ref => {
                  if (ref && video.stream) ref.srcObject = video.stream;
                }}
                autoPlay
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
