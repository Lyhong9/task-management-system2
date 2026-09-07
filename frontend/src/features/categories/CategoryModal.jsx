import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';

export const CategoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false
}) => {
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
    } else {
      setName('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!name.trim()) {
      setErrors({ name: 'Category name is required' });
      return;
    }

    try {
      await onSubmit({ name: name.trim() });
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
      title={initialData ? 'Edit Category' : 'Create New Category'}
      maxWidth={440}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="cat-name">
            Category Name <span style={{ color: '#f87171' }}>*</span>
          </label>
          <input
            id="cat-name"
            type="text"
            className="form-control"
            placeholder="e.g. Infrastructure, Marketing"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          {errors.name && <span className="form-error-text">{errors.name}</span>}
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
            {isLoading ? 'Saving...' : initialData ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
