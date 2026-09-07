import React, { useState } from 'react';
import { Plus, FolderTree, Edit2, Trash2, CheckSquare } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner, EmptyState, ErrorState } from '../components/States';
import { CategoryModal } from '../features/categories/CategoryModal';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation
} from '../hooks/useCategoriesQuery';

export const Categories = () => {
  const { showToast } = useToast();

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  // TanStack Queries & Mutations
  const { data: categories = [], isLoading: loading, error, refetch } = useCategoriesQuery();
  const createCategoryMutation = useCreateCategoryMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();

  const isSubmitting =
    createCategoryMutation.isPending ||
    updateCategoryMutation.isPending ||
    deleteCategoryMutation.isPending;

  // Create or Update category
  const handleSaveCategory = async (data) => {
    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          ...data
        });
        showToast('Category updated successfully', 'success');
      } else {
        await createCategoryMutation.mutateAsync(data);
        showToast('Category created successfully', 'success');
      }
      setIsModalOpen(false);
      setEditingCategory(null);
    } catch (err) {
      showToast(err.message || 'Failed to save category', 'error');
      throw err;
    }
  };

  // Delete category
  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      await deleteCategoryMutation.mutateAsync(deletingCategory.id);
      showToast('Category deleted successfully', 'success');
      setDeletingCategory(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete category', 'error');
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
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
          marginBottom: 32
        }}
      >
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800 }}>Categories</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '14px' }}>
            Organize and classify tasks by departments or project areas
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={openCreateModal}
          id="btn-new-category"
        >
          <Plus size={18} />
          <span>New Category</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading categories..." />
      ) : error ? (
        <ErrorState message={error.message || 'Unable to load categories'} onRetry={refetch} />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No categories found"
          description="Create categories like 'Work', 'Personal', or 'Design' to better organize your tasks."
          actionText="Create Category"
          onAction={openCreateModal}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20
          }}
        >
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="card card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '150px'
              }}
              id={`category-card-${cat.id}`}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#818cf8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FolderTree size={20} />
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{cat.name}</h3>
                  </div>

                  <div className="task-actions">
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => openEditModal(cat)}
                      title="Edit category"
                      aria-label="Edit category"
                      id={`btn-edit-category-${cat.id}`}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => setDeletingCategory(cat)}
                      title="Delete category"
                      aria-label="Delete category"
                      style={{ color: '#f87171' }}
                      id={`btn-delete-category-${cat.id}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: 14,
                  marginTop: 18,
                  fontSize: '13px',
                  color: 'var(--text-secondary)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckSquare size={16} color="#818cf8" />
                  <span>
                    <strong>{cat.taskCount !== undefined ? cat.taskCount : 0}</strong>{' '}
                    {cat.taskCount === 1 ? 'Task' : 'Tasks'}
                  </span>
                </div>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  {new Date(cat.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleSaveCategory}
        initialData={editingCategory}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deletingCategory?.name}"? Tasks assigned to this category will become unassigned.`}
        confirmText="Delete Category"
        isLoading={isSubmitting}
      />
    </div>
  );
};
