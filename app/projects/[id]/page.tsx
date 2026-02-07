'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import QuantitiesTab from './components/QuantitiesTab';
import EstimateTab from './components/EstimateTab';

interface ProjectDetail {
  id: string;
  name: string;
  description?: string;
  location?: string;
  clientName?: string;
  status: string;
  totalCost?: number;
  laborCost?: number;
  materialCost?: number;
  markupPercent?: number;
  files: any[];
  quantities: any[];
  lineItems: any[];
  missingScopes: any[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'files' | 'quantities' | 'estimate'>('files');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();
      if (data.success) {
        setProject(data.project);
      } else {
        alert('Project not found');
        router.push('/projects');
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setPendingFiles(prev => [...prev, ...acceptedFiles]);
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

  const uploadFiles = async () => {
    if (pendingFiles.length === 0) return;

    setUploading(true);

    try {
      for (const file of pendingFiles) {
        const formData = new FormData();
        formData.append('file', file);

        await fetch(`/api/projects/${projectId}/files`, {
          method: 'POST',
          body: formData,
        });
      }

      setPendingFiles([]);
      fetchProject(); // Refresh project data
      alert(`✅ Successfully uploaded ${pendingFiles.length} file(s)!`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/process`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Processed! Found ${data.stats.quantitiesFound} quantities`);
        fetchProject(); // Refresh to show new quantities
      } else {
        alert(`❌ Processing failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Process error:', error);
      alert('❌ Processing failed');
    }
  };

  const processAllFiles = async () => {
    if (!project?.files || project.files.length === 0) {
      alert('No files to process');
      return;
    }

    const pdfFiles = project.files.filter(f => f.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      alert('No PDF files to process');
      return;
    }

    if (!confirm(`Process ${pdfFiles.length} PDF file(s)?`)) return;

    for (const file of pdfFiles) {
      await processFile(file.id);
    }

    alert(`✅ Processed ${pdfFiles.length} file(s)`);
    fetchProject();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-700';
      case 'PROCESSING': return 'bg-blue-100 text-blue-700';
      case 'READY': return 'bg-green-100 text-green-700';
      case 'SENT': return 'bg-purple-100 text-purple-700';
      case 'WON': return 'bg-emerald-100 text-emerald-700';
      case 'LOST': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return null;
  }

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
                  {project.name}
                </h1>
                <p className="text-xs text-slate-500">
                  {project.clientName} {project.location && `· ${project.location}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 text-sm font-medium rounded ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
              <button
                onClick={() => router.push('/projects')}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                ← Back to Projects
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('files')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'files'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📄 Files ({project.files.length})
            </button>
            <button
              onClick={() => setActiveTab('quantities')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'quantities'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📊 Quantities ({project.quantities.length})
            </button>
            <button
              onClick={() => setActiveTab('estimate')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'estimate'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💰 Estimate ({project.lineItems.length} items)
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'files' && (
            <div>
              {/* Upload Zone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-6 ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-300 bg-white hover:border-slate-400'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📄</span>
                  </div>
                  {isDragActive ? (
                    <p className="text-slate-700">Drop files here...</p>
                  ) : (
                    <>
                      <p className="text-slate-700">
                        <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-sm text-slate-500">
                        PDF, Excel, Word, Images (up to 50MB each)
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Pending Files */}
              {pendingFiles.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Ready to Upload ({pendingFiles.length})
                  </h3>
                  <div className="space-y-2">
                    {pendingFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">
                            {file.type.includes('pdf') ? '📄' : file.type.includes('image') ? '🖼️' : '📊'}
                          </span>
                          <div>
                            <p className="font-medium text-slate-900">{file.name}</p>
                            <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removePendingFile(index)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={uploadFiles}
                    disabled={uploading}
                    className="mt-4 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : `Upload ${pendingFiles.length} File${pendingFiles.length > 1 ? 's' : ''}`}
                  </button>
                </div>
              )}

              {/* Uploaded Files */}
              {project.files.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Uploaded Files ({project.files.length})
                    </h3>
                    <button
                      onClick={processAllFiles}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                    >
                      🤖 Process All PDFs
                    </button>
                  </div>
                  <div className="space-y-2">
                    {project.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">
                            {file.type.includes('pdf') ? '📄' : file.type.includes('image') ? '🖼️' : '📊'}
                          </span>
                          <div>
                            <p className="font-medium text-slate-900">{file.name}</p>
                            <p className="text-sm text-slate-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB · {file.category} · {new Date(file.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View
                          </a>
                          {file.type === 'application/pdf' && !file.processed && (
                            <button
                              onClick={() => processFile(file.id)}
                              className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200"
                            >
                              Process
                            </button>
                          )}
                          {file.processed && (
                            <span className="text-green-600 text-sm">✓ Processed</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No files uploaded yet
                </div>
              )}
            </div>
          )}

          {activeTab === 'quantities' && (
            <QuantitiesTab
              projectId={projectId}
              quantities={project.quantities}
              onRefresh={fetchProject}
            />
          )}

          {activeTab === 'estimate' && (
            <EstimateTab
              projectId={projectId}
              lineItems={project.lineItems}
              project={project}
              onRefresh={fetchProject}
            />
          )}
        </div>
      </main>
    </div>
  );
}
