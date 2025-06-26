"use client"

import { Video, User, Lock, Mail, Eye, EyeOff, Star, Heart } from "lucide-react"
import { useState,useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom";


const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState('');
  const [message,setMessage] = useState('');
  const [open,setOpen] = useState(false);

  const handleCloseSnackbar = () => {
    setOpen(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }


  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: "", username: "", password: "" });
    setError("");
    setOpen(false);
  };

  const { handleRegister, handleLogin } = useContext(AuthContext);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(""); // Clear previous errors
  try {
    if (isLogin) {
      await handleLogin(formData.username, formData.password);
      navigate("/dashboard");
    } else {
      const result = await handleRegister(formData.name, formData.username, formData.password);
      setMessage(result);
      setOpen(true);
      setFormData({ name: "", username: "", password: "" });
      setIsLogin(true);
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || "An error occurred";
    setError(errorMessage);
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

        .auth-container {
          min-height: 100vh;
          background: linear-gradient(to bottom right, #ff9a56, #ffad56, #ffc056);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        /* Background decorative elements */
        .auth-container::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          animation: float 6s ease-in-out infinite;
        }

        .auth-container::after {
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

        /* Auth Card */
        .auth-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 2rem;
          padding: 3rem;
          box-shadow: 0 20px 40px rgba(255, 107, 53, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          width: 100%;
          max-width: 450px;
          position: relative;
          z-index: 10;
        }

        /* Header */
        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .brand-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .brand-logo {
          width: 3.5rem;
          height: 3.5rem;
          background: linear-gradient(135deg, #ff6b35, #f7931e, #ffd23f);
          border-radius: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
        }

        .brand-icon {
          width: 2rem;
          height: 2rem;
          color: white;
        }

        .brand-text h1 {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .brand-text p {
          font-size: 0.875rem;
          color: rgba(255, 107, 53, 0.8);
          font-weight: 500;
          margin: -0.25rem 0 0 0;
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

        .auth-title {
          font-size: 2rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .auth-subtitle {
          color: #6b7280;
          font-size: 1rem;
          font-weight: 500;
        }

        /* Toggle Buttons */
        .auth-toggle {
          display: flex;
          background: rgba(255, 107, 53, 0.1);
          border-radius: 1rem;
          padding: 0.25rem;
          margin-bottom: 2rem;
          border: 2px solid rgba(255, 107, 53, 0.2);
        }

        .toggle-btn {
          flex: 1;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          background: transparent;
          color: #6b7280;
        }

        .toggle-btn.active {
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f);
          color: white;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
        }

        /* Form */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          position: relative;
        }

        .form-label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .input-wrapper {
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid rgba(255, 107, 53, 0.2);
          border-radius: 1rem;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;
          outline: none;
        }

        .form-input:focus {
          border-color: #ff6b35;
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
          background: white;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1.25rem;
          height: 1.25rem;
          color: #6b7280;
          z-index: 1;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: color 0.3s ease;
        }

        .password-toggle:hover {
          color: #ff6b35;
        }

        .password-toggle-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        /* Submit Button */
        .submit-btn {
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
          margin-top: 1rem;
        }

        @keyframes gradientButton {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(255, 107, 53, 0.6);
        }

        .submit-btn:active {
          transform: translateY(0);
        }

        /* Footer */
        .auth-footer {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 107, 53, 0.2);
        }

        .footer-text {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .footer-link {
          color: #ff6b35;
          text-decoration: none;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .footer-link:hover {
          color: #f7931e;
        }

        /* Decorative elements */
        .auth-decoration {
          position: absolute;
          border-radius: 50%;
          opacity: 0.6;
        }

        .auth-decoration-1 {
          top: -1rem;
          right: -1rem;
          width: 2rem;
          height: 2rem;
          background: linear-gradient(45deg, #ffd23f, #ff6b35);
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
        }

        .auth-decoration-2 {
          bottom: -0.75rem;
          left: -0.75rem;
          width: 1.5rem;
          height: 1.5rem;
          background: linear-gradient(45deg, #e91e63, #9c27b0);
          box-shadow: 0 4px 15px rgba(233, 30, 99, 0.4);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .auth-container {
            padding: 1rem;
          }

          .auth-card {
            padding: 2rem;
            max-width: 100%;
          }

          .brand-text h1 {
            font-size: 2rem;
          }

          .auth-title {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 1.5rem;
          }

          .brand-section {
            flex-direction: column;
            gap: 0.5rem;
          }

          .brand-logo {
            width: 3rem;
            height: 3rem;
          }

          .brand-text h1 {
            font-size: 1.75rem;
          }
        }
      `}</style>

      <div className="auth-container">
        <div className="auth-card">
          {/* Decorative elements */}
          <div className="auth-decoration auth-decoration-1"></div>
          <div className="auth-decoration auth-decoration-2"></div>

          {/* Header */}
          <div className="auth-header">
            <div className="brand-section">
              <div className="brand-logo">
                <Video className="brand-icon" />
              </div>
              <div className="brand-text">
                <h1>Mulakaat</h1>
                <p>मुलाकात</p>
              </div>
            </div>

            <div className="welcome-badge">
              <Star className="badge-icon" />
              <span className="badge-text">Welcome to Mulakaat</span>
              <Heart className="badge-icon" />
            </div>

            <h2 className="auth-title">{isLogin ? "Welcome Back!" : "Join Mulakaat"}</h2>
            <p className="auth-subtitle">
              {isLogin ? "Sign in to continue your journey" : "Create your account to get started"}
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="auth-toggle">
            <button className={`toggle-btn ${isLogin ? "active" : ""}`} onClick={() => setIsLogin(true)}>
              Sign In
            </button>
            <button className={`toggle-btn ${!isLogin ? "active" : ""}`} onClick={() => setIsLogin(false)}>
              Register
            </button>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Full Name
                </label>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-input"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff className="password-toggle-icon" />
                  ) : (
                    <Eye className="password-toggle-icon" />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn">
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
          <p className="footer-text">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span className="footer-link" onClick={toggleAuthMode}>
              {isLogin ? "Register here" : "Sign in here"}
            </span>
          </p>
        </div>
        </div>

        {open && (
          <div className="snackbar" onClick={handleCloseSnackbar}>
            {message}
          </div>
        )}
      </div>
    </>
  )
}

export default Auth;
