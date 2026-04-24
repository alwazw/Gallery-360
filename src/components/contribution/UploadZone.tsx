"use client";

import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface FileUpload {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

const DEFAULT_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export function UploadZone({ 
  onFilesSelected, 
  maxFiles = 20,
  maxSizeMB = 50,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES 
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<FileUpload[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): 'image' | 'video' | 'document' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  };

  const createPreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return 'File type not supported';
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large (max ${maxSizeMB}MB)`;
    }
    return null;
  };

  const handleFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    
    if (files.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const uploads: FileUpload[] = await Promise.all(
      fileArray.map(async (file) => {
        const error = validateFile(file);
        const preview = await createPreview(file);
        
        return {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          preview,
          progress: 0,
          status: error ? 'error' : 'pending',
          error: error || undefined,
        } as FileUpload;
      })
    );

    setFiles(prev => [...prev, ...uploads]);
    
    const validFiles = uploads
      .filter(u => u.status === 'pending')
      .map(u => u.file);
    
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }, [files.length, maxFiles, maxSizeMB, acceptedTypes, onFilesSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const FileIcon = ({ type }: { type: 'image' | 'video' | 'document' }) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-slate-600 hover:border-slate-500 bg-slate-800/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isDragOver ? 'bg-indigo-500/20' : 'bg-slate-700/50'
          }`}>
            <Upload className={`w-8 h-8 ${isDragOver ? 'text-indigo-400' : 'text-slate-400'}`} />
          </div>
          
          <div>
            <p className="text-lg font-medium text-white">
              {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              or click to browse
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1 px-2 py-1 bg-slate-700/30 rounded">
              <ImageIcon className="w-3 h-3" /> Images
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-slate-700/30 rounded">
              <Video className="w-3 h-3" /> Videos
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-slate-700/30 rounded">
              <FileText className="w-3 h-3" /> Documents
            </span>
          </div>
          
          <p className="text-xs text-slate-500">
            Max {maxSizeMB}MB per file, up to {maxFiles} files
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">{files.length} file(s) selected</span>
            <button
              onClick={() => setFiles([])}
              className="text-slate-500 hover:text-red-400 transition-colors"
            >
              Clear all
            </button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((upload) => (
              <div
                key={upload.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  upload.status === 'error'
                    ? 'bg-red-500/10 border border-red-500/30'
                    : 'bg-slate-800/50'
                }`}
              >
                {/* Preview or Icon */}
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-700/50 flex items-center justify-center">
                  {upload.preview ? (
                    <img 
                      src={upload.preview} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileIcon type={getFileType(upload.file)} />
                  )}
                </div>
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{upload.file.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(upload.file.size)}
                    {upload.error && (
                      <span className="text-red-400 ml-2">{upload.error}</span>
                    )}
                  </p>
                  
                  {/* Progress bar */}
                  {upload.status === 'uploading' && (
                    <div className="mt-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 transition-all"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {upload.status === 'pending' && (
                    <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center">
                      <Check className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                  {upload.status === 'uploading' && (
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                  )}
                  {upload.status === 'success' && (
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                  )}
                  {upload.status === 'error' && (
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    </div>
                  )}
                </div>
                
                {/* Remove button */}
                <button
                  onClick={() => removeFile(upload.id)}
                  className="p-1.5 hover:bg-slate-700/50 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400 hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
