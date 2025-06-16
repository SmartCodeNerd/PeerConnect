import React from 'react';
import PropTypes from 'prop-types';
import { createContext } from 'react';

export const AuthContext = React.createContext({});

const client = axios.create({
    baseURL: "http://localhost:3000/auth"
})

export const AuthProvider = ({ children }) => {
    const authContext = useContext(AuthContext);
    const [userData,setUserData] = React.useState(authContext);

    const handleRegister = async (name,username,password) => {
        try {
            let request = await client.post("/register",{
                name:name,
                username:username,
                password:password
            })

            if(request.status === httpStatus.CREATED) {
                return request.data.message;
            }
        }
        catch(err) {
            throw err;
        }
    }
    
    const handleLogin = async (username,password) => {
        try {
            let request = await client.post("/login", {
                username:username,
                password:password
            });

            if(request.status === httpStatus.OK) {
                localStorage.setItem("token",request.data.token);
            }
        }
        catch(err) {

        }
    }

    const router = useNavigate();
    const data = {
        userData,setUserData,handleRegister
    } 
    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
}