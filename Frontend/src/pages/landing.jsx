import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import React from "react";

const Landing = () => {
  return (
    <div className="landingPageContainer"> 
      <nav>
                <div className='navHeader'>
                    <h2>PeerConnect</h2>
                </div>
                <div className='navlist'>
                    <p onClick={() => {
                        router("/aljk23")
                    }}>Join as Guest</p>
                    <p onClick={() => {
                        router("/auth")

                    }}>Register</p>
                    <div onClick={() => {
                        router("/auth")

                    }} role='button'>
                        <p>Login</p>
                    </div>
                </div>
            </nav>

            <div className="landingMainContainer">
              <div className="mobileText">
                <h1><span style={{color:"#D97500"}}>Connect</span> With Your Loved Ones</h1>
                <p>Cover a distance by PeerConnect</p>
                <div role='button' className="getStartedButton">
                  <Link to={"/auth"}>Get Started</Link>
                </div>
              </div>
              <div className="mobileImage">
                <img src="/mobile.png" alt="landing" />
              </div>
            </div>
    </div>
  );
};

export default Landing;