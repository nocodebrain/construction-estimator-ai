'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  name: string;
  description?: string;
  location?: string;
  clientName?: string;
  status: string;
  totalCost?: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    files: number;
    quantities: number;
    lineItems: number;
  };
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    location: '',
    clientName: '',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProject.name) {
      alert('Project name is required');
      return;
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });

      const data = await response.json();

      if (data.success) {
        // Navigate to project detail page
        router.push(`/projects/${data.project.id}`);
      } else {
        alert('Failed to create project');
      }
    } catch (error) {
      console.error('Create project error:', error);
      alert('Failed to create project');
    }
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
                <p className="text-xs text-slate-500">Projects Dashboard</p>
              </div>
            </div>
            <a href="/" className="text-sm text-slate-600 hover:text-slate-900">
              ← Back to Home
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Projects</h2>
              <p className="text-slate-600 mt-1">
                Manage your construction estimates
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              + New Project
            </button>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📁</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No projects yet
              </h3>
              <p className="text-slate-600 mb-6">
                Create your first project to start estimating
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {project.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>

                  {project.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {(project.location || project.clientName) && (
                    <div className="text-sm text-slate-500 mb-4 space-y-1">
                      {project.clientName && (
                        <p>👤 {project.clientName}</p>
                      )}
                      {project.location && (
                        <p>📍 {project.location}</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-slate-500 border-t border-slate-100 pt-4">
                    <span>📄 {project._count.files} files</span>
                    <span>📊 {project._count.lineItems} items</span>
                  </div>

                  {project.totalCost && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-2xl font-bold text-blue-600">
                        ${project.totalCost.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">Estimated cost</p>
                    </div>
                  )}

                  <p className="text-xs text-slate-400 mt-4">
                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              Create New Project
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Office Fitout - Level 3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief project description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={newProject.location}
                  onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Sydney, NSW"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Client Name
                </label>
                <input
                  type="text"
                  value={newProject.clientName}
                  onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., ABC Construction"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
