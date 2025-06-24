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
    //Close All Peer Connections
    for(let id in connections) {
       if(connections[id]) {
        connections[id].close();
        delete connections[id];
       }
    }
    
    //Stops All Local Media Tracks
    if(window.localStream) {
      window.localStream.getTracks().forEach(track => track.stop());
      window.localStream = null;
    }

    //Reset UI State
    setVideos([]);
    setAskForUsername(true);
    getPermissions();
    setShowModal(false);
    setChatMessages([]);
    setNewMessage(0);
    //Optionaly disconnect the socket
    if(socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
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
    <div>
      {askForUsername ? (
        <div className="videoParent">
          <h2>Enter Into Lobby</h2>
          <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <Button variant="contained" onClick={getMedia}>Connect</Button>
          <div className="videoDiv">
            <video ref={localVideoRef} autoPlay muted />
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          <div className={styles.buttonContainers}>
            <IconButton onClick={toggleAudio} style={{ color: 'white' }}>
            {audio ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
            <IconButton onClick={toggleVideo} style={{ color: 'white' }}>
            {video ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton
              onClick={screen ? undefined : startScreenShare}
              style={{ color: 'white' }}
              disabled={screen}
            >
              {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
            </IconButton>
            <Badge badgeContent={newMessage} color="error">
              <IconButton onClick={() => setShowModal(!showModal)} style={{ color: 'white' }}>
                <ChatIcon />
              </IconButton>
            </Badge>
            <IconButton onClick={endCall} style={{ color: 'red' }}><CallEndIcon /></IconButton>
          </div>

          <div className={styles.localVideoBox}>
            <h2>You</h2>
            <video ref={localVideoRef} autoPlay muted playsInline className={styles.localVideo} />
          </div>

          <div className={styles.remoteContainer}>
            {videos.map(({ socketId, stream }) => (
              <div className={styles.remoteBox} key={socketId}>
                <h2>{socketId}</h2>
                <VideoPlayer stream={stream} />
              </div>
            ))}
          </div>

          {/* Chat modal */}
          {showModal && (
            <div className={styles.chatModal}>
              <div className={styles.chatHeader}>
                <h3>Chat</h3>
                <Button onClick={() => setShowModal(false)}>Close</Button>
              </div>
              <div className={styles.chatBody}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={styles.chatMessage}>
                    <b>{msg.sender}:</b> {msg.data}
                  </div>
                ))}
              </div>
              <div className={styles.chatInput}>
                <TextField
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') sendChatMessage(); }}
                  placeholder="Type a message..."
                  fullWidth
                />
                <Button onClick={sendChatMessage} variant="contained">Send</Button>
              </div>
            </div>
          )}


        </div>
      )}
    </div>
  );
}
