import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { TASKS_QUERY_KEY } from './useTasksQuery';

export const CATEGORIES_QUERY_KEY = ['categories'];

/**
 * Fetch all categories for the authenticated user.
 */
export const useCategoriesQuery = (options = {}) => {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const res = await api.getCategories();
      return res.data || [];
    },
    ...options
  });
};

/**
 * Hook to create a category with automatic cache invalidation.
 */
export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryData) => api.createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    }
  });
};

/**
 * Hook to update a category with automatic cache invalidation for both categories and tasks.
 */
export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...categoryData }) => api.updateCategory(id, categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    }
  });
};

/**
 * Hook to delete a category with automatic cache invalidation for both categories and tasks.
 */
export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    }
  });
};
