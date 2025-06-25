import './App.css';
import { Route, BrowserRouter as Router, Routes ,Link,} from 'react-router-dom';
import WelcomePage from './pages/welcome.jsx';
import Authentication from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeetComponent from './pages/VideoMeet';
import Dashboard from './pages/dashboard.jsx';
import Feedback from './pages/feedback.jsx';


function App() {
  return (
    <div className="App">

      <Router>

        <AuthProvider>
          <Routes>
            <Route path='/' element={<WelcomePage />} />
            <Route path='/auth' element={<Authentication />} />
            <Route path='/:url' element={<VideoMeetComponent/>} />
            <Route path='/dashboard' element={<Dashboard/>} />
            <Route path='/afterCall' element={<Feedback/>} />
          </Routes>
        </AuthProvider>

      </Router>
    </div>
  );
}

export default App;
