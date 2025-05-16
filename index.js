// This is a simple Express server for Vercel deployment
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Use compression for better performance
try {
  const compression = require('compression');
  app.use(compression());
  console.log('Using compression middleware');
} catch (err) {
  console.log('Compression middleware not available');
}

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Parse JSON request bodies
app.use(express.json());

// Log requests for debugging
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// Force content type for specific extensions
app.use((req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  if (ext === '.json') {
    res.type('application/json');
  }
  next();
});

// Serve static files from the build directory with explicit content types
app.use(express.static(path.join(__dirname, 'build'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    }
  }
}));

// Simple test endpoint
app.get('/api/test', (req, res) => {
  try {
    res.json({ 
      status: 'ok', 
      message: 'API server is running',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API test error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: `Error in test endpoint: ${error.message}`
    });
  }
});

// List available files for debugging
app.get('/api/list-files', (req, res) => {
  try {
    const publicFiles = fs.readdirSync(path.join(__dirname, 'public'));
    const rootFiles = fs.readdirSync(__dirname);
    const buildFiles = fs.existsSync(path.join(__dirname, 'build')) 
      ? fs.readdirSync(path.join(__dirname, 'build'))
      : [];
    
    res.json({
      publicDirectory: publicFiles,
      rootDirectory: rootFiles,
      buildDirectory: buildFiles,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        hostname: require('os').hostname()
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fall back to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

// Export for Vercel
module.exports = app;