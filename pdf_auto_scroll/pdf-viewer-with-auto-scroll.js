// PDF Viewer Component with Auto-Scroll Integration
import React, { useRef, useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import PDFAutoScroll from './PDFAutoScroll';
import './PDFViewer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const pdfViewerRef = useRef({
    currentPageNumber: 1,
    pagesCount: 0,
    container: null
  });
  
  // Handle successful PDF load
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    pdfViewerRef.current.pagesCount = numPages;
  }
  
  // Set up container reference
  useEffect(() => {
    pdfViewerRef.current.container = document.querySelector('.pdf-container');
  }, []);
  
  // Update currentPageNumber in ref when pageNumber state changes
  useEffect(() => {
    pdfViewerRef.current.currentPageNumber = pageNumber;
  }, [pageNumber]);
  
  // Handle page change
  const changePage = (offset) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages || 1);
    });
  };
  
  // Handle manual zoom controls
  const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.1, 3.0));
  const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.1, 0.5));
  const resetZoom = () => setScale(1.0);
  
  // PDF container scroll handler
  const onScroll = (e) => {
    const container = e.target;
    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // Auto-load next page when scrolled to bottom
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      if (pageNumber < numPages) {
        changePage(1);
      }
    }
  };
  
  return (
    <div className="pdf-viewer">
      <div className="pdf-toolbar">
        <div className="page-navigation">
          <button onClick={() => changePage(-1)} disabled={pageNumber <= 1}>
            Previous
          </button>
          <span>
            Page {pageNumber} of {numPages || '--'}
          </span>
          <button onClick={() => changePage(1)} disabled={pageNumber >= numPages}>
            Next
          </button>
        </div>
        
        <div className="zoom-controls">
          <button onClick={zoomOut}>-</button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn}>+</button>
          <button onClick={resetZoom}>Reset</button>
        </div>
        
        {/* Integrate Auto-Scroll Component */}
        <PDFAutoScroll pdfViewerRef={pdfViewerRef} />
      </div>
      
      <div className="pdf-container" onScroll={onScroll}>
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading="Loading PDF..."
          error="Failed to load PDF document."
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="pdf-page"
            />
          ))}
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;
