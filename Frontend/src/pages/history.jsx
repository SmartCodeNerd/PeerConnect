"use client"

import { Video, ArrowLeft, Calendar, Clock, Users, Copy, Search, Filter } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../contexts/AuthContext.jsx";
import { useContext } from "react";
import withAuth from "../utils/withAuth.jsx";
import dayjs from "dayjs";

const History = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredMeetings, setFilteredMeetings] = useState([])
  const { getHistoryOfUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getHistoryOfUser()
        console.log("Res", res)
        setMeetings(res.meetings || [])
      } catch (err) {
        setMeetings([])
      }
      setLoading(false)
    }
    fetchHistory()
  }, [])

  useEffect(() => {
    const filtered = meetings.filter((meeting) => meeting.meetingCode.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredMeetings(filtered)
  }, [meetings, searchTerm])

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
  }

  const handleRejoinMeeting = (code) => {
    navigate(`/${code}`);
  }

  const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();

  // Remove time from both
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = nowOnly - dateOnly;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


  return (
    <>
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .history-container {
          min-height: 100vh;
          background: linear-gradient(to bottom right, #f2e6d8, #f4d9dc, #f3e6c6);
          position: relative;
          overflow: hidden;
        }

        /* Background decorative elements */
        .history-container::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          animation: float 6s ease-in-out infinite;
        }

        .history-container::after {
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

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-logo {
          width: 2.5rem;
          height: 2.5rem;
          background: linear-gradient(135deg, #ff6b35, #f7931e, #ffd23f);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
        }

        .brand-icon {
          width: 1.5rem;
          height: 1.5rem;
          color: white;
        }

        .brand-text h1 {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .brand-text p {
          font-size: 0.625rem;
          color: rgba(255, 107, 53, 0.8);
          font-weight: 500;
          margin: -0.25rem 0 0 0;
        }

        .page-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
        }

        /* Main Content */
        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          position: relative;
          z-index: 10;
        }

        .content-header {
          margin-bottom: 2rem;
        }

        .title-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .main-title {
          font-size: 3rem;
          font-weight: 800;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .title-gradient {
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: 1.125rem;
          color: #6b7280;
          font-weight: 500;
        }

        /* Search Section */
        .search-section {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          align-items: center;
        }

        .search-wrapper {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1.25rem;
          height: 1.25rem;
          color: #6b7280;
        }

        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid rgba(255, 107, 53, 0.2);
          border-radius: 1rem;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;
          outline: none;
        }

        .search-input:focus {
          border-color: #ff6b35;
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
          background: white;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border-radius: 1rem;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 107, 53, 0.1);
          color: #ff6b35;
          border: 2px solid rgba(255, 107, 53, 0.2);
        }

        .filter-btn:hover {
          background: rgba(255, 107, 53, 0.2);
          transform: translateY(-2px);
        }

        /* Loading State */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
        }

        .loading-spinner {
          width: 4rem;
          height: 4rem;
          border: 4px solid rgba(255, 107, 53, 0.2);
          border-top: 4px solid #ff6b35;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          font-size: 1.125rem;
          color: #6b7280;
          font-weight: 500;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-icon {
          width: 6rem;
          height: 6rem;
          color: rgba(255, 107, 53, 0.3);
          margin: 0 auto 2rem;
        }

        .empty-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .empty-subtitle {
          font-size: 1rem;
          color: #6b7280;
          margin-bottom: 2rem;
        }

        .empty-action {
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
        }

        .empty-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.5);
        }

        /* Meetings Grid */
        .meetings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .meeting-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 1.5rem;
          padding: 1.5rem;
          box-shadow: 0 10px 30px rgba(255, 107, 53, 0.1);
          border: 2px solid rgba(255, 107, 53, 0.1);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .meeting-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f);
        }

        .meeting-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(255, 107, 53, 0.2);
          border-color: rgba(255, 107, 53, 0.3);
        }

        .meeting-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .meeting-icon {
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
        }

        .meeting-icon svg {
          width: 1.5rem;
          height: 1.5rem;
          color: white;
        }

        .meeting-info h3 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 0.25rem;
        }

        .meeting-code {
          font-family: 'Courier New', monospace;
          font-size: 1rem;
          font-weight: 600;
          color: #ff6b35;
          background: rgba(255, 107, 53, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 0.5rem;
          display: inline-block;
        }

        .meeting-details {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .detail-icon {
          width: 1rem;
          height: 1rem;
        }

        .meeting-actions {
          display: flex;
          gap: 0.75rem;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
        }

        .action-btn-primary {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .action-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
        }

        .action-btn-secondary {
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
          border: 2px solid rgba(107, 114, 128, 0.2);
        }

        .action-btn-secondary:hover {
          background: rgba(107, 114, 128, 0.2);
          color: #374151;
        }

        .action-icon {
          width: 1rem;
          height: 1rem;
        }

        /* Stats Section */
        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          padding: 1.5rem;
          text-align: center;
          border: 2px solid rgba(255, 107, 53, 0.1);
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.1);
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .main-title {
            font-size: 2rem;
          }

          .search-section {
            flex-direction: column;
            align-items: stretch;
          }

          .search-wrapper {
            max-width: none;
          }

          .meetings-grid {
            grid-template-columns: 1fr;
          }

          .meeting-actions {
            flex-direction: column;
          }

          .stats-section {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .main-content {
            padding: 1rem;
          }

          .meeting-card {
            padding: 1rem;
          }

          .stats-section {
            grid-template-columns: 1fr;
          }
        }

        .header-right {
          display: flex;
          align-items: center;
        }
      `}</style>

      <div className="history-container">
        {/* Header */}
        <header className="header">
          <div className="header-container">
            <div className="header-left">
              {/* <button className="back-btn" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="back-icon" />
                Back to Dashboard
              </button> */}
              <div className="nav-brand">
                <div className="brand-logo">
                  <Video className="brand-icon" />
                </div>
                <div className="brand-text">
                  <h1>Mulakaat</h1>
                  <p>मुलाकात</p>
                </div>
              </div>
            </div>
            <div className="page-title">Meeting History</div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          <div className="title-section">
            <h1 className="main-title">
              Your <span className="title-gradient">Meeting</span> History
            </h1>
            <p className="subtitle">Review all your past video calls and reconnect with your team</p>
          </div>

          {!loading && meetings.length > 0 && (
            <>
              {/* Stats Section */}
              <div className="stats-section">
                <div className="stat-card">
                  <div className="stat-number">{meetings.length}</div>
                  <div className="stat-label">Total Meetings</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {
                      meetings.filter((m) => {
                        const date = new Date(m.date)
                        const now = new Date()
                        return (now - date) / (1000 * 60 * 60 * 24) <= 7
                      }).length
                    }
                  </div>
                  <div className="stat-label">This Week</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {
                      meetings.filter((m) => {
                        const date = new Date(m.date)
                        const now = new Date()
                        return (now - date) / (1000 * 60 * 60 * 24) <= 30
                      }).length
                    }
                  </div>
                  <div className="stat-label">This Month</div>
                </div>
              </div>

              {/* Search Section */}
              <div className="search-section">
                <div className="search-wrapper">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search meeting codes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="filter-btn">
                  <Filter className="back-icon" />
                  Filter
                </button>
              </div>
            </>
          )}

          {/* Loading State */}
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading your meeting history...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && meetings.length === 0 && (
            <div className="empty-state">
              <Calendar className="empty-icon" />
              <h2 className="empty-title">No meetings yet</h2>
              <p className="empty-subtitle">Start your first meeting to see your history here</p>
              <button className="empty-action" onClick={() => router.push("/dashboard")}>
                Start New Meeting
              </button>
            </div>
          )}

          {/* Meetings Grid */}
          {!loading && filteredMeetings.length > 0 && (
            <div className="meetings-grid">
              {filteredMeetings.map((meeting, idx) => (
                <div key={idx} className="meeting-card">
                  <div className="meeting-header">
                    <div className="meeting-icon">
                      <Video />
                    </div>
                    <div className="meeting-info">
                      <h3>Video Meeting</h3>
                      <div className="meeting-code">{meeting.meetingCode}</div>
                    </div>
                  </div>

                  <div className="meeting-details">
                    <div className="detail-item">
                      <Calendar className="detail-icon" />
                      {formatDate(meeting.date)}
                    </div>
                    <div className="detail-item">
                      <Clock className="detail-icon" />
                      {new Date(meeting.date).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <div className="meeting-actions">
                    <button
                      className="action-btn action-btn-primary"
                      onClick={() => handleRejoinMeeting(meeting.meetingCode)}
                    >
                      <Users className="action-icon" />
                      Rejoin
                    </button>
                    <button
                      className="action-btn action-btn-secondary"
                      onClick={() => handleCopyCode(meeting.meetingCode)}
                    >
                      <Copy className="action-icon" />
                      Copy Code
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Search Results */}
          {!loading && meetings.length > 0 && filteredMeetings.length === 0 && searchTerm && (
            <div className="empty-state">
              <Search className="empty-icon" />
              <h2 className="empty-title">No meetings found</h2>
              <p className="empty-subtitle">Try searching with a different meeting code</p>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export default withAuth(History);
