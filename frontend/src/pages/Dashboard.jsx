import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  FolderTree,
  Plus,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner, ErrorState } from '../components/States';
import { TaskModal } from '../features/tasks/TaskModal';
import { useTasksQuery, useCreateTaskMutation, useUpdateTaskMutation } from '../hooks/useTasksQuery';
import { useCategoriesQuery } from '../hooks/useCategoriesQuery';

export const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // TanStack Queries
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks
  } = useTasksQuery({ sortBy: 'createdAt', order: 'DESC' });

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories
  } = useCategoriesQuery();

  // TanStack Mutations
  const updateTaskMutation = useUpdateTaskMutation();
  const createTaskMutation = useCreateTaskMutation();

  const loading = tasksLoading || categoriesLoading;
  const error = tasksError || categoriesError;

  // Compute metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const pendingTasks = tasks.filter((t) => t.status === 'PENDING').length;
  const totalCategories = categories.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await updateTaskMutation.mutateAsync({ id: task.id, status: newStatus });
      showToast(
        newStatus === 'COMPLETED' ? 'Task marked completed!' : 'Task set to pending',
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Failed to update task status', 'error');
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await createTaskMutation.mutateAsync(taskData);
      showToast('Task created successfully!', 'success');
      setIsTaskModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to create task', 'error');
      throw err;
    }
  };

  const handleRetry = () => {
    refetchTasks();
    refetchCategories();
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard metrics with TanStack Query..." />;
  }

  if (error) {
    return <ErrorState message={error.message || 'Failed to load dashboard data'} onRetry={handleRetry} />;
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 32
        }}
      >
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800 }}>
            Hello, {user?.name} 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '14.5px' }}>
            Here is your task overview and progress summary for today.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsTaskModalOpen(true)}
        >
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="card stat-card card-hover">
          <div className="stat-icon-wrapper stat-icon-primary">
            <CheckSquare size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Tasks</span>
            <span className="stat-value">{totalTasks}</span>
          </div>
        </div>

        <div className="card stat-card card-hover">
          <div className="stat-icon-wrapper stat-icon-warning">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending Tasks</span>
            <span className="stat-value">{pendingTasks}</span>
          </div>
        </div>

        <div className="card stat-card card-hover">
          <div className="stat-icon-wrapper stat-icon-success">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Completed Tasks</span>
            <span className="stat-value">{completedTasks}</span>
          </div>
        </div>

        <div className="card stat-card card-hover">
          <div className="stat-icon-wrapper stat-icon-cyan">
            <FolderTree size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Categories</span>
            <span className="stat-value">{totalCategories}</span>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className="card" style={{ marginBottom: 32, padding: 26 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TrendingUp size={20} color="#818cf8" />
            <h3 style={{ fontSize: '16px' }}>Overall Productivity</h3>
          </div>
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#34d399' }}>
            {completionRate}% Completed
          </span>
        </div>

        <div
          style={{
            width: '100%',
            height: 10,
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${completionRate}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </div>
      </div>

      {/* Recent Tasks Section */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20
          }}
        >
          <div>
            <h3 style={{ fontSize: '18px' }}>Recent Tasks</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 2 }}>
              Your latest action items
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate('/tasks')}
            style={{ fontSize: '13px', gap: 6 }}
          >
            View All Tasks <ArrowRight size={15} />
          </button>
        </div>

        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
              No tasks yet. Create your first task to get started!
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsTaskModalOpen(true)}
            >
              <Plus size={16} /> Create Task
            </button>
          </div>
        ) : (
          <div className="task-list">
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className={`task-item ${task.status === 'COMPLETED' ? 'completed' : ''}`}
                style={{ padding: '14px 18px' }}
              >
                <button
                  type="button"
                  className={`task-checkbox-btn ${task.status === 'COMPLETED' ? 'checked' : ''}`}
                  onClick={() => handleToggleStatus(task)}
                  disabled={updateTaskMutation.isPending}
                  aria-label={task.status === 'COMPLETED' ? 'Mark pending' : 'Mark completed'}
                >
                  <CheckCircle2 size={20} />
                </button>
                <div className="task-body">
                  <div className="task-header-row">
                    <span className="task-title">{task.title}</span>
                    <span
                      className={`badge ${
                        task.status === 'COMPLETED' ? 'badge-completed' : 'badge-pending'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                  {task.description && (
                    <p
                      className="task-description"
                      style={{
                        marginBottom: 6,
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {task.description}
                    </p>
                  )}
                  <div className="task-meta-row">
                    {task.category && (
                      <span className="badge badge-category">{task.category.name}</span>
                    )}
                    <span>
                      {new Date(task.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        categories={categories}
        isLoading={createTaskMutation.isPending}
      />
    </div>
  );
};
