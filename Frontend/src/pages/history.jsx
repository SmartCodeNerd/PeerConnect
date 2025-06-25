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
                setMeetings(res.data.meetings || []);
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
                            {meeting.createdAt && (
                                <span> &nbsp; | &nbsp; <b>Date:</b> {new Date(meeting.createdAt).toLocaleString()}</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default History;