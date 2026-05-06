import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CheckCircle, Clock, AlertTriangle, ListTodo } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardData {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  doneTasks: number;
  overdueTasks: number;
  recentTasks: any[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard');
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="text-center py-12 text-[var(--danger)]">Failed to load dashboard</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl">Welcome, {user?.name}</h1>
        <p>Here is an overview of your tasks and progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-[var(--text-secondary)] m-0">Total Tasks</h3>
            <div className="p-2 rounded bg-[rgba(79,70,229,0.1)] text-[var(--primary)]">
              <ListTodo size={24} />
            </div>
          </div>
          <div className="text-4xl font-bold">{data.totalTasks}</div>
        </div>

        <div className="glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-[var(--text-secondary)] m-0">In Progress</h3>
            <div className="p-2 rounded bg-[rgba(245,158,11,0.1)] text-[var(--warning)]">
              <Clock size={24} />
            </div>
          </div>
          <div className="text-4xl font-bold">{data.inProgressTasks}</div>
        </div>

        <div className="glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-[var(--text-secondary)] m-0">Completed</h3>
            <div className="p-2 rounded bg-[rgba(16,185,129,0.1)] text-[var(--secondary)]">
              <CheckCircle size={24} />
            </div>
          </div>
          <div className="text-4xl font-bold">{data.doneTasks}</div>
        </div>

        <div className="glass-card" style={{ borderColor: data.overdueTasks > 0 ? 'var(--danger)' : '' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-[var(--text-secondary)] m-0">Overdue</h3>
            <div className="p-2 rounded bg-[rgba(239,68,68,0.1)] text-[var(--danger)]">
              <AlertTriangle size={24} />
            </div>
          </div>
          <div className="text-4xl font-bold" style={{ color: data.overdueTasks > 0 ? 'var(--danger)' : '' }}>
            {data.overdueTasks}
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="m-0">Your Recent Tasks</h2>
          <Link to="/projects" className="btn btn-secondary text-sm" style={{ padding: '0.5rem 1rem' }}>
            View Projects
          </Link>
        </div>

        {data.recentTasks.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-secondary)]">
            You don't have any assigned tasks yet.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {data.recentTasks.map(task => (
              <div key={task.id} className="p-4 rounded bg-[rgba(15,23,42,0.4)] border border-[var(--surface-border)] flex justify-between items-center transition-all hover:bg-[rgba(15,23,42,0.6)]">
                <div>
                  <h4 className="font-medium m-0 mb-1">{task.title}</h4>
                  <div className="text-sm text-[var(--text-secondary)]">
                    Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                  </div>
                </div>
                <div>
                  <span className={`badge badge-${task.status.toLowerCase().replace('_', '-')}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
