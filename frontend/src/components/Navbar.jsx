import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Navbar = ({ onOpenTaskModal, mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/login');
  };

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          type="button"
          className="btn-icon"
          style={{ display: 'flex' }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Welcome back,</span>
          <span style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.name || 'User'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {onOpenTaskModal && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenTaskModal}
            style={{ padding: '8px 14px', fontSize: '13px' }}
          >
            <Plus size={16} />
            <span>New Task</span>
          </button>
        )}

        <div
          style={{
            height: 24,
            width: 1,
            background: 'var(--border-subtle)',
            margin: '0 4px'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="user-avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleLogout}
            style={{ padding: '7px 10px', fontSize: '12.5px', color: '#f87171' }}
            title="Logout"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
