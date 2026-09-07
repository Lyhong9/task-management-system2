import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';

export const TaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  categories = [],
  isLoading = false
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [categoryId, setCategoryId] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setStatus(initialData.status || 'PENDING');
      setCategoryId(initialData.categoryId || '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('PENDING');
      setCategoryId('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        status,
        categoryId: categoryId || null
      });
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Task' : 'Create New Task'}
    >
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="form-group">
          <label className="form-label" htmlFor="task-title">
            Task Title <span style={{ color: '#f87171' }}>*</span>
          </label>
          <input
            id="task-title"
            type="text"
            className="form-control"
            placeholder="e.g. Design authentication workflow"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
          {errors.title && <span className="form-error-text">{errors.title}</span>}
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="task-description">
            Description
          </label>
          <textarea
            id="task-description"
            className="form-control"
            rows={3}
            placeholder="Add any additional details or notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {errors.description && (
            <span className="form-error-text">{errors.description}</span>
          )}
        </div>

        {/* Category & Status Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Category */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-category">Category</label>
            <select
              id="task-category"
              className="form-control"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">No Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <span className="form-error-text">{errors.categoryId}</span>
            )}
          </div>

          {/* Status */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-status">Status</label>
            <select
              id="task-status"
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="PENDING">PENDING</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
            {errors.status && <span className="form-error-text">{errors.status}</span>}
          </div>
        </div>

        <div className="modal-footer" style={{ margin: '16px -24px -24px -24px' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
