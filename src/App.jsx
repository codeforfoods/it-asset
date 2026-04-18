import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import EquipmentsPage from './pages/Equipments';
import DictionaryAdmin from './pages/DictionaryAdmin';
import UsersAdmin from './pages/UsersAdmin';
import Login from './pages/Login';
import { useAuthStore } from './store/authStore';

function ProtectedRoute({ children, allowedRoles }) {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="equipments" element={<EquipmentsPage />} />
            <Route path="settings" element={<ProtectedRoute allowedRoles={['Admin']}><DictionaryAdmin /></ProtectedRoute>} />
            <Route path="users" element={<ProtectedRoute allowedRoles={['Admin']}><UsersAdmin /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
