// PDF Auto-Scroll Implementation
import React, { useState, useEffect, useRef, useCallback } from 'react';

const PDFAutoScroll = ({ pdfViewerRef }) => {
  // State variables for auto-scroll feature
  const [autoScrollActive, setAutoScrollActive] = useState(false);
  const [scrollIntervalSeconds, setScrollIntervalSeconds] = useState(13);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // References for tracking scroll timing and audio
  const lastScrollTimeRef = useRef(Date.now());
  const audioContextRef = useRef(null);
  const currentPageRef = useRef(1);
  
  // Function to perform the scroll action in PDF context
  const performScroll = useCallback(() => {
    if (!pdfViewerRef.current) return;
    
    // Get current page and total pages
    const viewer = pdfViewerRef.current;
    const currentPage = viewer.currentPageNumber || 1;
    const totalPages = viewer.pagesCount || 1;
    
    // Calculate scroll amount based on page height
    const container = viewer.container || document.querySelector('.pdf-container');
    if (!container) return;
    
    // Either move to next page or scroll down current page
    const viewportHeight = container.clientHeight;
    const scrollAmount = viewportHeight * 0.5; // Scroll 50% of viewport height
    
    // Check if we're at the bottom of the current page
    const isAtBottomOfPage = container.scrollTop + viewportHeight >= container.scrollHeight - 20;
    
    if (isAtBottomOfPage && currentPage < totalPages) {
      // Move to next page
      viewer.currentPageNumber = currentPage + 1;
      currentPageRef.current = currentPage + 1;
      // Reset scroll position to top of new page
      container.scrollTop = 0;
    } else {
      // Continue scrolling down current page
      container.scrollTop += scrollAmount;
    }
    
    // Update last scroll time
    lastScrollTimeRef.current = Date.now();
    
    // Play sound if enabled
    if (soundEnabled) {
      playSubtleBeep();
    }
  }, [pdfViewerRef, soundEnabled]);
  
  // Function to play a subtle audio beep
  const playSubtleBeep = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      // Create audio context on first use
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const context = audioContextRef.current;
      
      // Create oscillator for sound generation
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      // Configure sound properties (gentle, quiet beep)
      oscillator.type = 'sine';
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.05;
      
      // Connect audio nodes
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      // Play very short beep
      gainNode.gain.setValueAtTime(0.05, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.15);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.15);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, [soundEnabled]);
  
  // Set up interval for auto-scrolling
  useEffect(() => {
    let intervalId;
    
    if (autoScrollActive) {
      intervalId = setInterval(() => {
        // Get current time
        const now = Date.now();
        // Only scroll if enough time has passed
        if (now - lastScrollTimeRef.current >= scrollIntervalSeconds * 1000) {
          performScroll();
        }
      }, 1000); // Check every second
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoScrollActive, performScroll, scrollIntervalSeconds]);
  
  // Reset auto-scroll timer when page changes
  useEffect(() => {
    if (pdfViewerRef.current) {
      const handlePageChange = () => {
        const newPage = pdfViewerRef.current.currentPageNumber;
        if (newPage !== currentPageRef.current) {
          currentPageRef.current = newPage;
          lastScrollTimeRef.current = Date.now();
        }
      };
      
      // Listen for page change events
      pdfViewerRef.current.addEventListener('pagechange', handlePageChange);
      
      return () => {
        if (pdfViewerRef.current) {
          pdfViewerRef.current.removeEventListener('pagechange', handlePageChange);
        }
      };
    }
  }, [pdfViewerRef]);
  
  // Function to increase scroll speed
  const increaseSpeed = () => {
    setScrollIntervalSeconds(prev => Math.max(1, prev - 1));
  };
  
  // Function to decrease scroll speed
  const decreaseSpeed = () => {
    setScrollIntervalSeconds(prev => Math.min(60, prev + 1));
  };
  
  // Toggle auto-scroll on/off
  const toggleAutoScroll = () => {
    setAutoScrollActive(prev => !prev);
    // Reset timer when turning on
    if (!autoScrollActive) {
      lastScrollTimeRef.current = Date.now();
    }
  };
  
  // Toggle sound on/off
  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };
  
  // Keyboard shortcut for toggling auto-scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle auto-scroll with "s" key
      if (e.key === 's' || e.key === 'S') {
        toggleAutoScroll();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleAutoScroll]);
  
  return (
    <div className="pdf-auto-scroll-controls">
      <button 
        onClick={toggleAutoScroll}
        className={`scroll-toggle ${autoScrollActive ? 'active' : ''}`}
      >
        SCROLL {autoScrollActive ? 'ON' : 'OFF'}
      </button>
      
      <div className="speed-controls">
        <button onClick={decreaseSpeed} disabled={scrollIntervalSeconds >= 60}>-</button>
        <span className="interval-display">{scrollIntervalSeconds}s</span>
        <button onClick={increaseSpeed} disabled={scrollIntervalSeconds <= 1}>+</button>
      </div>
      
      <div className="sound-controls">
        <span>SOUND:</span>
        <label>
          <input
            type="radio"
            checked={soundEnabled}
            onChange={() => setSoundEnabled(true)}
          />
          ON
        </label>
        <label>
          <input
            type="radio"
            checked={!soundEnabled}
            onChange={() => setSoundEnabled(false)}
          />
          OFF
        </label>
      </div>
    </div>
  );
};

export default PDFAutoScroll;
