import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, FolderKanban } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <nav className="navbar glass">
        <div className="navbar-container">
          <Link to="/" className="nav-brand flex items-center gap-2">
            <FolderKanban size={24} />
            TaskFlow
          </Link>
          
          <div className="nav-links">
            {user ? (
              <>
                <Link to="/" className="nav-link flex items-center gap-2">
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <Link to="/projects" className="nav-link flex items-center gap-2">
                  <FolderKanban size={18} />
                  Projects
                </Link>
                <div className="flex items-center gap-4 ml-4 pl-4" style={{ borderLeft: '1px solid var(--surface-border)' }}>
                  <div className="text-sm">
                    <div className="font-semibold">{user.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{user.role}</div>
                  </div>
                  <button onClick={handleLogout} className="btn btn-secondary flex items-center gap-2" style={{ padding: '0.5rem 1rem' }}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content container">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
