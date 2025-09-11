import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface PDFViewerProps {
  fileId?: string;
  fileName?: string;
  onUpload: (file: File) => void;
  isUploading?: boolean;
}

export function PDFViewer({ fileId, fileName, onUpload, isUploading }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 25 * 1024 * 1024) {
        alert('File size must be less than 25MB');
        return;
      }
      onUpload(file);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  return (
    <div className="w-1/2 border-r border-border bg-card">
      <div className="h-full flex flex-col">
        {/* PDF Viewer Header */}
        <div className="border-b border-border px-4 py-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-foreground" data-testid="pdf-filename">
                {fileName || 'No file selected'}
              </span>
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                25MB limit
              </span>
            </div>
            {fileId && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  data-testid="zoom-out-btn"
                >
                  <i className="fas fa-search-minus"></i>
                </Button>
                <span className="text-sm text-muted-foreground" data-testid="zoom-level">
                  {zoom}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  data-testid="zoom-in-btn"
                >
                  <i className="fas fa-search-plus"></i>
                </Button>
                <Separator orientation="vertical" className="h-4 mx-2" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  data-testid="prev-page-btn"
                >
                  <i className="fas fa-chevron-left"></i>
                </Button>
                <span className="text-sm text-muted-foreground" data-testid="page-info">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  data-testid="next-page-btn"
                >
                  <i className="fas fa-chevron-right"></i>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* PDF Content Area */}
        <div className="flex-1 overflow-auto bg-muted/20 p-4">
          <div className="max-w-2xl mx-auto">
            {fileId ? (
              <div className="bg-white shadow-lg rounded-md border border-border mb-4">
                <div className="aspect-[8.5/11] flex items-center justify-center">
                  <iframe
                    src={`/api/files/${fileId}#page=${currentPage}&zoom=${zoom}`}
                    className="w-full h-full border-0 rounded-md"
                    data-testid="pdf-iframe"
                    title="PDF Viewer"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white shadow-lg rounded-md border border-border mb-4">
                <div className="aspect-[8.5/11] pdf-viewer-placeholder p-8">
                  <div className="text-center py-8">
                    <i className="fas fa-file-pdf text-6xl text-muted-foreground mb-4"></i>
                    <h3 className="text-lg font-medium text-foreground mb-2">PDF Viewer</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload a PDF to view and extract invoice data
                    </p>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                        data-testid="file-input"
                      />
                      <Button 
                        className="relative pointer-events-none" 
                        disabled={isUploading}
                        data-testid="upload-btn"
                      >
                        {isUploading ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-upload mr-2"></i>
                            Choose File
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
