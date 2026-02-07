'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

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
    // TODO: Implement actual upload logic
    await new Promise(resolve => setTimeout(resolve, 2000));
    setUploading(false);
    alert('Upload complete! (Mock - Day 2 in progress)');
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Uploaded Files ({files.length})
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
                {uploading ? 'Uploading...' : 'Upload & Process'}
              </button>
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
