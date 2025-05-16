// Example Implementation with React PDF Viewer
import React, { useState } from 'react';
import PDFViewer from './PDFViewer';
import './App.css';

function App() {
  // State for uploaded PDF or URL
  const [pdfSource, setPdfSource] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setIsLoading(true);
      // Create a URL for the uploaded file
      const fileURL = URL.createObjectURL(file);
      setPdfSource(fileURL);
      setIsLoading(false);
    }
  };
  
  // Handle URL input
  const handleURLSubmit = (e) => {
    e.preventDefault();
    const url = e.target.pdfUrl.value;
    if (url && url.endsWith('.pdf')) {
      setIsLoading(true);
      setPdfSource(url);
      setIsLoading(false);
    } else {
      alert('Please enter a valid PDF URL');
    }
  };
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>PDF Auto-Scroll Viewer</h1>
      </header>
      
      {!pdfSource ? (
        <div className="upload-section">
          <div className="upload-card">
            <h2>Upload a PDF</h2>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="file-input"
            />
            
            <div className="separator">OR</div>
            
            <h2>Enter PDF URL</h2>
            <form onSubmit={handleURLSubmit}>
              <input
                type="text"
                name="pdfUrl"
                placeholder="https://example.com/document.pdf"
                className="url-input"
              />
              <button type="submit" className="url-submit">Load PDF</button>
            </form>
          </div>
        </div>
      ) : (
        <>
          {isLoading ? (
            <div className="loading">Loading PDF...</div>
          ) : (
            <div className="viewer-container">
              <button 
                className="reset-button"
                onClick={() => {
                  // Cleanup object URL if created locally
                  if (pdfSource.startsWith('blob:')) {
                    URL.revokeObjectURL(pdfSource);
                  }
                  setPdfSource(null);
                }}
              >
                Load Different PDF
              </button>
              
              <PDFViewer pdfUrl={pdfSource} />
              
              <div className="instructions">
                <h3>Auto-Scroll Instructions:</h3>
                <ul>
                  <li>Click "SCROLL ON" to enable auto-scrolling</li>
                  <li>Use + and - buttons to adjust scroll speed</li>
                  <li>Toggle sound ON/OFF for audio feedback</li>
                  <li>Press 'S' key as a keyboard shortcut to toggle scrolling</li>
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
