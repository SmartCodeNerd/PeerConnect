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

    const [anchorEl, setAnchorEl] = useState(null);

    // Open menu
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Close menu
    const handleClose = () => {
        setAnchorEl(null);
    };

    //Create a meet for later
    const handleCreate = () => {
        console.log(generateRandomCode());
    }

    //Start an instant meet
    const handleStart = async () => {
        const meetCode = generateRandomCode();
        await addToUserHistory(meetingCode)
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
        </>
    )
}


export default withAuth(Dashboard);
//export default Home;
