"use client"

import { Video, Star, Heart, Send, ArrowLeft } from "lucide-react"
import { useState,useContext } from "react"
import { useNavigate,useLocation } from "react-router-dom"
import { AuthContext } from "../contexts/AuthContext";
import withAuth from "../utils/withAuth";

const Feedback = () => {
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()
  const location = useLocation();
  const { meetCode } = location.state || {};
  const { submitFeedback } = useContext(AuthContext);

  const handleStarClick = (star) => {
    setRating(star);
  }

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await submitFeedback(rating, message,meetCode);
    setSubmitted(true);
    setTimeout(() => navigate("/dashboard"), 1500);
  } catch (err) {
    console.error("Feedback error:", err);
    alert("Failed to submit feedback.");
  }
};

  return (
    <>
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .feedback-container {
          width: 100vw;
          height: 100vh;
          background: linear-gradient(to bottom right, #f2e6d8, #f4d9dc, #f3e6c6);
          position: fixed;
          top: 0;
          left: 0;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          grid-template-rows: auto 1fr auto;
          gap: 2rem;
          padding: 2rem;
        }

        /* Background decorative elements */
        .feedback-container::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          animation: float 6s ease-in-out infinite;
        }

        .feedback-container::after {
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
        .feedback-header {
          grid-column: 2;
          grid-row: 1;
          text-align: center;
          z-index: 10;
        }

        .brand-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .brand-logo {
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, #ff6b35, #f7931e, #ffd23f);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
        }

        .brand-icon {
          width: 1.75rem;
          height: 1.75rem;
          color: white;
        }

        .brand-text h1 {
          font-size: 2rem;
          font-weight: 800;
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

        .feedback-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(45deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1));
          padding: 0.5rem 1rem;
          border-radius: 50px;
          border: 2px solid rgba(255, 107, 53, 0.2);
          margin-bottom: 1rem;
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

        .feedback-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .title-gradient {
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .feedback-subtitle {
          color: #6b7280;
          font-size: 1.125rem;
          font-weight: 500;
        }

        /* Main Content */
        .feedback-content {
          grid-column: 2;
          grid-row: 2;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 2rem;
          padding: 3rem;
          box-shadow: 0 20px 40px rgba(255, 107, 53, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          position: relative;
          z-index: 10;
          //overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .feedback-content::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f);
        }

        /* Success State */
        .success-container {
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
        }

        .success-icon {
          width: 5rem;
          height: 5rem;
          background: linear-gradient(45deg, #51cf66, #40c057);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
          box-shadow: 0 8px 25px rgba(81, 207, 102, 0.4);
          animation: successPulse 2s ease-in-out infinite;
        }

        @keyframes successPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .success-icon svg {
          width: 2.5rem;
          height: 2.5rem;
          color: white;
        }

        .success-title {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(45deg, #51cf66, #40c057);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
        }

        .success-message {
          color: #6b7280;
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .redirect-message {
          color: rgba(255, 107, 53, 0.8);
          font-size: 1rem;
          font-style: italic;
        }

        /* Form Styles */
        .feedback-form {
          display: grid;
          grid-template-rows: auto auto 1fr auto;
          gap: 2rem;
          height: 100%;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-label {
          font-weight: 600;
          color: #374151;
          font-size: 1.25rem;
          text-align: center;
        }

        /* Star Rating */
        .star-rating-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .star-rating {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .star {
          font-size: 3rem;
          cursor: pointer;
          transition: all 0.3s ease;
          user-select: none;
          position: relative;
        }

        .star.filled {
          color: #ffd23f;
          text-shadow: 0 4px 12px rgba(255, 211, 63, 0.6);
          transform: scale(1.1);
        }

        .star.empty {
          color: rgba(107, 114, 128, 0.3);
        }

        .star:hover {
          transform: scale(1.2);
          filter: drop-shadow(0 6px 12px rgba(255, 211, 63, 0.7));
        }

        .star:active {
          transform: scale(1.05);
        }

        .rating-labels {
          display: flex;
          justify-content: space-between;
          width: 100%;
          max-width: 400px;
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        /* Textarea */
        .textarea-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          flex: 1;
        }

        .feedback-textarea {
          width: 100%;
          padding: 1.5rem;
          border: 2px solid rgba(255, 107, 53, 0.2);
          border-radius: 1.5rem;
          font-size: 1.125rem;
          background: rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;
          outline: none;
          resize: none;
          font-family: inherit;
          flex: 1;
          min-height: 120px;
        }

        .feedback-textarea:focus {
          border-color: #ff6b35;
          box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.1);
          background: white;
        }

        .feedback-textarea::placeholder {
          color: #9ca3af;
        }

        /* Submit Button */
        .submit-btn {
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f, #e91e63);
          background-size: 300% 300%;
          animation: gradientButton 3s ease infinite;
          color: white;
          border: none;
          padding: 1.25rem 2rem;
          border-radius: 1.5rem;
          font-size: 1.25rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        @keyframes gradientButton {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(255, 107, 53, 0.6);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          animation: none;
          background: linear-gradient(45deg, #9ca3af, #6b7280);
        }

        .btn-icon {
          width: 1.5rem;
          height: 1.5rem;
        }

        /* Back Button */
        .back-btn {
          position: absolute;
          top: 2rem;
          left: 2rem;
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid rgba(255, 107, 53, 0.2);
          color: #ff6b35;
          padding: 1rem;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.2);
          z-index: 20;
        }

        .back-btn:hover {
          background: rgba(255, 107, 53, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
        }

        .back-icon {
          width: 1.5rem;
          height: 1.5rem;
        }

        /* Decorative elements */
        .feedback-decoration {
          position: absolute;
          border-radius: 50%;
          opacity: 0.6;
        }

        .feedback-decoration-1 {
          top: -1rem;
          right: -1rem;
          width: 2rem;
          height: 2rem;
          background: linear-gradient(45deg, #ffd23f, #ff6b35);
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
        }

        .feedback-decoration-2 {
          bottom: -0.75rem;
          left: -0.75rem;
          width: 1.5rem;
          height: 1.5rem;
          background: linear-gradient(45deg, #e91e63, #9c27b0);
          box-shadow: 0 4px 15px rgba(233, 30, 99, 0.4);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .feedback-container {
            grid-template-columns: 0.5fr 3fr 0.5fr;
            padding: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .feedback-container {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
            padding: 1rem;
            gap: 1rem;
          }

          .feedback-header {
            grid-column: 1;
          }

          .feedback-content {
            grid-column: 1;
            padding: 2rem;
          }

          .brand-text h1 {
            font-size: 1.75rem;
          }

          .feedback-title {
            font-size: 2rem;
          }

          .star {
            font-size: 2.5rem;
          }

          .star-rating {
            gap: 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .feedback-container {
            padding: 0.5rem;
          }

          .feedback-content {
            padding: 1.5rem;
          }

          .brand-text h1 {
            font-size: 1.5rem;
          }

          .feedback-title {
            font-size: 1.75rem;
          }

          .star {
            font-size: 2rem;
          }

          .rating-labels {
            font-size: 0.75rem;
          }
        }
      `}</style>

      <div className="feedback-container">
        {/* Back Button */}
        {/* <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="back-icon" />
        </button> */}

        {/* Header */}
        <div className="feedback-header">
          {/* <div className="brand-section">
            <div className="brand-logo">
              <Video className="brand-icon" />
            </div>
            <div className="brand-text">
              <h1>Mulakaat</h1>
              <p>मुलाकात</p>
            </div>
          </div> */}

          {/* <div className="feedback-badge">
            <Star className="badge-icon" />
            <span className="badge-text">Share Your Experience</span>
            <Heart className="badge-icon" />
          </div> */}

          <h2 className="feedback-title">
            Your <span className="title-gradient">Feedback</span> Matters
          </h2>
          <p className="feedback-subtitle">Help us improve your video calling experience</p>
        </div>

        {/* Main Content */}
        <div className="feedback-content">
          {/* Decorative elements */}
          <div className="feedback-decoration feedback-decoration-1"></div>
          <div className="feedback-decoration feedback-decoration-2"></div>

          {submitted ? (
            <div className="success-container">
              <div className="success-icon">
                <Heart />
              </div>
              <h3 className="success-title">Thank you for your feedback!</h3>
              <p className="success-message">Your input helps us make Mulakaat better for everyone.</p>
              <p className="redirect-message">Redirecting to dashboard...</p>
            </div>
          ) : (
            <form className="feedback-form" onSubmit={handleSubmit}>
              <div className="star-rating-section">
                <label className="form-label">Rate your experience:</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => handleStarClick(star)}
                      className={`star ${star <= rating ? "filled" : "empty"}`}
                      role="button"
                      aria-label={`${star} Star`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div className="rating-labels">
                  <span>Poor</span>
                  <span>Fair</span>
                  <span>Good</span>
                  <span>Very Good</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div className="textarea-section">
                <label className="form-label">Share your thoughts:</label>
                <textarea
                  name="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="feedback-textarea"
                  placeholder="Tell us about your experience with Mulakaat. What did you like? What could we improve?"
                />
              </div>

              <button type="submit" className="submit-btn" disabled={rating === 0}>
                <Send className="btn-icon" />
                Submit Feedback
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}

export default withAuth(Feedback);
