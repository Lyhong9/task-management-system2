import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle = ({ className = '', style = {} }) => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`theme-toggle-btn ${className}`}
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={style}
      id="theme-toggle-button"
    >
      <div className="theme-toggle-inner">
        {isDark ? (
          <Sun size={18} className="theme-icon sun-icon" />
        ) : (
          <Moon size={18} className="theme-icon moon-icon" />
        )}
      </div>
    </button>
  );
};
