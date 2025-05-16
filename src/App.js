import React, { useState, useEffect } from 'react';
import './App.css';
import PDFViewer from './components/PDFViewer';

// Sample PDF URL that is known to work well
const SAMPLE_PDF_URL = "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf";

function App() {
  // State for uploaded PDF or URL
  const [pdfSource, setPdfSource] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setIsLoading(true);
      try {
        // Create a URL for the uploaded file
        const fileURL = URL.createObjectURL(file);
        setPdfSource(fileURL);
      } catch (error) {
        console.error("Error creating object URL:", error);
        alert(`Error loading PDF: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Handle URL input
  const handleURLSubmit = (e) => {
    e.preventDefault();
    const url = e.target.pdfUrl.value.trim();
    
    if (!url) {
      alert('Please enter a PDF URL');
      return;
    }
    
    if (url.endsWith('.pdf') || url.includes('.pdf?') || 
        url.includes('blob:') || url.includes('data:application/pdf')) {
      setIsLoading(true);
      setPdfSource(url);
      setIsLoading(false);
    } else {
      alert('Please enter a valid PDF URL (must end with .pdf)');
    }
  };
  
  // Load sample PDF
  const loadSamplePDF = () => {
    setIsLoading(true);
    setPdfSource(SAMPLE_PDF_URL);
    setIsLoading(false);
  };
  
  // Create a reference to the file input element
  const fileInputRef = React.useRef(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 'r' key to return to homepage
      if (e.key === 'r' || e.key === 'R') {
        if (pdfSource) {
          // Cleanup object URL if created locally
          if (pdfSource.startsWith('blob:')) {
            URL.revokeObjectURL(pdfSource);
          }
          setPdfSource(null);
        }
      }
      
      // 'Spacebar' key to open file dialog when on homepage and not typing in an input
      if (e.key === ' ' && !pdfSource && fileInputRef.current && 
          document.activeElement.tagName !== 'INPUT' && 
          document.activeElement.tagName !== 'BUTTON') {
        fileInputRef.current.click();
        e.preventDefault();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [pdfSource]);

  return (
    <div className="app">
      {!pdfSource ? (
        <div className="upload-section">
          <div className="upload-card">
            <h2>Upload a PDF (Spacebar)</h2>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="file-input"
              ref={fileInputRef}
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
            
            <div className="separator">OR</div>
            
            <button 
              className="sample-pdf-button" 
              onClick={loadSamplePDF}
            >
              Load Sample PDF
            </button>
            <p className="sample-info">
              Load a known-working PDF to test the functionality
            </p>
          </div>
        </div>
      ) : (
        <>
          {isLoading ? (
            <div className="loading">Loading PDF...</div>
          ) : (
            <div className="viewer-container">
              <PDFViewer pdfUrl={pdfSource} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;