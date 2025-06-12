import { useState } from 'react'
import './App.css'
import Landing from './pages/landing.jsx'

function App() {
  return (
    <>
      <Landing />
      <Router>
        <Routes>
           <Route path="/" element={<Landing/>} />
        </Routes>
      </Router>
    </>
  )
}

export default App;
