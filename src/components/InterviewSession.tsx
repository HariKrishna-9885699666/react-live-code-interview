import React, { useState, useEffect, useRef } from 'react';
import { PeerManager } from '../utils/PeerManager';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Copy, Check, Users, Play, RotateCcw, 
  Save, Moon, Sun, User, AlertTriangle, Loader2 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import CodeEditor from './CodeEditor';
import ExecutionPanel from './ExecutionPanel';

interface User {
  id: string;
  name: string;
  color: string;
  isTyping: boolean;
  cursor?: { line: number; column: number };
}

const InterviewSession: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const [code, setCode] = useState(`// Welcome to your coding interview!
// Write your JavaScript solution below

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci sequence:");
for (let i = 0; i <= 10; i++) {
  console.log('fibonacci(' + i + ') = ' + fibonacci(i));
}`);

  // PeerManager for P2P code sync
  const peerManagerRef = useRef<PeerManager | null>(null);
  // Removed unused isPeerReady state
  
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser] = useState<User>({
    id: 'user-' + Math.random().toString(36).substr(2, 9),
    name: 'Anonymous',
    color: '#3b82f6',
    isTyping: false
  });
  
  const [executionOutput, setExecutionOutput] = useState<Array<{ type: 'log' | 'error' | 'warn' | 'info'; content: string; timestamp: number }>>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [savedSnapshots, setSavedSnapshots] = useState<Array<{ id: string; code: string; timestamp: number; name: string }>>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const executionTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // PeerJS setup
  useEffect(() => {
    if (!sessionId) return;
    // Only initialize once
    if (peerManagerRef.current) return;

    // When a user joins, use sessionId as peerId
    const onCodeReceived = (incomingCode: string) => {
      setCode(incomingCode);
    };
    const pm = new PeerManager(sessionId, onCodeReceived);
    peerManagerRef.current = pm;

    pm.peer.on('open', () => {
      setIsConnected(true);
      setUsers([
        {
          id: 'interviewer-1',
          name: 'Interviewer',
          color: '#059669',
          isTyping: false
        },
        currentUser
      ]);
    });

    // If joining as guest, connect to host
    // Host: first user in session, uses sessionId as peerId
    // Guest: if window.location.hash includes ?join=hostId, connect to host
    const params = new URLSearchParams(window.location.search);
    const hostId = params.get('join');
    if (hostId && hostId !== sessionId) {
      pm.connectToHost(hostId);
    }

    return () => {
      pm.peer.destroy();
    };
  }, [sessionId, currentUser]);

  // Broadcast code changes to peers
  useEffect(() => {
    if (!peerManagerRef.current) return;
    peerManagerRef.current.broadcastCode(code);
  }, [code]);

  const copySessionLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const executeCode = async () => {
    setIsExecuting(true);
    setExecutionOutput([]);

    try {
      // Clear any existing timeout
      if (executionTimeoutRef.current) {
        clearTimeout(executionTimeoutRef.current);
      }

      // Create execution timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        executionTimeoutRef.current = setTimeout(() => {
          reject(new Error('Code execution timed out (5 seconds limit)'));
        }, 5000);
      });

      // Create execution promise
      const executionPromise = new Promise<void>((resolve, reject) => {
        try {
          const logs: Array<{ type: 'log' | 'error' | 'warn' | 'info'; content: string; timestamp: number }> = [];
          
          // Override console methods to capture output
          const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
          };

          const captureConsole = (type: 'log' | 'error' | 'warn' | 'info') => (...args: any[]) => {
            const content = args.map(arg => {
              if (typeof arg === 'object') {
                try {
                  return JSON.stringify(arg, null, 2);
                } catch {
                  return String(arg);
                }
              }
              return String(arg);
            }).join(' ');
            
            logs.push({
              type,
              content,
              timestamp: Date.now()
            });
          };

          console.log = captureConsole('log');
          console.error = captureConsole('error');
          console.warn = captureConsole('warn');
          console.info = captureConsole('info');

          // Execute code in try-catch
          try {
            // Basic security: prevent some dangerous operations
            const sanitizedCode = code
              .replace(/document\./g, '/* document disabled */')
              .replace(/window\./g, '/* window disabled */')
              .replace(/eval\(/g, '/* eval disabled */(')
              .replace(/Function\(/g, '/* Function disabled */(');

            // Execute the code
            eval(sanitizedCode);
            
            setExecutionOutput([...logs]);
          } catch (error) {
            logs.push({
              type: 'error',
              content: `Runtime Error: ${error instanceof Error ? error.message : String(error)}`,
              timestamp: Date.now()
            });
            setExecutionOutput([...logs]);
          } finally {
            // Restore console
            console.log = originalConsole.log;
            console.error = originalConsole.error;
            console.warn = originalConsole.warn;
            console.info = originalConsole.info;
          }

          resolve();
        } catch (error) {
          reject(error);
        }
      });

      // Race between execution and timeout
      await Promise.race([executionPromise, timeoutPromise]);
      
    } catch (error) {
      setExecutionOutput(prev => [...prev, {
        type: 'error',
        content: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      }]);
    } finally {
      setIsExecuting(false);
      if (executionTimeoutRef.current) {
        clearTimeout(executionTimeoutRef.current);
      }
    }
  };

  const resetCode = () => {
    const confirmReset = window.confirm('Are you sure you want to reset the code? This action cannot be undone.');
    if (confirmReset) {
      setCode(`// Welcome to your coding interview!
// Write your JavaScript solution below

function solution() {
  // Your code here
  return "Hello, World!";
}

console.log(solution());`);
      setExecutionOutput([]);
    }
  };

  const saveSnapshot = () => {
    const name = prompt('Enter a name for this code snapshot:') || `Snapshot ${savedSnapshots.length + 1}`;
    const snapshot = {
      id: Date.now().toString(),
      code,
      timestamp: Date.now(),
      name
    };
    setSavedSnapshots(prev => [snapshot, ...prev]);
  };

  const loadSnapshot = (snapshot: typeof savedSnapshots[0]) => {
    const confirmLoad = window.confirm(`Load snapshot "${snapshot.name}"? Current code will be replaced.`);
    if (confirmLoad) {
      setCode(snapshot.code);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Interview Session
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Session ID: {sessionId?.slice(-8)}...
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Connection Status */}
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-gray-600 dark:text-gray-300">
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>

            {/* Active Users */}
            <div className="flex items-center space-x-1">
              {users.map(user => (
                <div
                  key={user.id}
                  className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs"
                  style={{ borderLeft: `3px solid ${user.color}` }}
                >
                  <User className="w-3 h-3" />
                  <span className="text-gray-700 dark:text-gray-300">{user.name}</span>
                  {user.isTyping && (
                    <div className="flex space-x-0.5">
                      <div className="w-1 h-1 bg-blue-500 rounded-full pulse-dot"></div>
                      <div className="w-1 h-1 bg-blue-500 rounded-full pulse-dot"></div>
                      <div className="w-1 h-1 bg-blue-500 rounded-full pulse-dot"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={copySessionLink}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg transition-colors"
              >
                {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copySuccess ? 'Copied!' : 'Share Link'}</span>
              </button>

              <button
                onClick={saveSnapshot}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Save Code Snapshot"
              >
                <Save className="w-5 h-5" />
              </button>

              <button
                onClick={resetCode}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Reset Code"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">Code Editor</h2>
            <button
              onClick={executeCode}
              disabled={isExecuting}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isExecuting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{isExecuting ? 'Running...' : 'Run Code'}</span>
            </button>
          </div>
          <CodeEditor 
            code={code} 
            onChange={setCode}
            theme={theme}
            users={users}
            currentUser={currentUser}
          />
        </div>

        {/* Resizer */}
        <div className="w-1 resizer flex-shrink-0" />

        {/* Output Panel */}
        <ExecutionPanel 
          output={executionOutput}
          isExecuting={isExecuting}
          savedSnapshots={savedSnapshots}
          onLoadSnapshot={loadSnapshot}
          onDeleteSnapshot={(id) => setSavedSnapshots(prev => prev.filter(s => s.id !== id))}
        />
      </div>
    </div>
  );
};

export default InterviewSession;