import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import InterviewSession from './components/InterviewSession';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/session/:sessionId" element={<InterviewSession />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;