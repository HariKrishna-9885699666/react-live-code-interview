import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Clock, Trash2, FileText, Download, AlertTriangle, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface OutputEntry {
  type: 'log' | 'error' | 'warn' | 'info';
  content: string;
  timestamp: number;
}

interface Snapshot {
  id: string;
  code: string;
  timestamp: number;
  name: string;
}

interface ExecutionPanelProps {
  output: OutputEntry[];
  isExecuting: boolean;
  savedSnapshots: Snapshot[];
  onLoadSnapshot: (snapshot: Snapshot) => void;
  onDeleteSnapshot: (id: string) => void;
}

const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  output,
  isExecuting,
  savedSnapshots,
  onLoadSnapshot,
  onDeleteSnapshot
}) => {
  const [activeTab, setActiveTab] = useState<'output' | 'snapshots'>('output');
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getOutputIcon = (type: OutputEntry['type']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />;
      case 'warn':
        return <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />;
    }
  };

  const downloadSnapshot = (snapshot: Snapshot) => {
    const blob = new Blob([snapshot.code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${snapshot.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearOutput = () => {
    // This would typically clear the output, but since it's controlled by parent
    // we'll just show a message or handle it differently
    console.log('Clear output requested');
  };

  return (
    <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Tab Headers */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('output')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'output'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Terminal className="w-4 h-4" />
              <span>Output</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('snapshots')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'snapshots'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Snapshots ({savedSnapshots.length})</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'output' && (
          <div className="h-full flex flex-col">
            {/* Output Header */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Console Output
                </span>
              </div>
              <button
                onClick={clearOutput}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                title="Clear Output"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Output Content */}
            <div 
              ref={outputRef}
              className="flex-1 overflow-y-auto p-4 space-y-2 execution-output bg-gray-900 text-gray-100 font-mono text-sm"
            >
              {isExecuting && (
                <div className="flex items-center space-x-2 text-blue-400">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full pulse-dot"></div>
                    <div className="w-1 h-1 bg-blue-400 rounded-full pulse-dot"></div>
                    <div className="w-1 h-1 bg-blue-400 rounded-full pulse-dot"></div>
                  </div>
                  <span>Executing code...</span>
                </div>
              )}

              {output.length === 0 && !isExecuting && (
                <div className="text-gray-500 italic text-center py-8">
                  <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No output yet. Run your code to see results here.</p>
                </div>
              )}

              {output.map((entry, index) => (
                <div key={index} className="flex items-start space-x-2 group">
                  <span className="text-xs text-gray-500 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                  {getOutputIcon(entry.type)}
                  <div className="flex-1 min-w-0">
                    <pre className="whitespace-pre-wrap break-words text-sm">
                      {entry.content}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'snapshots' && (
          <div className="h-full flex flex-col">
            {/* Snapshots Header */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Saved Snapshots
                </span>
              </div>
            </div>

            {/* Snapshots Content */}
            <div className="flex-1 overflow-y-auto">
              {savedSnapshots.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <FileText className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No snapshots saved yet.</p>
                  <p className="text-xs mt-1">Save code snapshots for later review.</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {savedSnapshots.map((snapshot) => (
                    <div
                      key={snapshot.id}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {snapshot.name}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(snapshot.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 truncate">
                            {snapshot.code.split('\n')[0] || 'Empty code'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-3">
                        <button
                          onClick={() => onLoadSnapshot(snapshot)}
                          className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => downloadSnapshot(snapshot)}
                          className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 text-xs font-medium rounded transition-colors"
                          title="Download as file"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this snapshot?')) {
                              onDeleteSnapshot(snapshot.id);
                            }
                          }}
                          className="px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-medium rounded transition-colors"
                          title="Delete snapshot"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionPanel;