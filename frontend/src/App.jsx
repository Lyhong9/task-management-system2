import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ProtectedRoute, PublicRoute } from './routes/Guards';
import { AppLayout } from './layouts/AppLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Categories } from './pages/Categories';
import { TaskModal } from './features/tasks/TaskModal';
import { api } from './services/api';

function AppContent() {
  const [globalTaskModalOpen, setGlobalTaskModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Load categories for global new task modal
  const loadCategories = async () => {
    try {
      const res = await api.getCategories();
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (e) {
      // Ignored if not logged in
    }
  };

  const handleOpenCreateTask = () => {
    loadCategories();
    setGlobalTaskModalOpen(true);
  };

  const handleGlobalCreateTask = async (taskData) => {
    setIsSubmitting(true);
    try {
      const res = await api.createTask(taskData);
      if (res.success) {
        showToast('Task created successfully!', 'success');
        setGlobalTaskModalOpen(false);
        navigate('/tasks');
      }
    } catch (err) {
      showToast(err.message || 'Failed to create task', 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout onOpenCreateTask={handleOpenCreateTask} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="categories" element={<Categories />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Quick Add Task Modal */}
      <TaskModal
        isOpen={globalTaskModalOpen}
        onClose={() => setGlobalTaskModalOpen(false)}
        onSubmit={handleGlobalCreateTask}
        categories={categories}
        isLoading={isSubmitting}
      />
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
