import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, IconButton, TextField,Menu,MenuItem } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';

function Dashboard() {

    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const [anchorEl, setAnchorEl] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [createdCode, setCreatedCode] = useState('');

    const {addToUserHistory} = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }

    function generateRandomCode() {
        const getRandomLetters = (length) => {
            const letters = 'abcdefghijklmnopqrstuvwxyz';
            let result = '';
            for (let i = 0; i < length; i++) {
            result += letters.charAt(Math.floor(Math.random() * letters.length));
            }
            return result;
        };

        const part1 = getRandomLetters(3);
        const part2 = getRandomLetters(4);
        const part3 = getRandomLetters(3);

        return `${part1}-${part2}-${part3}`;
    }

    

    // Open menu
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Close menu
    const handleClose = () => {
        setAnchorEl(null);
    };

    //Create a meet for later
    const handleCreate = async () => {
        const meetCode = generateRandomCode();
        setCreatedCode(meetCode);
        setShowModal(true);
        handleClose();
    }

    //Copy Handler
    const handleCopy = () => {
        navigator.clipboard.writeText(createdCode);
    };

    //Start an instant meet
    const handleStart = async () => {   
        const meetCode = generateRandomCode();
        console.log(meetCode);
        await addToUserHistory(meetCode);
        navigate(`/${meetCode}`);
    }

    return (
        <>

            <div className="navBar">

                <div style={{ display: "flex", alignItems: "center" }}>

                    <h2>PeerConnect</h2>
                </div>

                <div style={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={
                        () => {
                            navigate("/history")
                        }
                    }>
                        <RestoreIcon />
                    </IconButton>
                    <p>History</p>

                    <Button onClick={() => {
                        localStorage.removeItem("token")
                        navigate("/")
                    }}>
                        Logout
                    </Button>
                </div>


            </div>


            <div className="meetContainer">
                <div className="leftPanel">
                    <div>
                        <h2>Providing Quality Video Call</h2>

                        <div style={{ display: 'flex', gap: "10px" }}>

                            <Button variant="contained" onClick={handleClick}>
                                New Meeting
                            </Button>

                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={handleCreate}>Create an Meeting for later</MenuItem>
                                <MenuItem onClick={handleStart}>Start an Instant Meeting</MenuItem>
                            </Menu>

                                    
                            <TextField onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant="outlined" />
                            <Button onClick={handleJoinVideoCall} variant="contained" disabled={!meetingCode}>Join</Button>

                        </div>
                    </div>
                </div>
                <div className='rightPanel'>
                    <img srcSet='/logo3.png' alt="" />
                </div>
            </div>

            {showModal && (
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
            }}>
                <div style={{
                background: '#fff', padding: 32, borderRadius: 8, minWidth: 320, textAlign: 'center'
                }}>
                <h2>Here is your Meeting Info</h2>
                <div style={{ fontSize: 24, margin: '16px 0', wordBreak: 'break-all' }}>
                    {createdCode}
                    <Button onClick={handleCopy} style={{ marginLeft: 8 }}>Copy</Button>
                </div>
                <Button onClick={() => setShowModal(false)}>Close</Button>
                </div>
            </div>
            )}
        </>
    )
}


export default withAuth(Dashboard);
//export default Home;
