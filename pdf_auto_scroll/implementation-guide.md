# PDF Auto-Scroll Feature Implementation Guide

This guide explains how to implement an auto-scroll feature for PDF documents, similar to the Bible Cross Reference App mentioned in the requirements.

## Overview

The auto-scroll feature allows users to automatically scroll through PDF documents at a customizable pace, providing a hands-free reading experience. This implementation works with React and the react-pdf library.

## Core Components

1. **Auto-Scroll Controls**:
   - Toggle button to turn auto-scroll ON/OFF
   - Speed controls to adjust scroll interval (+ and - buttons)
   - Sound toggle for audio feedback when scrolling

2. **PDF Viewer Integration**:
   - Smooth scrolling through PDF documents
   - Page transition handling
   - Zoom controls
   - Keyboard shortcuts

## Implementation Steps

### 1. Set Up Project Dependencies

First, install the necessary packages:

```bash
npm install react-pdf @react-pdf/renderer
# or
yarn add react-pdf @react-pdf/renderer
```

### 2. Create Auto-Scroll Component

The `PDFAutoScroll.js` component manages the auto-scroll functionality, timer logic, and user controls.

Key features:
- State management for auto-scroll active status
- Interval timing controls
- Sound system for audio feedback
- Integration with PDF viewer reference

### 3. PDF Viewer Component

The `PDFViewer.js` component handles the actual PDF display and integrates the auto-scroll feature.

Key features:
- Document rendering
- Page navigation
- Zoom controls
- Container for auto-scroll functionality

### 4. CSS Styling

Apply styles to create a user-friendly interface with clear controls.

### 5. Main Application

Implement file loading and the overall application structure.

## Technical Implementation Details

### Auto-Scroll Logic

The auto-scroll system works by:

1. Setting up a timed interval that triggers scrolling actions
2. Using a React ref to track the last scroll time
3. Calculating appropriate scroll amounts based on the viewport
4. Handling page transitions when reaching the end of a page

```javascript
// Core auto-scroll timing function
useEffect(() => {
  let intervalId;
  
  if (autoScrollActive) {
    intervalId = setInterval(() => {
      const now = Date.now();
      if (now - lastScrollTimeRef.current >= scrollIntervalSeconds * 1000) {
        performScroll();
      }
    }, 1000); // Check every second
  }
  
  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}, [autoScrollActive, performScroll, scrollIntervalSeconds]);
```

### PDF Scrolling Mechanism

Unlike the Bible app which simulates key presses, the PDF scroll implementation directly manipulates the scroll position of the container:

```javascript
const performScroll = useCallback(() => {
  if (!pdfViewerRef.current) return;
  
  const viewer = pdfViewerRef.current;
  const container = viewer.container;
  if (!container) return;
  
  const viewportHeight = container.clientHeight;
  const scrollAmount = viewportHeight * 0.5; // Scroll 50% of viewport
  
  const isAtBottomOfPage = container.scrollTop + viewportHeight >= container.scrollHeight - 20;
  
  if (isAtBottomOfPage && currentPage < totalPages) {
    // Move to next page
    viewer.currentPageNumber = currentPage + 1;
    container.scrollTop = 0;
  } else {
    // Continue scrolling down current page
    container.scrollTop += scrollAmount;
  }
  
  // Update last scroll time and play sound if enabled
  lastScrollTimeRef.current = Date.now();
  if (soundEnabled) playSubtleBeep();
}, [pdfViewerRef, soundEnabled]);
```

### Audio Feedback System

Similar to the Bible app, this implementation includes a subtle audio beep:

```javascript
const playSubtleBeep = useCallback(() => {
  if (!soundEnabled) return;
  
  try {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.05;
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    gainNode.gain.setValueAtTime(0.05, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.15);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.15);
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
}, [soundEnabled]);
```

## User Interface Elements

1. **Scroll Toggle Button**: Shows "SCROLL ON" (green) or "SCROLL OFF" (gray)

2. **Speed Controls**:
   - Minus (-) button to decrease scroll speed (increase interval time)
   - Display showing current interval in seconds
   - Plus (+) button to increase scroll speed (decrease interval time)

3. **Sound Toggle**:
   - Radio buttons labeled "SOUND: ON/OFF"
   - Default is ON

## Key Differences from Bible App Implementation

1. **Scroll Mechanism**: 
   - Bible App: Simulates 'z' key press
   - PDF Viewer: Directly manipulates scroll position and page transitions

2. **Page Handling**:
   - Added logic to detect page boundaries and move to next page when appropriate

3. **Integration Method**:
   - Uses `react-pdf` library for PDF rendering
   - Maintains reference to PDF viewer for scroll control

4. **Responsive Design**:
   - Adjusts controls layout for different screen sizes

## Additional Features

1. **Keyboard Shortcut**:
   - Toggle auto-scroll with 'S' key
   - Convenient control without moving to the toolbar

2. **Scroll Amount Calculation**:
   - Adapts scroll amount based on viewport size
   - Provides consistent experience across devices

3. **File Loading**:
   - Support for both file upload and URL loading
   - Object URL management for uploaded files

## Behavior Notes

- The auto-scroll only triggers after waiting the full interval time
- When changing pages, the timer automatically resets
- The sound feature provides audio feedback when scrolling occurs
- Speed can be adjusted from very fast (1 second) to very slow (60 seconds)
- The controls integrate seamlessly with the PDF viewer interface

This implementation creates a smooth, customizable reading experience for PDF documents that can be easily adjusted according to user preferences.
