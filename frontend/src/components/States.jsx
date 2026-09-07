import React from 'react';
import { AlertTriangle, RefreshCw, FolderX } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p style={{ fontSize: '14px', fontWeight: 500 }}>{text}</p>
    </div>
  );
};

export const SkeletonList = ({ count = 3 }) => {
  return (
    <div className="task-list">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="task-item"
          style={{
            opacity: 0.5,
            animation: 'pulse 1.5s infinite ease-in-out'
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.1)'
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                width: '45%',
                height: 18,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.1)',
                marginBottom: 10
              }}
            />
            <div
              style={{
                width: '80%',
                height: 14,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.06)',
                marginBottom: 10
              }}
            />
            <div
              style={{
                width: '25%',
                height: 12,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.05)'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export const EmptyState = ({
  icon: Icon = FolderX,
  title = 'No tasks found',
  description = 'Create your first task to get started.',
  actionText,
  onAction
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={28} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionText && onAction && (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'Unable to load data. Please try again.',
  onRetry
}) => {
  return (
    <div className="error-state-card">
      <AlertTriangle size={36} color="#ef4444" />
      <div>
        <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#f87171' }}>
          {title}
        </h4>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: 4 }}>
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onRetry}
          style={{ marginTop: 8 }}
        >
          <RefreshCw size={15} /> Try Again
        </button>
      )}
    </div>
  );
};
