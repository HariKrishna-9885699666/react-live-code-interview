import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Code2, Users, Play, Shield, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Home: React.FC = () => {
  const [sessionId, setSessionId] = useState('');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const createSession = () => {
    const newSessionId = uuidv4();
    navigate(`/session/${newSessionId}`);
  };

  const joinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionId.trim()) {
      navigate(`/session/${sessionId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              CodeInterview Pro
            </h1>
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Real-time Collaborative
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Coding Interviews
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Conduct seamless technical interviews with our advanced code editor, 
            real-time collaboration, and secure code execution environment.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Create Session
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Start a new interview session and share the link with your candidate. 
              Perfect for conducting technical interviews with real-time collaboration.
            </p>
            <button
              onClick={createSession}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create New Session
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4">
                <Code2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Join Session
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Enter a session ID to join an existing interview. 
              Collaborate in real-time with advanced code editing features.
            </p>
            <form onSubmit={joinSession} className="space-y-4">
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter session ID..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              />
              <button
                type="submit"
                disabled={!sessionId.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-lg"
              >
                Join Session
              </button>
            </form>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="inline-flex p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <Play className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Code Execution
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              Run JavaScript code safely with our sandboxed execution environment 
              and real-time output display.
            </p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="inline-flex p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <Code2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Advanced Editor
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              Monaco Editor with syntax highlighting, IntelliSense, 
              auto-formatting, and professional coding features.
            </p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="inline-flex p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
              <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Secure & Safe
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              Protected code execution with timeout controls, 
              infinite loop prevention, and secure sandboxing.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;