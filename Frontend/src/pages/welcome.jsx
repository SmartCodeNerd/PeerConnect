// import "../App.css";
// import { Link, useNavigate } from "react-router-dom";
// import React from "react";

// const Welcome = () => {
//   return (
//     <div className="landingPageContainer"> 
//       <nav>
//                 <div className='navHeader'>
//                     <h2>PeerConnect</h2>
//                 </div>
//                 <div className='navlist'>
//                     <p onClick={() => {
//                         router("/aljk23")
//                     }}>Join as Guest</p>
//                     <p onClick={() => {
//                         router("/auth")

//                     }}>Register</p>
//                     <div onClick={() => {
//                         router("/auth")

//                     }} role='button'>
//                         <p>Login</p>
//                     </div>
//                 </div>
//             </nav>

//             <div className="landingMainContainer">
//               <div className="mobileText">
//                 <h1><span style={{color:"#D97500"}}>Connect</span> With Your Loved Ones</h1>
//                 <p>Cover a distance by PeerConnect</p>
//                 <div role='button' className="getStartedButton">
//                   <Link to={"/auth"}>Get Started</Link>
//                 </div>
//               </div>
//               <div className="mobileImage">
//                 <img src="/mobile.png" alt="landing" />
//               </div>
//             </div>
//     </div>
//   );
// };

// export default Welcome;
//------------------------old code above

"use client"

import { Video, Users, Shield, Smartphone, ArrowRight, Star, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Welcome = () => {
  // const navigate = (path) => {
  //   console.log(`Navigating to: ${path}`)
  // }

  const navigate = useNavigate();

  return (
    <>
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .landing-container {
          min-height: 100vh;
          background: linear-gradient(to bottom right, #f2e6d8, #f4d9dc, #f3e6c6);
          position: relative;
          overflow: hidden;
        }

        /* Background decorative elements */
        .landing-container::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          animation: float 6s ease-in-out infinite;
        }

        .landing-container::after {
          content: "";
          position: absolute;
          bottom: -30%;
          left: -30%;
          width: 60%;
          height: 60%;
          background: radial-gradient(circle, rgba(255, 107, 53, 0.2) 0%, transparent 70%);
          animation: float 8s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        /* Header */
        .header {
          border-bottom: 1px solid rgba(255, 107, 53, 0.2);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 2px 10px rgba(255, 107, 53, 0.1);
        }

        .header-container {
          max-width: 100%;
          margin: 0;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          padding-bottom: 1rem;
          width: 100%;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-logo {
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, #ff6b35, #f7931e, #ffd23f);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
        }

        .brand-icon {
          width: 1.75rem;
          height: 1.75rem;
          color: white;
        }

        .brand-text h1 {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .brand-text p {
          font-size: 0.75rem;
          color: rgba(255, 107, 53, 0.8);
          font-weight: 500;
          margin: -0.25rem 0 0 0;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-link {
          color: #374151;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .nav-link:hover {
          color: #ff6b35;
        }

        .nav-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .nav-btn-outline {
          border: 2px solid rgba(255, 107, 53, 0.3);
          color: #ff6b35;
          background: rgba(255, 107, 53, 0.1);
        }

        .nav-btn-outline:hover {
          background: rgba(255, 107, 53, 0.2);
          border-color: rgba(255, 107, 53, 0.5);
          transform: translateY(-2px);
        }

        .nav-btn-primary {
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f);
          color: white;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
        }

        .nav-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.6);
        }

        /* Hero Section */
        .hero-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          padding-top: 3rem;
          text-align: center;
          position: relative;
          z-index: 10;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          border: 2px solid rgba(255, 107, 53, 0.2);
          margin-bottom: 3rem;
          backdrop-filter: blur(10px);
        }

        .badge-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .badge-icon:first-child {
          color: #ffd23f;
          fill: currentColor;
        }

        .badge-icon:last-child {
          color: #ff6b35;
          fill: currentColor;
        }

        .badge-text {
          color: #ff6b35;
          font-weight: 500;
        }

        .hero-title {
          font-size: 5rem;
          font-weight: 800;
          color: #374151;
          margin-bottom: 2rem;
          line-height: 1.2;
        }

        .hero-title-gradient {
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-title-gradient-2 {
          background: linear-gradient(45deg, #e91e63, #9c27b0, #673ab7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.7rem;
          color: #6b7280;
          margin-bottom: 1rem;
          font-weight: 500;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          margin-bottom: 4rem;
        }

        .hero-cta {
          margin-bottom: 4rem;
        }

        .get-started-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f, #e91e63);
          background-size: 300% 300%;
          animation: gradientButton 3s ease infinite;
          color: white;
          text-decoration: none;
          font-size: 1.25rem;
          font-weight: 600;
          padding: 2rem 2.5rem;
          border-radius: 50px;
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          border: none;
          cursor: pointer;
        }

        @keyframes gradientButton {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .get-started-btn:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 12px 35px rgba(255, 107, 53, 0.6);
        }

        .btn-icon {
          width: 1.5rem;
          height: 1.5rem;
        }

        /* Demo Section */
        .hero-demo {
          position: relative;
          max-width: 1000px;
          margin: 0 auto;
        }

        .demo-container {
          background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.05));
          border-radius: 3rem;
          padding: 2rem;
          border: 2px solid rgba(255, 107, 53, 0.2);
          box-shadow: 0 20px 40px rgba(255, 107, 53, 0.1);
          backdrop-filter: blur(10px);
        }

        .demo-screen {
          background: white;
          border-radius: 2rem;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(255, 107, 53, 0.2);
        }

        .demo-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .demo-participant {
          aspect-ratio: 16 / 9;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .demo-participant:hover {
          transform: scale(1.05);
        }

        .demo-participant-1 { background: linear-gradient(135deg, #ff6b35, #f7931e); }
        .demo-participant-2 { background: linear-gradient(135deg, #667eea, #764ba2); }
        .demo-participant-3 { background: linear-gradient(135deg, #43e97b, #38f9d7); }
        .demo-participant-4 { background: linear-gradient(135deg, #ffd23f, #ff6b35); }
        .demo-participant-5 { background: linear-gradient(135deg, #e91e63, #9c27b0); }
        .demo-participant-6 { background: linear-gradient(135deg, #764ba2, #667eea); }

        .participant-avatar {
          width: 4rem;
          height: 4rem;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .avatar-icon {
          width: 2rem;
          height: 2rem;
          color: white;
        }

        .demo-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
        }

        .control-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 25px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .control-btn-end {
          background: linear-gradient(45deg, #ff6b6b, #ee5a52);
          color: white;
        }

        .control-btn-mute {
          background: linear-gradient(45deg, #51cf66, #40c057);
          color: white;
        }

        .control-btn-camera {
          background: linear-gradient(45deg, #339af0, #228be6);
          color: white;
        }

        .control-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        /* Decorative elements */
        .demo-decoration {
          position: absolute;
          border-radius: 50%;
          opacity: 0.8;
        }

        .demo-decoration-1 {
          top: -1.5rem;
          right: -1.5rem;
          width: 3rem;
          height: 3rem;
          background: linear-gradient(45deg, #ffd23f, #ff6b35);
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
        }

        .demo-decoration-2 {
          bottom: -1.5rem;
          left: -1.5rem;
          width: 2.5rem;
          height: 2.5rem;
          background: linear-gradient(45deg, #e91e63, #9c27b0);
          box-shadow: 0 4px 15px rgba(233, 30, 99, 0.4);
        }

        .demo-decoration-3 {
          top: 50%;
          right: -1rem;
          width: 2rem;
          height: 2rem;
          background: linear-gradient(45deg, #667eea, #764ba2);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        /* Features Section */
        .features-section {
          padding: 5rem 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 107, 53, 0.05));
        }

        .features-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .features-title {
          text-align: center;
          margin-bottom: 4rem;
        }

        .features-title h3 {
          font-size: 3rem;
          font-weight: 800;
          color: #374151;
          margin-bottom: 1.5rem;
        }

        .features-title-gradient {
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .features-title p {
          font-size: 1.25rem;
          color: #6b7280;
          font-weight: 500;
          max-width: 48rem;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2.5rem;
        }

        .feature-card {
          border: 2px solid rgba(255, 107, 53, 0.2);
          border-radius: 2rem;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 30px rgba(255, 107, 53, 0.1);
        }

        .feature-card:hover {
          transform: translateY(-0.5rem);
          box-shadow: 0 20px 40px rgba(255, 107, 53, 0.2);
        }

        .feature-card-1 {
          background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.05));
        }

        .feature-card-2 {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05));
        }

        .feature-card-3 {
          background: linear-gradient(135deg, rgba(67, 233, 123, 0.1), rgba(56, 249, 215, 0.05));
        }

        .feature-icon {
          width: 5rem;
          height: 5rem;
          border-radius: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .feature-icon-1 {
          background: linear-gradient(135deg, #ff9a56, #ff6b35, #f7931e);
        }

        .feature-icon-2 {
          background: linear-gradient(135deg, #667eea, #764ba2, #9c27b0);
        }

        .feature-icon-3 {
          background: linear-gradient(135deg, #43e97b, #38f9d7, #4facfe);
        }

        .feature-icon svg {
          width: 2.5rem;
          height: 2.5rem;
          color: white;
        }

        .feature-card h4 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 1rem;
        }

        .feature-card p {
          font-size: 1.125rem;
          color: #6b7280;
          line-height: 1.6;
        }

        /* CTA Section */
        .cta-section {
          padding: 5rem 0;
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f, #e91e63);
          position: relative;
          overflow: hidden;
        }

        .cta-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.1);
        }

        .cta-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          text-align: center;
          position: relative;
          z-index: 10;
        }

        .cta-container h3 {
          font-size: 3rem;
          font-weight: 800;
          color: white;
          margin-bottom: 1.5rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .cta-container p {
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 2.5rem;
          font-size: 1.25rem;
          font-weight: 500;
        }

        .cta-btn {
          background: white;
          color: #ff6b35;
          font-size: 1.25rem;
          font-weight: 600;
          padding: 1rem 3rem;
          border-radius: 50px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
        }

        .cta-btn:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
          background: rgba(255, 255, 255, 0.95);
        }

        /* Footer */
        .footer {
          background: linear-gradient(135deg, #1a1a1a, #2d2d2d, #000000);
          color: white;
          padding: 4rem 0;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2.5rem;
        }

        .footer-brand .brand-logo {
          width: 3rem;
          height: 3rem;
        }

        .footer-brand h4 {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .footer-brand p {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
        }

        .footer-text {
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
        }

        .footer-text p {
          font-size: 1.125rem;
        }

        .footer-heart {
          color: #ff6b35;
        }

        .footer-india {
          color: #ffd23f;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .header-container {
            max-width: 100%;
            margin: 0;
            padding: 0 1rem;
            flex-direction: column;
            gap: 1rem;
            justify-content: center;
          }

          .nav-menu {
            flex-direction: column;
            gap: 1rem;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-description {
            font-size: 1.2rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .demo-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .demo-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .features-title h3 {
            font-size: 2rem;
          }

          .cta-container h3 {
            font-size: 2rem;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 2rem;
          }

          .demo-grid {
            grid-template-columns: 1fr;
          }

          .demo-container {
            padding: 1rem;
          }

          .demo-screen {
            padding: 1rem;
          }
        }
      `}</style>

      <div className="landing-container">
        {/* Header */}
        <header className="header">
          <div className="header-container">
            <div className="nav-brand">
              <div className="brand-logo">
                <Video className="brand-icon" />
              </div>
              <div className="brand-text">
                <h1>Mulakaat</h1>
                <p>मुलाकात</p>
              </div>
            </div>
            <nav className="nav-menu">
              <a href="#features" className="nav-link">
                Features
              </a>
              <a href="#about" className="nav-link">
                About
              </a>
              <button className="nav-btn nav-btn-outline" onClick={() => navigate("/auth")}>
                Sign In
              </button>
              <button className="nav-btn nav-btn-primary" onClick={() => navigate("/auth")}>
                Register
              </button>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-badge">
            <Star className="badge-icon" />
            <span className="badge-text">Made with ❤️ in India</span>
            <Heart className="badge-icon" />
          </div>

          <h2 className="hero-title">
            Connect with <span className="hero-title-gradient">Warmth</span>
            <br />
            <span className="hero-title-gradient-2">& Joy</span>
          </h2>

          <p className="hero-description">Video calling that brings people together, the Indian way</p>
          <p className="hero-subtitle">🙏 नमस्ते से शुरू होने वाली हर मुलाकात</p>

          <div className="hero-cta">
            <button className="get-started-btn" onClick={() => navigate("/auth")}>
              <Video className="btn-icon" />
              Get Started
            </button>
          </div>

          {/* Hero Demo */}
          <div className="hero-demo">
            <div className="demo-container">
              <div className="demo-screen">
                <div className="demo-grid">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className={`demo-participant demo-participant-${i}`}>
                      <div className="participant-avatar">
                        <Users className="avatar-icon" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="demo-controls">
                  <button className="control-btn control-btn-end">End Call</button>
                  <button className="control-btn control-btn-mute">Mute</button>
                  <button className="control-btn control-btn-camera">Camera</button>
                </div>
              </div>
            </div>
            <div className="demo-decoration demo-decoration-1"></div>
            <div className="demo-decoration demo-decoration-2"></div>
            <div className="demo-decoration demo-decoration-3"></div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <div className="features-container">
            <div className="features-title">
              <h3>
                Built for <span className="features-title-gradient">Everyone</span>
              </h3>
              <p>
                From family gatherings to business meetings, Mulakaat makes every connection meaningful and colorful
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-card feature-card-1">
                <div className="feature-icon feature-icon-1">
                  <Video />
                </div>
                <h4>Crystal Clear Video</h4>
                <p>High-quality video calls that make you feel like you're in the same room, sharing the same warmth</p>
              </div>

              <div className="feature-card feature-card-2">
                <div className="feature-icon feature-icon-2">
                  <Shield />
                </div>
                <h4>Secure & Private</h4>
                <p>
                  End-to-end encryption ensures your conversations stay private and secure, just like family secrets
                </p>
              </div>

              <div className="feature-card feature-card-3">
                <div className="feature-icon feature-icon-3">
                  <Smartphone />
                </div>
                <h4>Works Everywhere</h4>
                <p>Join from any device - mobile, tablet, or desktop. No downloads required, just pure connection</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-container">
            <h3>Ready to start your first Mulakaat?</h3>
            <p>Join millions who choose warmth and color over cold connections</p>
            <button className="cta-btn" onClick={() => navigate("/auth")}>
              Get Started Free
              <ArrowRight className="btn-icon" />
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-container">
            <div className="footer-brand">
              <div className="brand-logo">
                <Video className="brand-icon" />
              </div>
              <div>
                <h4>Mulakaat</h4>
                <p>मुलाकात</p>
              </div>
            </div>
            <div className="footer-text">
              <p>
                &copy; 2024 Mulakaat. Made with <span className="footer-heart">❤️</span> in{" "}
                <span className="footer-india">India</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export default Welcome
