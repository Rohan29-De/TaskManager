import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Plus } from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  description: string;
  admin: { _id: string; name: string };
  members: { _id: string; name: string }[];
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', { name: newProjectName, description: newProjectDesc });
      setShowModal(false);
      setNewProjectName('');
      setNewProjectDesc('');
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-1" /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map(project => (
          <Link
            key={project._id}
            to={`/projects/${project._id}`}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 truncate">{project.name}</h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{project.description || 'No description'}</p>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>{project.members.length} members</span>
                <span className="text-indigo-600">Admin: {project.admin.name}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Project Name</label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newProjectDesc}
                  onChange={e => setNewProjectDesc(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
