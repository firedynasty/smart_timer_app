import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, Download, Trash2 } from 'lucide-react';

const SmartCountdownTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessions, setSessions] = useState(() => {
    // Load sessions from localStorage on component initialization
    try {
      const savedSessions = localStorage.getItem('smart-timer-sessions');
      return savedSessions ? JSON.parse(savedSessions) : [];
    } catch (error) {
      console.error('Error loading sessions from localStorage:', error);
      return [];
    }
  });
  const [currentSessionStart, setCurrentSessionStart] = useState(null);
  const intervalRef = useRef(null);
  const tableRef = useRef(null);

  // Format time as HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date as MM/DD/YYYY HH:MM:SS
  const formatDateTime = (date) => {
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Calculate duration between two dates
  const calculateDuration = (start, end) => {
    return Math.floor((end - start) / 1000);
  };

  const startTimer = useCallback(() => {
    const now = new Date();
    setCurrentSessionStart(now);
    setIsRunning(true);
    setElapsedTime(0);
  }, []);

  const stopTimer = useCallback(() => {
    if (currentSessionStart) {
      const now = new Date();
      const duration = calculateDuration(currentSessionStart, now);
      
      const newSession = {
        id: Date.now(),
        start: formatDateTime(currentSessionStart),
        stop: formatDateTime(now),
        duration: formatTime(duration),
        comments: ''
      };

      setSessions(prev => [...prev, newSession]);
      setCurrentSessionStart(null);
    }
    setIsRunning(false);
    setElapsedTime(0);
    
    // Scroll to sessions table
    setTimeout(() => {
      const sessionsElement = document.getElementById('sessions-table');
      if (sessionsElement) {
        sessionsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, [currentSessionStart, calculateDuration, formatDateTime, formatTime, setSessions]);

  // Save sessions to localStorage whenever sessions state changes
  useEffect(() => {
    try {
      localStorage.setItem('smart-timer-sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving sessions to localStorage:', error);
    }
  }, [sessions]);

  // Timer effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if escape key is pressed
      if (event.key === 'Escape') {
        event.preventDefault();
        if (isRunning) {
          stopTimer();
        } else {
          startTimer();
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRunning, startTimer, stopTimer]); // Include functions in dependency array

  const updateSession = (id, field, value) => {
    setSessions(prev => prev.map(session => 
      session.id === id ? { ...session, [field]: value } : session
    ));
  };

  const deleteSession = (id) => {
    setSessions(prev => prev.filter(session => session.id !== id));
  };

  const clearAllSessions = () => {
    setSessions([]);
  };

  const copyTableToClipboard = async () => {
    if (sessions.length === 0) {
      alert('No sessions to copy.');
      return;
    }

    // Create tab-separated values for Google Sheets
    const headers = ['Start', 'Stop', 'Duration', 'Comments'];
    const rows = sessions.map(session => [
      session.start,
      session.stop,
      session.duration,
      session.comments || ''
    ]);
    
    const tsvContent = [headers, ...rows]
      .map(row => row.join('\t'))
      .join('\n');

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(tsvContent);
        alert('Table copied to clipboard! You can now paste it into Google Sheets.');
      } else {
        // Fallback to older method
        const textArea = document.createElement('textarea');
        textArea.value = tsvContent;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          alert('Table copied to clipboard! You can now paste it into Google Sheets.');
        } else {
          throw new Error('Copy command failed');
        }
      }
    } catch (err) {
      console.error('Failed to copy table: ', err);
      alert('Failed to copy table. Please select the table manually and copy with Ctrl+C (or Cmd+C on Mac).');
    }
  };

  const exportToCSV = () => {
    const headers = ['Start', 'Stop', 'Duration', 'Comments'];
    const csvContent = [
      headers.join(','),
      ...sessions.map(session => [
        `"${session.start}"`,
        `"${session.stop}"`,
        `"${session.duration}"`,
        `"${session.comments}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timer-sessions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Smart Timer</h1>
          <p className="text-gray-600">Track your work sessions with precision</p>
        </div>

        {/* Timer Display */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center">
            <div className="text-6xl font-mono font-bold text-gray-800 mb-6">
              {formatTime(elapsedTime)}
            </div>
            
            <div className="flex justify-center gap-4">
              {!isRunning ? (
                <button
                  onClick={startTimer}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 transition-colors shadow-lg"
                >
                  <Play size={24} />
                  Start
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsRunning(false)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 transition-colors shadow-lg"
                  >
                    <Pause size={24} />
                    Pause
                  </button>
                  <button
                    onClick={stopTimer}
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 transition-colors shadow-lg"
                  >
                    <Square size={24} />
                    Stop
                  </button>
                </>
              )}
            </div>

            {isRunning && (
              <div className="mt-4 text-green-600 font-semibold">
                Timer is running...
              </div>
            )}
            
            <div className="mt-4 text-gray-500 text-sm">
              Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Escape</kbd> to {isRunning ? 'stop' : 'start'} timer
            </div>
          </div>
        </div>

        {/* Sessions Table */}
        <div id="sessions-table" className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Sessions</h2>
            
            <div className="flex gap-3">
              <button
                onClick={copyTableToClipboard}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                disabled={sessions.length === 0}
              >
                <Download size={18} />
                Copy for Sheets
              </button>
              
              <button
                onClick={exportToCSV}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                disabled={sessions.length === 0}
              >
                <Download size={18} />
                Export CSV
              </button>
              
              <button
                onClick={clearAllSessions}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                disabled={sessions.length === 0}
              >
                <Trash2 size={18} />
                Clear All
              </button>
            </div>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No sessions recorded</p>
              <p className="text-sm mt-2">Start a timer to begin tracking your work sessions</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table ref={tableRef} className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Start</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Stop</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Duration</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Comments</th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-mono text-sm">{session.start}</td>
                      <td className="border border-gray-300 px-4 py-3 font-mono text-sm">{session.stop}</td>
                      <td className="border border-gray-300 px-4 py-3 font-mono text-lg font-semibold text-blue-600">{session.duration}</td>
                      <td className="border border-gray-300 px-4 py-3">
                        <input
                          type="text"
                          value={session.comments}
                          onChange={(e) => updateSession(session.id, 'comments', e.target.value)}
                          placeholder="Add comments..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        <button
                          onClick={() => deleteSession(session.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete session"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Note about data persistence */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            <strong>Data Persistence:</strong> Your session data is automatically saved to your browser's local storage. 
            Sessions will persist when you refresh or close the browser.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SmartCountdownTimer;