import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Feedback = () => {
    const [rating, setRating] = useState(0);
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleStarClick = (star) => {
        setRating(star);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Send rating and message to backend here if needed
        setSubmitted(true);
        setTimeout(() => navigate('/dashboard'), 1500);
    };

    return (
        <div style={{ maxWidth: 400, margin: '2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
            <h2>Feedback</h2>
            {submitted ? (
                <div style={{ color: 'green' }}>Thank you for your feedback!</div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 8 }}>Rate your experience:</label>
                        <div>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    onClick={() => handleStarClick(star)}
                                    style={{
                                        fontSize: 32,
                                        cursor: 'pointer',
                                        color: star <= rating ? '#FFD700' : '#ccc',
                                        marginRight: 4,
                                    }}
                                    role="button"
                                    aria-label={`${star} Star`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label>Message:</label>
                        <textarea
                            name="message"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            required
                            rows={4}
                            style={{ width: '100%', padding: 8, marginTop: 4 }}
                        />
                    </div>
                    <button type="submit" style={{ padding: '8px 16px' }} disabled={rating === 0}>
                        Submit
                    </button>
                </form>
            )}
        </div>
    );
};

export default Feedback;