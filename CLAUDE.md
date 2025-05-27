# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Architecture Overview

This is a React-based smart timer application for tracking work sessions with the following key components:

### Core Components
- **App.js**: Main application wrapper that renders SmartCountdownTimer
- **SmartCountdownTimer.js**: Primary timer component with session tracking, data export, and daily reset functionality

### Key Libraries
- **lucide-react**: Icon library for UI elements (Play, Pause, Stop, Download, Trash icons)
- **react**: Core React library for component state and lifecycle management

### Timer Features
The SmartCountdownTimer component provides:
- Start/pause/stop timer functionality with accurate time tracking
- Session management with start/stop timestamps and duration calculation
- Editable comments for each session
- Data export capabilities (CSV download and clipboard copy for Google Sheets)
- Automatic daily reset at midnight
- Session deletion and bulk clear functionality

### Project Structure
- Main timer logic is in `src/SmartCountdownTimer.js`
- Component uses React hooks (useState, useEffect, useRef) for state management
- Timer intervals managed with useRef to prevent memory leaks
- Date/time formatting utilities built-in

### Deployment
Configured for Vercel deployment with:
- Static build configuration in `vercel.json`
- React build output directed to `build/` directory
- SPA routing configured

## State Management
The timer uses local component state (no persistence) with the following key state variables:
- `isRunning`: Boolean for timer active state
- `elapsedTime`: Seconds counter for current session
- `sessions`: Array of completed session objects
- `currentSessionStart`: Timestamp when current session began