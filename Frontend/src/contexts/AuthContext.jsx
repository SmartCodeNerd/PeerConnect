import axios from 'axios';
import httpStatus from 'http-status';
import { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: 'http://localhost:3000/user',
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null); // Initialize with null
  const router = useNavigate();

  const handleRegister = async (name, username, password) => {
    try {
      let request = await client.post('/auth/register', {
        name,
        username,
        password,
      });
      if (request.status === httpStatus.CREATED) {
        return request.data.message;
      }
    } catch (err) {
      throw err;
    }
  };

  const handleLogin = async (username, password) => {
    try {
      let request = await client.post('/auth/login', {
        username,
        password,
      });
      if (request.status === httpStatus.OK) {
        localStorage.setItem('token', request.data.token);
        setUserData({ username }); // Store username in userData
        router('/dashboard');
      }
    } catch (err) {
      throw err;
    }
  };

  const getHistoryOfUser = async () => {
    try {
      let request = await client.get('/get-all-activity', {
        params: {
          token: localStorage.getItem('token'),
        },
      });
      return request.data;
    } catch (err) {
      throw err;
    }
  };

  const addToUserHistory = async (meetingCode) => {
    try {
      let request = await client.post('/add-to-activity', {
        token: localStorage.getItem('token'),
        meetingCode,
      });
      return request;
    } catch (e) {
      throw e;
    }
  };

  const data = {
    userData,
    setUserData,
    addToUserHistory,
    getHistoryOfUser,
    handleRegister,
    handleLogin,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};