import React from 'react';
import withAuth from '../utils/withAuth';

const Home = () => {
    return (
        <div style={{ padding: '2rem' }}>
            <h1>Welcome to PeerConnect</h1>
            <p>
                This is the home page of your application. Start connecting with peers and collaborating on projects!
            </p>
        </div>
    ); 
};

export default withAuth(Home);