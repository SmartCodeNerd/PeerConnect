import "../App.css";

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
    </div>
  );
};

export default Landing;