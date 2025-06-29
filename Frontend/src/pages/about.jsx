import React, { useState } from 'react';
import { Video, Github, Linkedin, ExternalLink, Heart, Star, Code, Users, Zap, Shield, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopyRepo = async () => {
    try {
      await navigator.clipboard.writeText('https://github.com/SmartCodeNerd/Mulakaat.git');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = 'https://github.com/gulshankumargupta/mulakaat';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const features = [
    {
      icon: <Video className="w-6 h-6" />,
      title: "High Quality Video Calls",
      description: "Crystal clear video and audio for seamless communication"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Multi-participant Support",
      description: "Connect with multiple people in a single meeting room"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Meetings",
      description: "Start meetings instantly or schedule them for later"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Your conversations are protected with end-to-end security"
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Cross Platform",
      description: "Works seamlessly across all devices and browsers"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "User Friendly",
      description: "Intuitive interface designed with Indian warmth and simplicity"
    }
  ];

  const techStack = [
    "React.js", "WebRTC", "Socket.io", "Node.js", "Express.js", "MongoDB"
  ];

  return (
    <>
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .about-container {
          min-height: 100vh;
          background: linear-gradient(to bottom right, #f2e6d8, #f4d9dc, #f3e6c6);
          position: relative;
          overflow: hidden;
        }

        /* Background decorative elements */
        .about-container::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          animation: float 6s ease-in-out infinite;
        }

        .about-container::after {
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

        .back-btn {
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

        .back-btn:hover {
          background: rgba(255, 107, 53, 0.2);
          transform: translateY(-2px);
        }

        /* Main Content */
        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 4rem 2rem;
          position: relative;
          z-index: 10;
        }

        /* Hero Section */
        .hero-section {
          text-align: center;
          margin-bottom: 6rem;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          border: 2px solid rgba(255, 107, 53, 0.2);
          margin-bottom: 2rem;
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

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          color: #374151;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .title-gradient {
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.5rem;
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .hero-description {
          font-size: 1.125rem;
          color: #9ca3af;
          max-width: 600px;
          margin: 0 auto;
        }

        /* About Content */
        .about-content {
          display: grid;
          gap: 6rem;
        }

        /* Creator Section */
        .creator-section {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 2rem;
          padding: 3rem;
          border: 2px solid rgba(255, 107, 53, 0.1);
          box-shadow: 0 20px 40px rgba(255, 107, 53, 0.1);
          text-align: center;
        }

        .creator-avatar {
          width: 8rem;
          height: 8rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
          overflow: hidden;
          border: 4px solid rgba(255, 107, 53, 0.2);
        }

        .creator-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .creator-name {
          font-size: 2rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .creator-title {
          font-size: 1.125rem;
          color: #ff6b35;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .creator-description {
          font-size: 1rem;
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .social-links {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .social-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 1rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          border: 2px solid;
        }

        .github-link {
          background: #24292e;
          color: white;
          border-color: #24292e;
        }

        .github-link:hover {
          background: #1a1e22;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(36, 41, 46, 0.3);
        }

        .linkedin-link {
          background: #0077b5;
          color: white;
          border-color: #0077b5;
        }

        .linkedin-link:hover {
          background: #005885;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 119, 181, 0.3);
        }

        /* Features Section */
        .features-section {
          text-align: center;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 1rem;
        }

        .section-subtitle {
          font-size: 1.125rem;
          color: #6b7280;
          margin-bottom: 3rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 1.5rem;
          padding: 2rem;
          border: 2px solid rgba(255, 107, 53, 0.1);
          box-shadow: 0 10px 30px rgba(255, 107, 53, 0.1);
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(255, 107, 53, 0.2);
        }

        .feature-icon {
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: white;
        }

        .feature-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
        }

        .feature-description {
          color: #6b7280;
          line-height: 1.6;
        }

        /* Tech Stack Section */
        .tech-section {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 2rem;
          padding: 3rem;
          border: 2px solid rgba(255, 107, 53, 0.1);
          box-shadow: 0 20px 40px rgba(255, 107, 53, 0.1);
          text-align: center;
        }

        .tech-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem;
          margin-top: 2rem;
        }

        .tech-tag {
          background: linear-gradient(45deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1));
          color: #ff6b35;
          padding: 0.75rem 1.5rem;
          border-radius: 2rem;
          font-weight: 600;
          border: 2px solid rgba(255, 107, 53, 0.2);
          transition: all 0.3s ease;
        }

        .tech-tag:hover {
          background: linear-gradient(45deg, rgba(255, 107, 53, 0.2), rgba(247, 147, 30, 0.1));
          transform: translateY(-2px);
        }

        /* Repository Section */
        .repo-section {
          text-align: center;
          background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.05));
          border-radius: 2rem;
          padding: 3rem;
          border: 2px solid rgba(255, 107, 53, 0.2);
          box-shadow: 0 20px 40px rgba(255, 107, 53, 0.1);
        }

        .repo-link {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f);
          color: white;
          padding: 1rem 2rem;
          border-radius: 1rem;
          font-size: 1.125rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
          margin-top: 1.5rem;
        }

        .repo-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(255, 107, 53, 0.6);
        }

        .repo-link.copied {
          background: linear-gradient(45deg, #10b981, #059669);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .creator-section,
          .tech-section,
          .repo-section {
            padding: 2rem;
          }

          .social-links {
            flex-direction: column;
            align-items: center;
          }

          .tech-grid {
            gap: 0.5rem;
          }

          .main-content {
            padding: 2rem 1rem;
          }
        }
      `}</style>

      <div className="about-container">
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
            <button className="back-btn" onClick={() => navigate('/')}>
              ← Back to Dashboard
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-badge">
              <Star className="badge-icon" />
              <span className="badge-text">About Mulakaat</span>
              <Heart className="badge-icon" />
            </div>
            <h1 className="hero-title">
              Connecting <span className="title-gradient">Hearts</span> Through Technology
            </h1>
            <p className="hero-subtitle">मुलाकात - Where Every Meeting Matters</p>
            <p className="hero-description">
              A modern video calling solution built with love and care, designed to bring people together 
              with the warmth and joy of Indian hospitality.
            </p>
          </section>

          <div className="about-content">
            {/* Creator Section */}
            <section className="creator-section">
              <div className="creator-avatar">
                <img src="/profile.jpeg" alt="Gulshan Kumar Gupta" />
              </div>
              <h2 className="creator-name">Gulshan Kumar Gupta</h2>
              <p className="creator-title">Full Stack Developer & Creator</p>
              <p className="creator-description">
                Passionate developer dedicated to creating meaningful digital experiences that connect people. 
                With expertise in modern web technologies, I strive to build applications that not only work 
                seamlessly but also bring joy to users' daily interactions.
              </p>
              <div className="social-links">
                <a 
                  href="https://www.overleaf.com/project/682d9d9944ed32a1e7024cde" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link github-link"
                >
                  <Github className="w-5 h-5" />
                  GitHub
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/gulshan-gupta-a51289243" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link linkedin-link"
                >
                  <Linkedin className="w-5 h-5" />
                  LinkedIn
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
              <h2 className="section-title">Why Choose Mulakaat?</h2>
              <p className="section-subtitle">
                Built with modern technology and Indian values of connection and care
              </p>
              <div className="features-grid">
                {features.map((feature, index) => (
                  <div key={index} className="feature-card">
                    <div className="feature-icon">
                      {feature.icon}
                    </div>
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tech Stack Section */}
            <section className="tech-section">
              <h2 className="section-title">Built With Modern Technology</h2>
              <p className="section-subtitle">
                Leveraging the best tools and frameworks for optimal performance
              </p>
              <div className="tech-grid">
                {techStack.map((tech, index) => (
                  <span key={index} className="tech-tag">{tech}</span>
                ))}
              </div>
            </section>

            {/* Repository Section */}
            <section className="repo-section">
              <h2 className="section-title">Open Source & Free</h2>
              <p className="section-subtitle">
                Clone, modify, and make it your own. Mulakaat is open for everyone to use and contribute.
              </p>
              <button 
                onClick={handleCopyRepo}
                className={`repo-link ${copied ? 'copied' : ''}`}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Repository Link Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Repository Link
                    <Github className="w-4 h-4" />
                  </>
                )}
              </button>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}