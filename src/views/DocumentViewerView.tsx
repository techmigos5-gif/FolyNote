import React, { useState, useEffect } from 'react';
import { DocumentItem } from '../types';
import { documentsStorage } from '../api/documents';
import { fileStore } from '../lib/fileStore';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCw,
  Search,
  BookOpen,
  FileCode,
  FileText,
  FileSpreadsheet,
  Layers,
  Menu,
  X,
  Copy,
  Check,
  Share2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface DocumentViewerViewProps {
  document: DocumentItem;
  onBack: () => void;
  onTogglePin?: (doc: DocumentItem) => void;
}

export const DocumentViewerView: React.FC<DocumentViewerViewProps> = ({
  document,
  onBack,
  onTogglePin,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState<'rendered' | 'raw' | 'print'>('rendered');
  const [copied, setCopied] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [binaryFailed, setBinaryFailed] = useState(false);

  const totalPages = document.pageCount || 12;

  // Resolve the original binary (local IndexedDB copy first, then cloud)
  // so the viewer shows the real file instead of a text placeholder.
  useEffect(() => {
    let revokedPdf: string | null = null;
    let revokedImg: string | null = null;
    let cancelled = false;
    (async () => {
      if (document.type !== 'pdf' && document.type !== 'image') return;
      setBinaryFailed(false);
      let blob = await fileStore.get(document.id);
      if (!blob && document.storagePath) {
        blob = await documentsStorage.download(document.storagePath);
      }
      if (cancelled) return;
      if (!blob) {
        setBinaryFailed(true);
        return;
      }
      const url = URL.createObjectURL(blob);
      if (document.type === 'pdf') {
        revokedPdf = url;
        setPdfUrl(url);
      } else {
        revokedImg = url;
        setImageUrl(url);
      }
    })();
    return () => {
      cancelled = true;
      if (revokedPdf) URL.revokeObjectURL(revokedPdf);
      if (revokedImg) URL.revokeObjectURL(revokedImg);
      setPdfUrl(null);
      setImageUrl(null);
      setBinaryFailed(false);
    };
  }, [document.id, document.type, document.storagePath]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(200, prev + 15));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(50, prev - 15));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    if (!documentRef.current) return;
    if (!isFullscreen) {
      if (documentRef.current.requestFullscreen) {
        documentRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (window.document.exitFullscreen) {
        window.document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const documentRef = React.useRef<HTMLDivElement>(null);

  const handleCopyText = () => {
    navigator.clipboard.writeText(document.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    const saveBlob = (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name;
      a.click();
      URL.revokeObjectURL(url);
    };

    // Prefer the original uploaded binary: local copy first (works offline,
    // always present after an upload), then Supabase Storage.
    setIsDownloading(true);
    try {
      const local = await fileStore.get(document.id);
      if (local) {
        saveBlob(local);
        return;
      }
      if (document.storagePath) {
        const remote = await documentsStorage.download(document.storagePath);
        if (remote) {
          saveBlob(remote);
          return;
        }
      }
    } finally {
      setIsDownloading(false);
    }

    // No binary available (created-in-app text docs) — export the text content.
    saveBlob(new Blob([document.content], { type: 'text/plain;charset=utf-8' }));
  };

  // Slice content by pages for multi-page document experience.
  // Pages are built from the REAL content — earlier versions fabricated
  // filler text for pages beyond the first.
  const getPageContent = (page: number) => {
    const CHARS_PER_PAGE = 1800;
    const content = document.content || '';
    if (content.length <= CHARS_PER_PAGE) return content || '_This document has no text content._';
    const start = (page - 1) * CHARS_PER_PAGE;
    const slice = content.slice(start, start + CHARS_PER_PAGE);
    return slice || '_End of document._';
  };

  return (
    <div
      ref={documentRef}
      className={`min-h-[calc(100vh-4rem)] flex flex-col bg-[#2B2F38] text-gray-100 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#2B2F38]' : ''
      }`}
    >
      {/* 1. Header Bar: "← System Design Notes.pdf" */}
      <div className="h-14 bg-white dark:bg-[#221a30] border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 flex items-center justify-between text-gray-900 dark:text-gray-100 z-20 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="back-to-docs-btn"
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 dark:text-gray-300 hover:text-accent-700 transition flex items-center gap-1.5 font-semibold text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="truncate max-w-xs sm:max-w-md">{document.name}</span>
          </button>

          {/* Format Badge */}
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-accent-100 text-accent-700">
            {document.type}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle for MD/Text */}
          {document.type === 'markdown' && (
            <div className="flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setViewMode('rendered')}
                className={`px-2.5 py-1 rounded-md transition ${
                  viewMode === 'rendered' ? 'bg-white dark:bg-[#221a30] text-accent-700 shadow-2xs' : 'text-gray-600'
                }`}
              >
                Rendered
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`px-2.5 py-1 rounded-md transition ${
                  viewMode === 'raw' ? 'bg-white dark:bg-[#221a30] text-accent-700 shadow-2xs' : 'text-gray-600'
                }`}
              >
                Markdown Raw
              </button>
            </div>
          )}

          {/* Copy content */}
          <button
            onClick={handleCopyText}
            className="p-1.5 rounded-lg text-gray-600 hover:text-accent-700 hover:bg-gray-100 transition"
            title="Copy document content"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="p-1.5 rounded-lg text-gray-600 hover:text-accent-700 hover:bg-gray-100 transition disabled:opacity-50"
            title={document.storagePath ? 'Download original file' : 'Download document'}
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="p-1.5 rounded-lg text-gray-600 hover:text-accent-700 hover:bg-gray-100 transition"
            title="Print document"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. PDF / Document Toolbar (matching Screen 4 in screenshot) */}
      <div className="h-12 bg-[#333842] border-b border-[#22262E] px-4 flex items-center justify-between text-xs text-gray-300 select-none shrink-0 overflow-x-auto gap-3">
        {/* Left: Table of contents toggle + "Doc" indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowOutline(!showOutline)}
            className={`p-1.5 rounded hover:bg-white/10 transition ${showOutline ? 'text-accent-400 bg-white/10 dark:bg-[#221a30]' : ''}`}
            title="Toggle Outline / Table of Contents"
          >
            <Menu className="w-4 h-4" />
          </button>

          <span className="font-semibold text-gray-200 hidden sm:inline">
            Doc
          </span>
        </div>

        {/* Center: Page navigator and Zoom Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Page numbers */}
          <div className="flex items-center gap-1.5 bg-[#252930] px-2.5 py-1 rounded-md border border-gray-700/50">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-0.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs px-1 text-white">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="p-0.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-gray-600" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1.5 bg-[#252930] px-2 py-1 rounded-md border border-gray-700/50">
            <button
              onClick={handleZoomOut}
              className="p-0.5 rounded hover:bg-white/10"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs px-1 text-white w-10 text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-0.5 rounded hover:bg-white/10"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rotate button */}
          <button
            onClick={handleRotate}
            className="p-1.5 rounded hover:bg-white/10"
            title="Rotate 90 degrees"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Search & Fullscreen */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded hover:bg-white/10 transition ${showSearch ? 'text-accent-400 bg-white/10 dark:bg-[#221a30]' : ''}`}
            title="Search in document"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded hover:bg-white/10"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Search Bar Overlay */}
      {showSearch && (
        <div className="bg-[#242831] border-b border-[#1A1D24] px-4 py-2 flex items-center justify-between text-xs animate-in slide-in-from-top duration-150 shrink-0">
          <div className="flex items-center gap-2 w-full max-w-md">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Find text in document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A1D24] px-2.5 py-1 rounded text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </div>
          <button
            onClick={() => {
              setShowSearch(false);
              setSearchQuery('');
            }}
            className="p-1 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Main Workspace Area: Optional Sidebar Outline + Document Canvas */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Outline / Sections Drawer */}
        {showOutline && (
          <div className="w-64 bg-[#23272F] border-r border-[#1B1E24] p-4 text-xs overflow-y-auto shrink-0 animate-in slide-in-from-left duration-150">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-700">
              <span className="font-bold text-gray-200 uppercase tracking-wider text-[10px]">
                Outline &amp; Thumbnails
              </span>
              <button
                onClick={() => setShowOutline(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              {document.sections && document.sections.length > 0 ? (
                document.sections.map((sec) => (
                  <button
                    key={sec.page}
                    onClick={() => setCurrentPage(sec.page)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg transition flex items-center justify-between ${
                      currentPage === sec.page
                        ? 'bg-accent-600/30 text-accent-300 font-semibold border border-accent-500/40'
                        : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate pr-2">{sec.title}</span>
                    <span className="font-mono text-[10px] text-gray-500">p.{sec.page}</span>
                  </button>
                ))
              ) : (
                Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition flex items-center justify-between ${
                      currentPage === p
                        ? 'bg-accent-600/30 text-accent-300 font-semibold'
                        : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <span>Page {p}</span>
                    <span className="font-mono text-[10px] text-gray-500">{p}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* 4. Canvas: Realistic Sheet Container */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-[#22252C]">
          <div
            style={{
              transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="w-full max-w-3xl bg-white dark:bg-[#221a30] text-gray-900 dark:text-gray-100 rounded-lg shadow-2xl p-8 sm:p-14 min-h-[900px] flex flex-col justify-between selection:bg-accent-200 selection:text-accent-900"
          >
            {/* Document Header Bar inside sheet */}
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-8 flex items-center justify-between text-[11px] text-gray-400 select-none">
              <span>{document.name}</span>
              <span className="font-mono">Page {currentPage} of {totalPages}</span>
            </div>

            {/* Document Body */}
            {document.type === 'pdf' && pdfUrl ? (
              <div className="flex-1">
                <iframe
                  src={pdfUrl}
                  title={document.name}
                  className="w-full h-[1000px] rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
            ) : document.type === 'image' && imageUrl ? (
              <div className="flex-1 flex items-start justify-center">
                <img
                  src={imageUrl}
                  alt={document.name}
                  className="max-w-full max-h-[800px] rounded-lg border border-gray-200 dark:border-gray-700 object-contain"
                />
              </div>
            ) : binaryFailed ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-16">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    Preview isn&apos;t available for this file here
                  </p>
                  <p className="text-xs text-gray-500 max-w-sm">
                    The original {document.mimeType || document.type.toUpperCase()} file is safely stored.
                    Download it to open with your device&apos;s apps.
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-600 hover:bg-accent-700 text-white text-xs font-bold shadow-md shadow-accent-600/20 transition disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Original File
                </button>
              </div>
            ) : (
            <div className="flex-1 space-y-6">
              {viewMode === 'raw' ? (
                <pre className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl font-mono text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap border border-gray-200 dark:border-gray-700 overflow-x-auto">
                  {getPageContent(currentPage)}
                </pre>
              ) : (
                <div className="prose prose-purple max-w-none text-gray-800 dark:text-gray-200 prose-headings:text-gray-950 prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-base prose-p:leading-relaxed prose-li:my-1 prose-pre:bg-gray-900 prose-pre:text-accent-200">
                  <ReactMarkdown>
                    {getPageContent(currentPage)}
                  </ReactMarkdown>
                </div>
              )}
            </div>
            )}

            {/* Document Footer inside sheet */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-12 flex items-center justify-between text-[10px] text-gray-400 select-none">
              <span>Confidential • FolyNote Offline Cache</span>
              <span className="font-mono">ID: {document.id}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
