import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from "../contexts/AuthContext.jsx";

const History = () => {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await getHistoryOfUser();
                console.log("Res",res);
                setMeetings(res.meetings || []);
                console.log("Meetings",meetings);
            } catch (err) {
                setMeetings([]);
            }
            setLoading(false);
        };
        fetchHistory();
    }, [getHistoryOfUser]);

    return (
        <div>
            <h1>History Page</h1>
            {loading ? (
                <p>Loading...</p>
            ) : meetings.length === 0 ? (
                <p>No past meetings found.</p>
            ) : (
                <ul>
                    {meetings.map((meeting, idx) => (
                        <li key={idx}>
                            <b>Meeting Code:</b> {meeting.meetingCode}
                            {meeting.date && (
                                <span> &nbsp; | &nbsp; <b>Date:</b> {new Date(meeting.date).toLocaleString()}</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default History;