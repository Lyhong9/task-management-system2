import React, { useState } from 'react';
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
import { useToast } from '../context/ToastContext';
import { SkeletonList, EmptyState, ErrorState } from '../components/States';
import { TaskModal } from '../features/tasks/TaskModal';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  useTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation
} from '../hooks/useTasksQuery';
import { useCategoriesQuery } from '../hooks/useCategoriesQuery';

export const Tasks = () => {
  const { showToast } = useToast();

  // Filters & Sorting state
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  // Compute sorting parameters
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

  // TanStack Queries
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks
  } = useTasksQuery({
    status: statusFilter,
    categoryId: categoryFilter,
    sortBy,
    order,
    search: searchQuery
  });

  const { data: categories = [] } = useCategoriesQuery();

  // TanStack Mutations
  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();

  // Toggle complete / pending
  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await updateTaskMutation.mutateAsync({ id: task.id, status: newStatus });
      showToast(
        newStatus === 'COMPLETED' ? 'Task completed! Great job.' : 'Task set to pending.',
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Create or Update task
  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await updateTaskMutation.mutateAsync({
          id: editingTask.id,
          ...taskData
        });
        showToast('Task updated successfully', 'success');
      } else {
        await createTaskMutation.mutateAsync(taskData);
        showToast('Task created successfully', 'success');
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      showToast(err.message || 'Failed to save task', 'error');
      throw err;
    }
  };

  // Delete task
  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    try {
      await deleteTaskMutation.mutateAsync(deletingTask.id);
      showToast('Task deleted successfully', 'success');
      setDeletingTask(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete task', 'error');
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
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 28
        }}
      >
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Tasks</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '14px' }}>
            Manage, organize, and track your daily activities
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ marginBottom: 24, padding: 16 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 220 }}>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: 38 }}
              placeholder="Search tasks by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 10
            }}
          >
            {/* Status Segmented Control */}
            <div
              style={{
                display: 'inline-flex',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: 3,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}
            >
              {[
                { label: 'All', value: 'ALL' },
                { label: 'Pending', value: 'PENDING' },
                { label: 'Completed', value: 'COMPLETED' }
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  style={{
                    padding: '6px 14px',
                    fontSize: '13px',
                    fontWeight: 500,
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: statusFilter === tab.value ? 'var(--primary-600)' : 'transparent',
                    color: statusFilter === tab.value ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: 150, fontSize: '13.5px' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="unassigned">Unassigned</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              className="form-control"
              style={{ width: 'auto', minWidth: 140, fontSize: '13.5px' }}
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="az">Title (A - Z)</option>
              <option value="za">Title (Z - A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List Content */}
      {tasksLoading ? (
        <SkeletonList count={4} />
      ) : tasksError ? (
        <ErrorState message={tasksError.message || 'Failed to load tasks'} onRetry={refetchTasks} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={FolderX}
          title={searchQuery || categoryFilter || statusFilter !== 'ALL' ? 'No matching tasks' : 'No tasks found'}
          description={
            searchQuery || categoryFilter || statusFilter !== 'ALL'
              ? 'Try changing your search keywords or filter criteria.'
              : 'You have not added any tasks yet. Create your first task to start organizing.'
          }
          action={
            <button
              type="button"
              className="btn btn-primary"
              onClick={openCreateModal}
            >
              <Plus size={16} /> Create Task
            </button>
          }
        />
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`task-item ${task.status === 'COMPLETED' ? 'completed' : ''}`}
            >
              <button
                type="button"
                className={`task-checkbox-btn ${task.status === 'COMPLETED' ? 'checked' : ''}`}
                onClick={() => handleToggleStatus(task)}
                disabled={updateTaskMutation.isPending}
                aria-label={task.status === 'COMPLETED' ? 'Mark as pending' : 'Mark as completed'}
              >
                <CheckCircle2 size={22} />
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
                  <p className="task-description">{task.description}</p>
                )}

                <div className="task-meta-row">
                  {task.category ? (
                    <span className="badge badge-category">{task.category.name}</span>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No Category</span>
                  )}
                  <span>
                    Created: {new Date(task.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="task-actions">
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => openEditModal(task)}
                  title="Edit task"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  className="btn-icon text-danger"
                  onClick={() => setDeletingTask(task)}
                  title="Delete task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        initialData={editingTask}
        categories={categories}
        isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        isDanger={true}
        isLoading={deleteTaskMutation.isPending}
      />
    </div>
  );
};
