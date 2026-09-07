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

  if (loading) {
    return <LoadingSpinner text="Loading your categories with TanStack Query..." />;
  }

  if (error) {
    return <ErrorState message={error.message || 'Unable to load categories'} onRetry={refetch} />;
  }

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
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Categories</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '14px' }}>
            Organize tasks into structured projects and groups
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          <span>New Category</span>
        </button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No categories found"
          description="Create categories like 'Work', 'Personal', or 'Design' to organize your tasks better."
          action={
            <button
              type="button"
              className="btn btn-primary"
              onClick={openCreateModal}
            >
              <Plus size={16} /> Create Category
            </button>
          }
        />
      ) : (
        <div className="category-grid">
          {categories.map((cat) => (
            <div key={cat.id} className="card card-hover category-card">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(99, 102, 241, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-400)'
                  }}
                >
                  <FolderTree size={20} />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => openEditModal(cat)}
                    title="Edit category"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn-icon text-danger"
                    onClick={() => setDeletingCategory(cat)}
                    title="Delete category"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: 8 }}>
                {cat.name}
              </h3>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '13px',
                  color: 'var(--text-muted)'
                }}
              >
                <CheckSquare size={14} />
                <span>ID: #{cat.id}</span>
                <span>•</span>
                <span>
                  {new Date(cat.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
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
        message={`Are you sure you want to delete the category "${deletingCategory?.name}"? Any tasks linked to it will become unassigned.`}
        confirmText="Delete Category"
        isDanger={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};
