import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Plus, Users, LayoutList } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  description: string;
  creator: { name: string };
  _count: { members: number, tasks: number };
}

const Projects: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setShowModal(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (error) {
      console.error('Failed to create project', error);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl m-0 mb-2">Projects</h1>
          <p className="m-0">Manage your teams and projects.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="glass-card text-center py-12 text-[var(--text-secondary)]">
          No projects found. {user?.role === 'ADMIN' ? 'Create one to get started.' : 'Wait for an admin to add you to a project.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link to={`/projects/${project.id}`} key={project.id} style={{ textDecoration: 'none' }}>
              <div className="glass-card h-full flex flex-col">
                <h3 className="text-xl mb-2 text-[var(--text-primary)]">{project.name}</h3>
                <p className="text-sm flex-1 mb-6 line-clamp-2">
                  {project.description || 'No description provided.'}
                </p>
                
                <div className="flex items-center justify-between text-sm pt-4 border-t border-[var(--surface-border)]">
                  <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                    <Users size={16} />
                    <span>{project._count.members} Members</span>
                  </div>
                  <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                    <LayoutList size={16} />
                    <span>{project._count.tasks} Tasks</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <h2 className="mb-6">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="input-group">
                <label>Project Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={newProject.name}
                  onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                  required
                  placeholder="e.g. Website Redesign"
                />
              </div>
              <div className="input-group mb-6">
                <label>Description</label>
                <textarea
                  className="input-field"
                  value={newProject.description}
                  onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                  rows={3}
                  placeholder="What is this project about?"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
