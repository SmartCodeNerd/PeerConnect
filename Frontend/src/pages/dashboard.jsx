"use client"

import { Video, Users, History, LogOut, Copy, Plus, Play, Calendar, Star, Heart, Settings } from "lucide-react"
import { useState,useContext } from "react"
import { useNavigate } from "react-router-dom";
import withAuth from '../utils/withAuth';


const Dashboard = () => {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [createdCode, setCreatedCode] = useState("")
  

  const handleJoinVideoCall = async () => {
    if (meetingCode.trim()) {
      // await addToUserHistory(meetingCode);
      console.log("handleJoinVideoCall",meetingCode);
      navigate(`/${meetingCode}`, {
        state:{
          meetCode:meetingCode,
        }
      }
      )
  }
}

  const generateRandomCode = () => {
    const getRandomLetters = (length) => {
      const letters = "abcdefghijklmnopqrstuvwxyz"
      let result = ""
      for (let i = 0; i < length; i++) {
        result += letters.charAt(Math.floor(Math.random() * letters.length))
      }
      return result
    }

    const part1 = getRandomLetters(3)
    const part2 = getRandomLetters(4)
    const part3 = getRandomLetters(3)

    return `${part1}-${part2}-${part3}`
  }

  const handleCreateMeeting = async () => {
    const meetCode = generateRandomCode()
    setCreatedCode(meetCode)
    setShowModal(true)
    setShowDropdown(false)
  }

  const handleStartInstantMeeting = async () => {
    const meetCode = generateRandomCode();
    console.log("handleJoinVideoCall",meetCode);
    navigate(`/${meetCode}`,{
        state:{
          meetCode:meetCode,
        }
    }
  )
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(createdCode)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/");
  }

  return (
    <>
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(to bottom right, #f2e6d8, #f4d9dc, #f3e6c6);
          position: relative;
          overflow: hidden;
        }

        /* Background decorative elements */
        .dashboard-container::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          animation: float 6s ease-in-out infinite;
        }

        .dashboard-container::after {
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
          gap: 1.5rem;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 1rem;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          background: rgba(255, 107, 53, 0.1);
          color: #ff6b35;
          border: 2px solid rgba(255, 107, 53, 0.2);
        }

        .nav-btn:hover {
          background: rgba(255, 107, 53, 0.2);
          transform: translateY(-2px);
        }

        .nav-btn-logout {
          background: linear-gradient(45deg, #ff6b6b, #ee5a52);
          color: white;
          border: none;
        }

        .nav-btn-logout:hover {
          background: linear-gradient(45deg, #ff5252, #e53935);
        }

        .nav-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        /* Main Content */
        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 4rem 2rem;
          position: relative;
          z-index: 10;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .left-panel {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .welcome-section {
          margin-bottom: 2rem;
        }

        .welcome-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(45deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1));
          padding: 0.5rem 1rem;
          border-radius: 50px;
          border: 2px solid rgba(255, 107, 53, 0.2);
          margin-bottom: 1.5rem;
        }

        .badge-icon {
          width: 1rem;
          height: 1rem;
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
          font-size: 0.875rem;
        }

        .dashboard-title {
          font-size: 3rem;
          font-weight: 800;
          color: #374151;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .title-gradient {
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dashboard-subtitle {
          font-size: 1.25rem;
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 2rem;
        }

        /* Meeting Actions */
        .meeting-actions {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .new-meeting-section {
          position: relative;
        }

        .new-meeting-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f, #e91e63);
          background-size: 300% 300%;
          animation: gradientButton 3s ease infinite;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 1rem;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
          width: 100%;
          justify-content: center;
        }

        @keyframes gradientButton {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .new-meeting-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(255, 107, 53, 0.6);
        }

        .btn-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        /* Dropdown */
        .dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 10px 30px rgba(255, 107, 53, 0.2);
          border: 2px solid rgba(255, 107, 53, 0.1);
          margin-top: 0.5rem;
          overflow: hidden;
          z-index: 100;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border: none;
          background: none;
          width: 100%;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #374151;
          font-weight: 500;
        }

        .dropdown-item:hover {
          background: linear-gradient(45deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.05));
          color: #ff6b35;
        }

        .dropdown-item:not(:last-child) {
          border-bottom: 1px solid rgba(255, 107, 53, 0.1);
        }

        /* Join Meeting */
        .join-meeting-section {
          display: flex;
          gap: 1rem;
        }

        .meeting-input {
          flex: 1;
          padding: 1rem;
          border: 2px solid rgba(255, 107, 53, 0.2);
          border-radius: 1rem;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;
          outline: none;
        }

        .meeting-input:focus {
          border-color: #ff6b35;
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
          background: white;
        }

        .join-btn {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          white-space: nowrap;
        }

        .join-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
        }

        .join-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Right Panel */
        .right-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .demo-container {
          background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.05));
          border-radius: 3rem;
          padding: 2rem;
          border: 2px solid rgba(255, 107, 53, 0.2);
          box-shadow: 0 20px 40px rgba(255, 107, 53, 0.1);
          backdrop-filter: blur(10px);
          max-width: 500px;
        }

        .demo-screen {
          background: white;
          border-radius: 2rem;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(255, 107, 53, 0.2);
        }

        .demo-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
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

        .participant-avatar {
          width: 3rem;
          height: 3rem;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .avatar-icon {
          width: 1.5rem;
          height: 1.5rem;
          color: white;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 2rem;
          min-width: 400px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          border: 2px solid rgba(255, 107, 53, 0.1);
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 1.5rem;
        }

        .modal-code {
          font-size: 1.5rem;
          font-weight: 600;
          color: #ff6b35;
          background: rgba(255, 107, 53, 0.1);
          padding: 1rem;
          border-radius: 1rem;
          margin: 1rem 0;
          word-break: break-all;
          border: 2px solid rgba(255, 107, 53, 0.2);
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 1.5rem;
        }

        .modal-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 1rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .modal-btn-copy {
          background: linear-gradient(45deg, #ff6b35, #f7931e);
          color: white;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
        }

        .modal-btn-copy:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.5);
        }

        .modal-btn-close {
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
          border: 2px solid rgba(107, 114, 128, 0.2);
        }

        .modal-btn-close:hover {
          background: rgba(107, 114, 128, 0.2);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }

          .nav-menu {
            flex-direction: column;
            gap: 1rem;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .dashboard-title {
            font-size: 2rem;
          }

          .join-meeting-section {
            flex-direction: column;
          }

          .modal-content {
            min-width: 300px;
            margin: 1rem;
          }

          .modal-actions {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="dashboard-container">
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
              <button className="nav-btn" onClick={() => navigate("/history")}>
                <History className="nav-icon" />
                History
              </button>
              <button className="nav-btn">
                <Settings className="nav-icon" />
                Settings
              </button>
              <button className="nav-btn nav-btn-logout" onClick={handleLogout}>
                <LogOut className="nav-icon" />
                Logout
              </button>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          <div className="dashboard-grid">
            {/* Left Panel */}
            <div className="left-panel">
              <div className="welcome-section">
                <div className="welcome-badge">
                  <Star className="badge-icon" />
                  <span className="badge-text">Welcome to Dashboard</span>
                  <Heart className="badge-icon" />
                </div>
                <h1 className="dashboard-title">
                  Providing <span className="title-gradient">Quality</span> Video Calls
                </h1>
                <p className="dashboard-subtitle">
                  Start or join meetings with ease. Connect with warmth and joy, the Indian way.
                </p>
              </div>

              <div className="meeting-actions">
                {/* New Meeting */}
                <div className="new-meeting-section">
                  <button className="new-meeting-btn" onClick={() => setShowDropdown(!showDropdown)}>
                    <Plus className="btn-icon" />
                    New Meeting
                  </button>

                  {showDropdown && (
                    <div className="dropdown">
                      <button className="dropdown-item" onClick={handleCreateMeeting}>
                        <Calendar className="btn-icon" />
                        Create Meeting for Later
                      </button>
                      <button className="dropdown-item" onClick={handleStartInstantMeeting}>
                        <Play className="btn-icon" />
                        Start Instant Meeting
                      </button>
                    </div>
                  )}
                </div>

                {/* Join Meeting */}
                <div className="join-meeting-section">
                  <input
                    type="text"
                    className="meeting-input"
                    placeholder="Enter meeting code"
                    value={meetingCode}
                    onChange={(e) => setMeetingCode(e.target.value)}
                  />
                  <button className="join-btn" onClick={handleJoinVideoCall} disabled={!meetingCode.trim()}>
                    Join
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="right-panel">
              <div className="demo-container">
                <div className="demo-screen">
                  <div className="demo-grid">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`demo-participant demo-participant-${i}`}>
                        <div className="participant-avatar">
                          <Users className="avatar-icon" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: "center", color: "#6b7280", fontSize: "0.875rem" }}>
                    Ready to connect with your team
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Here is your Meeting Info</h2>
              <div className="modal-code">{createdCode}</div>
              <div className="modal-actions">
                <button className="modal-btn modal-btn-copy" onClick={handleCopy}>
                  <Copy style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }} />
                  Copy Code
                </button>
                <button className="modal-btn modal-btn-close" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default withAuth(Dashboard);
