import React from 'react';
import { Menu, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onOpenTaskModal, mobileOpen, setMobileOpen }) => {
  const { user } = useAuth();

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
      </div>
    </header>
  );
};
