'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  key: string;
  uploadedAt: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // Fetch existing files on mount
  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const fetchUploadedFiles = async () => {
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      if (data.success) {
        // Transform API response to match UploadedFile format
        const transformed = data.files.map((f: any) => ({
          id: f.key.split('/').pop()?.split('.')[0] || '',
          name: f.name,
          size: f.size,
          type: 'application/pdf', // We don't store type in R2 metadata yet
          url: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${f.key}`,
          key: f.key,
          uploadedAt: f.lastModified,
        }));
        setUploadedFiles(transformed);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls', '.xlsx'],
      'application/msword': ['.doc', '.docx'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
  });

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        
        if (data.success) {
          return data.file;
        } else {
          throw new Error(data.error || 'Upload failed');
        }
      });

      const uploadedFileResults = await Promise.all(uploadPromises);
      
      // Add newly uploaded files to the list
      setUploadedFiles(prev => [...prev, ...uploadedFileResults]);
      
      // Clear pending files
      setFiles([]);
      
      alert(`✅ Successfully uploaded ${uploadedFileResults.length} file(s)!`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const deleteUploadedFile = async (key: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/files/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        setUploadedFiles(prev => prev.filter(f => f.key !== key));
        alert('✅ File deleted successfully');
      } else {
        throw new Error(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Failed to delete file');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-white">📐</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  AI Construction Estimator
                </h1>
                <p className="text-xs text-slate-500">Upload Documents</p>
              </div>
            </div>
            <a href="/" className="text-sm text-slate-600 hover:text-slate-900">
              ← Back to Home
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Upload Project Documents
          </h2>
          <p className="text-slate-600 mb-8">
            Upload your drawings, specifications, and scope documents. We'll analyze them and generate your estimate.
          </p>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 bg-white hover:border-slate-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">📄</span>
              </div>
              {isDragActive ? (
                <p className="text-lg text-slate-700">Drop files here...</p>
              ) : (
                <>
                  <p className="text-lg text-slate-700">
                    <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-sm text-slate-500">
                    PDF, Excel, Word, Images (up to 50MB each)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Pending Files (to be uploaded) */}
          {files.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Ready to Upload ({files.length})
              </h3>
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                        <span className="text-xl">
                          {file.type.includes('pdf') ? '📄' : 
                           file.type.includes('image') ? '🖼️' : '📊'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{file.name}</p>
                        <p className="text-sm text-slate-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
              </button>
            </div>
          )}

          {/* Uploaded Files (stored in R2) */}
          {uploadedFiles.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Uploaded Files ({uploadedFiles.length})
              </h3>
              <div className="space-y-3">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                        <span className="text-xl">✅</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{file.name}</p>
                        <p className="text-sm text-slate-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB · Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View
                      </a>
                      <button
                        onClick={() => deleteUploadedFile(file.key)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Cards */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-slate-200 rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-semibold text-slate-900 mb-1">Fast Processing</h4>
              <p className="text-sm text-slate-600">
                AI analyzes your documents in seconds, not hours
              </p>
            </div>
            <div className="p-6 bg-white border border-slate-200 rounded-lg">
              <div className="text-2xl mb-2">🔒</div>
              <h4 className="font-semibold text-slate-900 mb-1">Secure Storage</h4>
              <p className="text-sm text-slate-600">
                Your documents are encrypted and stored securely
              </p>
            </div>
            <div className="p-6 bg-white border border-slate-200 rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-semibold text-slate-900 mb-1">Smart Analysis</h4>
              <p className="text-sm text-slate-600">
                Detects quantities, applies rates, finds missing scope
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
