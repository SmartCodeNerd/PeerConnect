import React, { use, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Feedback = () => {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the feedback to your backend API
        setSubmitted(true);
        navigate('/dashboard');
    };

    return (
        <div style={{ maxWidth: 500, margin: '2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
            <h2>Feedback</h2>
            {submitted ? (
                <div style={{ color: 'green' }}>Thank you for your feedback!</div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 12 }}>
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: 8, marginTop: 4 }}
                        />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: 8, marginTop: 4 }}
                        />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label>Message:</label>
                        <textarea
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            required
                            rows={4}
                            style={{ width: '100%', padding: 8, marginTop: 4 }}
                        />
                    </div>
                    <button type="submit" style={{ padding: '8px 16px' }}>Submit</button>
                </form>
            )}
        </div>
    );
};

export default Feedback;