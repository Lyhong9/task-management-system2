import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const TASKS_QUERY_KEY = ['tasks'];

/**
 * Fetch tasks with optional filtering, sorting, and search query parameters.
 */
export const useTasksQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [...TASKS_QUERY_KEY, params],
    queryFn: async () => {
      const res = await api.getTasks(params);
      return res.data || [];
    },
    ...options
  });
};

/**
 * Hook to create a new task with automatic cache invalidation.
 */
export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskData) => api.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    }
  });
};

/**
 * Hook to update a task (e.g. status toggle or edit details) with automatic cache invalidation.
 */
export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...taskData }) => api.updateTask(id, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    }
  });
};

/**
 * Hook to delete a task with automatic cache invalidation.
 */
export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    }
  });
};
