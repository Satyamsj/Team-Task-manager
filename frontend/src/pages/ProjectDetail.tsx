import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Plus, UserPlus } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate: string;
  assignee?: { name: string };
}

interface Member {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

interface Project {
  id: number;
  name: string;
  description: string;
  members: Member[];
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'TODO', dueDate: '', assigneeId: '' });
  const [newMemberEmail, setNewMemberEmail] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...newTask, projectId: parseInt(id!) };
      if (payload.assigneeId) payload.assigneeId = parseInt(payload.assigneeId);
      else delete payload.assigneeId;
      
      await api.post('/tasks', payload);
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', status: 'TODO', dueDate: '', assigneeId: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { email: newMemberEmail });
      setShowMemberModal(false);
      setNewMemberEmail('');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to add member');
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  if (loading) return <div className="flex justify-center py-12">Loading project details...</div>;
  if (!project) return <div className="text-center py-12 text-[var(--danger)]">Project not found</div>;

  const renderColumn = (status: 'TODO' | 'IN_PROGRESS' | 'DONE', title: string) => {
    const columnTasks = tasks.filter(t => t.status === status);
    
    return (
      <div className="kanban-column">
        <div className="kanban-column-header">
          <span>{title}</span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{columnTasks.length}</span>
        </div>
        
        {columnTasks.map(task => (
          <div key={task.id} className="task-card">
            <h4 className="m-0 mb-2">{task.title}</h4>
            {task.description && <p className="text-xs mb-3 line-clamp-2">{task.description}</p>}
            
            <div className="flex justify-between items-center mt-4 text-xs">
              <div className="text-[var(--text-secondary)]">
                {task.assignee ? task.assignee.name : 'Unassigned'}
              </div>
              <select 
                className="bg-transparent border border-[var(--surface-border)] rounded text-[var(--text-primary)] p-1 outline-none"
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
              >
                <option value="TODO" style={{background: 'var(--background)'}}>To Do</option>
                <option value="IN_PROGRESS" style={{background: 'var(--background)'}}>In Progress</option>
                <option value="DONE" style={{background: 'var(--background)'}}>Done</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-100px)]">
      <div className="flex justify-between items-start mb-6 shrink-0">
        <div>
          <h1 className="text-3xl m-0 mb-2">{project.name}</h1>
          <p className="m-0">{project.description}</p>
          <div className="flex gap-2 mt-3">
            {project.members.map(m => (
              <div key={m.user.id} className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-sm font-bold border-2 border-[var(--background)]" title={m.user.name}>
                {m.user.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-3">
          {user?.role === 'ADMIN' && (
            <button className="btn btn-secondary" onClick={() => setShowMemberModal(true)}>
              <UserPlus size={18} />
              Add Member
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
            <Plus size={18} />
            New Task
          </button>
        </div>
      </div>

      <div className="kanban-board flex-1">
        {renderColumn('TODO', 'To Do')}
        {renderColumn('IN_PROGRESS', 'In Progress')}
        {renderColumn('DONE', 'Done')}
      </div>

      {/* Modals */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <h2 className="mb-6">Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="input-group">
                <label>Task Title</label>
                <input
                  type="text"
                  className="input-field"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea
                  className="input-field"
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="input-group">
                  <label>Assignee</label>
                  <select
                    className="input-field"
                    value={newTask.assigneeId}
                    onChange={e => setNewTask({ ...newTask, assigneeId: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {project.members.map(m => (
                      <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <h2 className="mb-6">Add Team Member</h2>
            <form onSubmit={handleAddMember}>
              <div className="input-group mb-6">
                <label>User Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  value={newMemberEmail}
                  onChange={e => setNewMemberEmail(e.target.value)}
                  required
                  placeholder="user@example.com"
                />
                <p className="text-xs mt-1 text-[var(--text-secondary)]">The user must already have registered an account.</p>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
