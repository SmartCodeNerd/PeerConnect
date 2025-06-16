import { useState } from 'react'
import './App.css'
import Landing from './pages/landing.jsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Authentication from './pages/authentication.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
        <Routes>
           <Route path="/" element={<Landing/>} />
           <Route path="/auth" element={<Authentication/>} />
        </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App;
