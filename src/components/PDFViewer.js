import React, { useRef, useState, useEffect } from 'react';
import PDFAutoScroll from './PDFAutoScroll';
import './PDFViewer.css';

// Import pdfjs library directly - explicitly set version for stability
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Set the worker source explicitly
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

const PDFViewer = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [editedPageNumber, setEditedPageNumber] = useState('');
  
  const containerRef = useRef(null);
  const pdfDocRef = useRef(null);
  const canvasRef = useRef(null);
  const renderingRef = useRef(false); // Track if a render operation is in progress
  const renderQueueRef = useRef([]); // Queue for pending render operations
  
  const pdfViewerRef = useRef({
    currentPageNumber: 1,
    pagesCount: 0,
    container: null
  });
  
  // Utility function to safely render a page to the canvas
  const safeRenderPage = async (pageNumber, scale, adjustedScale = 2.0) => {
    // Add this render operation to the queue if another one is already in progress
    if (renderingRef.current) {
      return new Promise((resolve, reject) => {
        renderQueueRef.current.push({
          pageNumber, 
          scale, 
          adjustedScale,
          resolve,
          reject
        });
      });
    }
    
    // Mark that we're now rendering
    renderingRef.current = true;
    
    try {
      if (!pdfDocRef.current || !canvasRef.current) {
        throw new Error("PDF document or canvas not available");
      }
      
      // Get the page
      const page = await pdfDocRef.current.getPage(pageNumber);
      
      // Get the viewport with current scale
      const viewport = page.getViewport({ scale: 1.0 });
      
      // Get the canvas and context
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', { alpha: false });
      
      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set canvas dimensions for high quality
      canvas.width = viewport.width * adjustedScale;
      canvas.height = viewport.height * adjustedScale;
      
      // Store original dimensions for zoom calculations
      canvas.setAttribute('data-original-width', viewport.width);
      canvas.setAttribute('data-original-height', viewport.height);
      
      // Apply zoom to display size
      canvas.style.width = (viewport.width * scale) + 'px';
      canvas.style.height = (viewport.height * scale) + 'px';
      
      // Set scale for context
      context.scale(adjustedScale, adjustedScale);
      
      // Render the page
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      // Clean up page resources
      page.cleanup && page.cleanup();
      
      // Update auto-scroll refs
      pdfViewerRef.current.currentPageNumber = pageNumber;
      if (containerRef.current) {
        pdfViewerRef.current.container = containerRef.current;
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      setError(`Error rendering page ${pageNumber}: ${error.message}`);
      throw error;
    } finally {
      // Mark that we're done rendering
      renderingRef.current = false;
      
      // Check if there are any queued render operations
      if (renderQueueRef.current.length > 0) {
        // Get the next render operation from the queue (most recent one)
        const nextRender = renderQueueRef.current.pop();
        
        // Clear the rest of the queue since we'll only process the most recent request
        renderQueueRef.current = [];
        
        // Process the next render operation
        safeRenderPage(nextRender.pageNumber, nextRender.scale, nextRender.adjustedScale)
          .then(nextRender.resolve)
          .catch(nextRender.reject);
      }
    }
  };
  
  // Load the PDF document
  useEffect(() => {
    if (!pdfUrl) return;
    
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setPdfLoaded(false);
    
    // Function to handle PDF loading
    const loadPdf = async () => {
      try {
        let pdfData;
        
        // Handle different types of PDF sources
        if (pdfUrl.startsWith('blob:') || pdfUrl.startsWith('data:')) {
          // It's a blob URL or data URL, fetch it
          const response = await fetch(pdfUrl);
          const arrayBuffer = await response.arrayBuffer();
          pdfData = new Uint8Array(arrayBuffer);
        } else {
          // It's a regular URL
          pdfData = { url: pdfUrl, withCredentials: false };
        }
        
        // Load the PDF
        const pdf = await pdfjsLib.getDocument(pdfData).promise;
        
        if (!isMounted) return;
        
        // Store the pdf document
        pdfDocRef.current = pdf;
        
        // Set the total page count
        setNumPages(pdf.numPages);
        pdfViewerRef.current.pagesCount = pdf.numPages;
        setPageNumber(1);
        setPdfLoaded(true);
        setIsLoading(false);
      } catch (error) {
        if (!isMounted) return;
        console.error('Error loading PDF:', error);
        setError(`Failed to load PDF: ${error.message}`);
        setIsLoading(false);
      }
    };
    
    loadPdf();
    
    // Cleanup
    return () => {
      isMounted = false;
      if (pdfDocRef.current) {
        try {
          pdfDocRef.current.destroy();
          pdfDocRef.current = null;
        } catch (e) {
          console.error('Error destroying PDF document:', e);
        }
      }
    };
  }, [pdfUrl]);
  
  // Render the current page when page number changes
  useEffect(() => {
    if (!pdfLoaded || !pdfDocRef.current || !canvasRef.current || !pageNumber) {
      return;
    }
    
    let isMounted = true;
    
    const renderPage = async () => {
      try {
        if (!isMounted) return;

        // Use our safe render function to handle the rendering
        await safeRenderPage(pageNumber, scale);
      } catch (error) {
        if (!isMounted) return;
        console.error('Error rendering page:', error);
        setError(`Error rendering page ${pageNumber}: ${error.message}`);
      }
    };
    
    renderPage();
    
    return () => {
      isMounted = false;
    };
  }, [pageNumber, pdfLoaded]);
  
  // Update zoom when scale changes
  useEffect(() => {
    if (!canvasRef.current || !pdfLoaded || !pdfDocRef.current) return;
    
    // Only need to re-render the page with the new scale
    const renderWithNewScale = async () => {
      try {
        // Use our safe render function to handle the rendering with new scale
        await safeRenderPage(pageNumber, scale);
      } catch (error) {
        console.error('Error re-rendering page for zoom:', error);
      }
    };
    
    renderWithNewScale();
  }, [scale]);
  
  // Handle page navigation
  const changePage = (offset, resetScroll = true) => {
    if (!numPages) return;
    
    // Create and dispatch an event to notify auto-scroll component to reset timer
    const resetTimerEvent = new CustomEvent('resetAutoScrollTimer');
    document.dispatchEvent(resetTimerEvent);
    
    // Reset scroll position when changing pages (if resetScroll is true)
    if (resetScroll && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages);
    });
  };
  
  // Handle zoom controls
  const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.25, 4.0));
  const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.25, 0.5));
  
  // This is simply a reset function now (not a full reload to homepage)
  const resetPDFView = () => {
    setScale(1.0);
    setPageNumber(1);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };
  
  // Listen for page change events from auto-scroll and handle key navigation
  useEffect(() => {
    const handlePageChange = (event) => {
      const { newPage } = event.detail;
      if (newPage && newPage <= numPages) {
        setPageNumber(newPage);
      }
    };
    
    // Handle page change without scroll reset
    const handlePageChangeNoScroll = (event) => {
      const { newPage } = event.detail;
      if (newPage && newPage <= numPages) {
        changePage(newPage - pageNumber, false);
      }
    };
    
    // Handle keyboard navigation for scrolling within PDF container
    const handleKeyDown = (e) => {
      // Find the PDF container element which has the scrollbar
      const pdfContainer = document.querySelector('.pdf-container');
      if (!pdfContainer) return;
      
      if (e.key === 'x' || e.key === 'X') {
        // Scroll up within the PDF container
        pdfContainer.scrollBy({
          top: -150,
          behavior: 'smooth'
        });
        e.preventDefault(); // Prevent default browser behavior
      } else if (e.key === 'c' || e.key === 'C') {
        // Scroll down within the PDF container
        pdfContainer.scrollBy({
          top: 150,
          behavior: 'smooth'
        });
        e.preventDefault(); // Prevent default browser behavior
      } else if (e.key === 'o' || e.key === 'O') {
        // Scroll to top of the page (like Home key)
        pdfContainer.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        e.preventDefault(); // Prevent default browser behavior
      } else if (e.key === 'p' || e.key === 'P') {
        // Scroll to bottom of the page (like End key)
        pdfContainer.scrollTo({
          top: pdfContainer.scrollHeight,
          behavior: 'smooth'
        });
        
        // Reset auto-scroll timer
        const resetTimerEvent = new CustomEvent('resetAutoScrollTimer');
        document.dispatchEvent(resetTimerEvent);
        
        e.preventDefault(); // Prevent default browser behavior
      } else if (e.key === 'r' || e.key === 'R') {
        // Reset to first page with zoom at 100%
        resetPDFView();
        
        // Reset auto-scroll timer
        const resetTimerEvent = new CustomEvent('resetAutoScrollTimer');
        document.dispatchEvent(resetTimerEvent);
        
        e.preventDefault(); // Prevent default browser behavior
      }
    };
    
    document.addEventListener('pageChange', handlePageChange);
    document.addEventListener('pageChangeNoScroll', handlePageChangeNoScroll);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('pageChange', handlePageChange);
      document.removeEventListener('pageChangeNoScroll', handlePageChangeNoScroll);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [numPages]);
  
  return (
    <div className="pdf-viewer">
      <div className="pdf-toolbar">
        <div className="page-navigation">
          <button 
            onClick={() => changePage(-1)} 
            disabled={pageNumber <= 1 || isLoading}
          >
            Previous (z/o)
          </button>
          {isEditingPage ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              const newPage = parseInt(editedPageNumber, 10);
              if (!isNaN(newPage) && newPage >= 1 && newPage <= numPages) {
                setPageNumber(newPage);
                // Reset scroll position
                if (containerRef.current) {
                  containerRef.current.scrollTop = 0;
                }
                // Reset auto-scroll timer
                const resetTimerEvent = new CustomEvent('resetAutoScrollTimer');
                document.dispatchEvent(resetTimerEvent);
              }
              setIsEditingPage(false);
            }}>
              <input
                type="text"
                value={editedPageNumber}
                onChange={(e) => setEditedPageNumber(e.target.value)}
                onBlur={() => setIsEditingPage(false)}
                autoFocus
                style={{ width: '40px', textAlign: 'center' }}
              />
              <span> of {numPages || '--'}</span>
            </form>
          ) : (
            <span 
              onClick={() => {
                setIsEditingPage(true);
                setEditedPageNumber(pageNumber.toString());
              }}
              style={{ cursor: 'pointer', padding: '2px 5px', border: '1px dashed transparent', borderRadius: '4px' }}
              title="Click to edit page number"
            >
              Page <span style={{ border: '1px dashed #aaa', padding: '1px 5px', borderRadius: '3px' }}>{pageNumber}</span> of {numPages || '--'}
            </span>
          )}
          <button 
            onClick={() => changePage(1)} 
            disabled={pageNumber >= numPages || isLoading}
            id="next-page-button"
          >
            Next (m/,/p)
          </button>
        </div>
        
        <div className="zoom-controls">
          <button onClick={zoomOut} disabled={isLoading}>-</button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} disabled={isLoading}>+</button>
          <button onClick={resetPDFView} disabled={isLoading}>Reload PDF (r)</button>
        </div>
        
        <PDFAutoScroll pdfViewerRef={pdfViewerRef} />
      </div>
      
      <div className="pdf-container" ref={containerRef}>
        {error && <div className="pdf-error">{error}</div>}
        {isLoading && <div className="pdf-loading">Loading PDF document...</div>}
        {pdfLoaded && !isLoading && !error && (
          <canvas ref={canvasRef} className="pdf-page"></canvas>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;