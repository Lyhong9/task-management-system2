import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  Edit2,
  Trash2,
  Filter,
  ArrowUpDown,
  FolderX
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { SkeletonList, EmptyState, ErrorState } from '../components/States';
import { TaskModal } from '../features/tasks/TaskModal';
import { ConfirmModal } from '../components/ConfirmModal';

export const Tasks = () => {
  const { showToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting state
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories once
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.getCategories();
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  // Fetch tasks with query parameters
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    let sortBy = 'createdAt';
    let order = 'DESC';

    if (sortOption === 'oldest') {
      sortBy = 'createdAt';
      order = 'ASC';
    } else if (sortOption === 'az') {
      sortBy = 'title';
      order = 'ASC';
    } else if (sortOption === 'za') {
      sortBy = 'title';
      order = 'DESC';
    }

    try {
      const res = await api.getTasks({
        status: statusFilter,
        categoryId: categoryFilter,
        sortBy,
        order,
        search: searchQuery
      });

      if (res.success) {
        setTasks(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError(err.message || 'Unable to load tasks');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, sortOption, searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Toggle complete / pending
  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const res = await api.updateTask(task.id, { status: newStatus });
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? res.data : t))
        );
        showToast(
          newStatus === 'COMPLETED' ? 'Task marked as completed' : 'Task marked as pending',
          'success'
        );
      }
    } catch (err) {
      showToast(err.message || 'Failed to update task status', 'error');
    }
  };

  // Create or Update task
  const handleSaveTask = async (taskData) => {
    setIsSubmitting(true);
    try {
      if (editingTask) {
        const res = await api.updateTask(editingTask.id, taskData);
        if (res.success) {
          setTasks((prev) =>
            prev.map((t) => (t.id === editingTask.id ? res.data : t))
          );
          showToast('Task updated successfully', 'success');
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }
      } else {
        const res = await api.createTask(taskData);
        if (res.success) {
          setTasks((prev) => [res.data, ...prev]);
          showToast('Task created successfully', 'success');
          setIsTaskModalOpen(false);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to save task', 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete task
  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    setIsSubmitting(true);
    try {
      const res = await api.deleteTask(deletingTask.id);
      if (res.success) {
        setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id));
        showToast('Task deleted successfully', 'success');
        setDeletingTask(null);
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete task', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24
        }}
      >
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800 }}>Tasks</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '14px' }}>
            Manage, organize, and track your daily activities
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={openCreateModal}
          id="btn-new-task"
        >
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="toolbar">
        {/* Search Input */}
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="task-search-input"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          {/* Status Filter Pills */}
          <div className="filter-pills" role="tablist" aria-label="Filter by status">
            {['ALL', 'PENDING', 'COMPLETED'].map((status) => (
              <button
                key={status}
                type="button"
                className={`filter-pill ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
                id={`filter-pill-${status.toLowerCase()}`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Category Filter Dropdown */}
          <select
            className="select-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            id="category-filter-select"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
            <option value="unassigned">Unassigned</option>
          </select>

          {/* Sort Dropdown */}
          <select
            className="select-control"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            id="sort-select"
            aria-label="Sort tasks"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="az">Title (A-Z)</option>
            <option value="za">Title (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Task List Content */}
      {loading ? (
        <SkeletonList count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTasks} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={FolderX}
          title={searchQuery || statusFilter !== 'ALL' || categoryFilter ? 'No matching tasks found' : 'No tasks yet'}
          description={
            searchQuery || statusFilter !== 'ALL' || categoryFilter
              ? 'Try adjusting your filters or search terms to find what you are looking for.'
              : 'Create your first task to start organizing your workflow.'
          }
          actionText={
            searchQuery || statusFilter !== 'ALL' || categoryFilter
              ? 'Reset Filters'
              : 'Create Task'
          }
          onAction={
            searchQuery || statusFilter !== 'ALL' || categoryFilter
              ? () => {
                  setStatusFilter('ALL');
                  setCategoryFilter('');
                  setSearchQuery('');
                }
              : openCreateModal
          }
        />
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`task-item ${task.status === 'COMPLETED' ? 'completed' : ''}`}
              id={`task-item-${task.id}`}
            >
              <button
                type="button"
                className={`task-checkbox-btn ${
                  task.status === 'COMPLETED' ? 'checked' : ''
                }`}
                onClick={() => handleToggleStatus(task)}
                aria-label={
                  task.status === 'COMPLETED' ? 'Mark as pending' : 'Mark as completed'
                }
              >
                <CheckCircle2 size={22} />
              </button>

              <div className="task-body">
                <div className="task-header-row">
                  <h3 className="task-title">{task.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      className={`badge ${
                        task.status === 'COMPLETED'
                          ? 'badge-completed'
                          : 'badge-pending'
                      }`}
                    >
                      {task.status}
                    </span>
                    <div className="task-actions">
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => openEditModal(task)}
                        title="Edit task"
                        aria-label="Edit task"
                        id={`btn-edit-task-${task.id}`}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => setDeletingTask(task)}
                        title="Delete task"
                        aria-label="Delete task"
                        style={{ color: '#f87171' }}
                        id={`btn-delete-task-${task.id}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}

                <div className="task-meta-row">
                  {task.category && (
                    <span className="badge badge-category">{task.category.name}</span>
                  )}
                  <span>
                    Created:{' '}
                    {new Date(task.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
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

      {/* Task Add / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        initialData={editingTask}
        categories={categories}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        isLoading={isSubmitting}
      />
    </div>
  );
};
