# Smart Timer

A React application for tracking work sessions with precision timing and data export capabilities.

## Features

- **Session Timing**: Start, pause, and stop timer with accurate time tracking
- **Daily Reset**: Automatically resets sessions each day at midnight
- **Session Management**: 
  - Add comments to each session
  - Delete individual sessions
  - Clear all sessions
- **Data Export**:
  - Copy table data for Google Sheets
  - Export sessions to CSV format
- **Smart UI**: Responsive design with smooth animations and visual feedback

## Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Prerequisites

- Node.js (v14 or later recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

### Running the Application

```
npm start
```

This runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Usage

1. **Start a Session**: Click the "Start" button to begin timing
2. **Pause/Resume**: Use the "Pause" button to temporarily stop timing
3. **Stop Session**: Click "Stop" to end the session and save it to the table
4. **Add Comments**: Click in the comments field of any session to add notes
5. **Export Data**: 
   - "Copy for Sheets" - Copies table data to clipboard for pasting into Google Sheets
   - "Export CSV" - Downloads session data as a CSV file
6. **Manage Sessions**: Delete individual sessions or clear all at once

## How It Works

The application uses:
- React hooks for state management
- Local timer state (resets on page refresh)
- Automatic daily reset functionality
- Lucide React icons for UI elements
- Tailwind CSS classes for styling

## Technologies Used

- React.js
- Lucide React (for icons)
- CSS/Tailwind for styling
- Web APIs for clipboard and file download

## Deploying to Vercel

This project is configured for easy deployment to Vercel:

1. **With Vercel CLI**:
   ```bash
   # Install Vercel CLI if you haven't already
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy from project directory
   vercel
   ```

2. **With GitHub Integration**:
   - Fork or push this repository to your GitHub account
   - Connect your GitHub repository to Vercel
   - Vercel will automatically detect it as a React application
   - The project will be built using the `build` script defined in package.json

## Note

Sessions are stored in component state and will reset when you refresh the page. For persistent storage, you would need to implement localStorage or a backend database.