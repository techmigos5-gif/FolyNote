import React, { useState, useRef } from 'react';
import { DocumentItem, DocumentType } from '../types';
import { checkQuota, computeUsageBytes, formatBytes, QUOTA_BYTES } from '../lib/storageQuota';
import { toast } from '../lib/toast';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Pin, 
  Trash2, 
  Eye, 
  Download, 
  FileCode, 
  Plus, 
  Sparkles,
  CheckCircle,
  HardDrive
} from 'lucide-react';

interface DocumentsListViewProps {
  documents: DocumentItem[];
  onOpenDocument: (id: string) => void;
  onUploadDocument: (doc: DocumentItem, file?: File) => void;
  onDeleteDocument: (id: string) => void;
  onTogglePinDocument: (doc: DocumentItem) => void;
}

export const DocumentsListView: React.FC<DocumentsListViewProps> = ({
  documents,
  onOpenDocument,
  onUploadDocument,
  onDeleteDocument,
  onTogglePinDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processUploadedFile(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const processUploadedFile = (file: File) => {
    // Per-user 250 MB storage quota — reject politely before anything is uploaded.
    const quota = checkQuota(documents, file.size);
    if (!quota.ok) {
      toast(quota.message || 'Storage quota exceeded', 'error');
      return;
    }

    const name = file.name;
    const extension = name.split('.').pop()?.toLowerCase() || '';

    let type: DocumentType = 'doc';
    if (extension === 'pdf') type = 'pdf';
    else if (extension === 'md' || extension === 'markdown') type = 'markdown';
    else if (extension === 'json' || extension === 'ts' || extension === 'js') type = 'json';
    else if (extension === 'txt') type = 'txt';
    else if (/^(png|jpe?g|gif|webp|svg|avif|bmp|ico)$/.test(extension) || file.type.startsWith('image/')) type = 'image';

    // Only genuinely text-based formats are read as text. Binaries (pdf,
    // images, office docs) get a metadata placeholder — reading them as
    // UTF-8 produced garbage content in the preview.
    const isTextBased = type === 'markdown' || type === 'txt' || type === 'json';

    const sizeLabel =
      file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : file.size >= 1024
        ? `${(file.size / 1024).toFixed(0)} KB`
        : `${file.size} B`;

    const finish = (content: string) => {
      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type,
        size: sizeLabel,
        sizeBytes: file.size,
        pageCount: isTextBased ? Math.max(1, Math.ceil(content.length / 1800)) : 1,
        lastModified: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        tags: ['Uploaded', type.toUpperCase()],
        content,
        mimeType: file.type || undefined,
        summary:
          type === 'image'
            ? `Image uploaded: ${file.name}`
            : type === 'pdf'
            ? `Uploaded PDF document: ${file.name}`
            : `Uploaded ${type.toUpperCase()} document: ${file.name}`,
      };
      onUploadDocument(newDoc, file);
      showSuccess(`Uploaded "${file.name}"!`);
    };

    if (isTextBased) {
      const reader = new FileReader();
      reader.onload = (event) => {
        finish((event.target?.result as string) || `# ${file.name}\n\nEmpty file`);
      };
      reader.onerror = () => finish(`# ${file.name}\n
Could not read this file's text content.`);
      reader.readAsText(file);
    } else {
      finish(
        `# ${file.name}\n\n` +
          `**${type.toUpperCase()} file** stored in your private FolyNote space.\n\n` +
          `- File name: ${file.name}\n` +
          `- File size: ${sizeLabel}\n` +
          `- MIME type: ${file.type || 'unknown'}\n` +
          `- Offline cached: yes\n\n` +
          `Use the **Download** button in the viewer to open the original file.`,
      );
    }
  };

  const showSuccess = (msg: string) => {
    setUploadSuccessMessage(msg);
    setTimeout(() => setUploadSuccessMessage(null), 3500);
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.summary && doc.summary.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'all' || doc.type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-7 animate-in fade-in duration-200">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Documents
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Universal viewer for PDFs, Markdown, and notes with offline support
          </p>
        </div>

        <button
          id="upload-doc-header-btn"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-accent-600 hover:bg-accent-700 active:scale-98 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-accent-600/20 transition cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
        </button>          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.md,.markdown,.doc,.docx,.txt,.json,.png,.jpg,.jpeg,.gif,.webp,.svg"
            className="hidden"
          />
      </div>

      {/* Upload Success Alert */}
      {uploadSuccessMessage && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
          <span>{uploadSuccessMessage}</span>
        </div>
      )}

      {/* Storage quota meter — 250 MB per user */}
      <QuotaMeter documents={documents} />

      {/* 2. Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 rounded-2xl border-2 border-dashed transition text-center cursor-pointer flex flex-col items-center justify-center gap-2 ${
          isDragging
            ? 'border-accent-600 bg-accent-50/70'
            : 'border-gray-200 dark:border-gray-700 hover:border-accent-300 bg-white/60 dark:bg-[#221a30] hover:bg-accent-50/20'
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center">
          <Upload className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
            Click to upload or drag and drop any file
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            PDF, Markdown, DOC, Text, JSON, Images • 25 MB per file, 250 MB total
          </p>
        </div>
      </div>

      {/* 3. Search and Type Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[#221a30] border border-gray-200 dark:border-gray-700 text-xs focus:outline-none focus:border-accent-600 focus:ring-2 focus:ring-accent-100"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'all', label: 'All Files' },
            { key: 'pdf', label: 'PDFs' },
            { key: 'markdown', label: 'Markdown' },
            { key: 'doc', label: 'Docs & Notes' },
          ].map((type) => (
            <button
              key={type.key}
              onClick={() => setSelectedType(type.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer ${
                selectedType === type.key
                  ? 'bg-accent-600 text-white shadow-xs shadow-accent-600/20'
                  : 'bg-white dark:bg-[#221a30] border border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-[#221a30] p-12 rounded-2xl border border-gray-100 dark:border-gray-800 text-center space-y-2">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No matching documents found</p>
            <p className="text-xs text-gray-400">Try adjusting your search query or file filter</p>
          </div>
        ) : (
          filteredDocuments.map((doc) => {
            const isPdf = doc.type === 'pdf';
            const isMd = doc.type === 'markdown';
            const isImg = doc.type === 'image';
            const badge = isPdf ? 'PDF' : isMd ? 'MD' : isImg ? 'IMG' : 'DOC';
            const badgeClass = isPdf
              ? 'bg-red-500 text-white'
              : isMd
              ? 'bg-accent-600 text-white'
              : isImg
              ? 'bg-pink-500 text-white'
              : 'bg-blue-600 text-white';

            return (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#221a30] border border-gray-100 dark:border-gray-800 hover:border-accent-200 shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  {/* Top row: Icon + Pin button */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-2xs ${badgeClass}`}
                      >
                        {badge}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono text-gray-400 block">
                          {doc.size} • {doc.pageCount} {doc.pageCount === 1 ? 'page' : 'pages'}
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          Updated {doc.lastModified}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onTogglePinDocument(doc)}
                      className={`p-1.5 rounded-lg transition ${
                        doc.isPinned
                          ? 'text-accent-600 bg-accent-50'
                          : 'text-gray-300 hover:text-accent-600 hover:bg-gray-50'
                      }`}
                      title={doc.isPinned ? 'Unpin' : 'Pin to dashboard'}
                    >
                      <Pin className={`w-3.5 h-3.5 ${doc.isPinned ? 'fill-accent-600' : ''}`} />
                    </button>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => onOpenDocument(doc.id)}
                    className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-accent-700 transition cursor-pointer line-clamp-1 mb-1"
                  >
                    {doc.name}
                  </h3>

                  {/* Summary preview */}
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                    {doc.summary || doc.content.slice(0, 120)}
                  </p>
                </div>

                {/* Bottom row: Tags + Open button */}
                <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-1 overflow-hidden">
                    {doc.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-full bg-gray-50 dark:bg-gray-900/40 text-gray-600 text-[10px] font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenDocument(doc.id)}
                      className="px-3 py-1.5 rounded-xl bg-accent-50 hover:bg-accent-100 text-accent-700 text-xs font-semibold transition flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${doc.name}"?`)) {
                          onDeleteDocument(doc.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

/** Compact usage bar showing how much of the 250 MB quota is in use. */
const QuotaMeter: React.FC<{ documents: DocumentItem[] }> = ({ documents }) => {
  const used = computeUsageBytes(documents);
  const pct = Math.min(100, (used / QUOTA_BYTES) * 100);
  const barColor = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-accent-600';

  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#221a30] border border-gray-100 dark:border-gray-800 shadow-2xs">
      <span className="w-9 h-9 rounded-xl bg-accent-50 dark:bg-accent-950/50 text-accent-600 dark:text-accent-300 flex items-center justify-center shrink-0">
        <HardDrive className="w-4.5 h-4.5" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5">
          <span className="text-gray-700 dark:text-gray-200">Private storage</span>
          <span className="text-gray-400 tabular-nums">
            {formatBytes(used)} of 250 MB used
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Storage used">
          <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
};
