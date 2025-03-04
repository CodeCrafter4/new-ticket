import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import UserDashboard from "./components/dashboard/UserDashboard";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import MainLayout from "./components/layout/MainLayout";
import PrivateRoute from "./components/routing/PrivateRoute";
import AdminRoute from "./components/routing/AdminRoute";
import UsersList from "./components/admin/UsersList";
import Tickets from "./components/tickets/Tickets";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkToken } from "./features/auth/authSlice";

// Wrapper component to handle token checking
function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // Check token when app loads
    const token = localStorage.getItem("token");
    if (token && !isAuthenticated) {
      dispatch(checkToken());
    }
  }, [dispatch, isAuthenticated]);

  // Show loading spinner only during initial load and not authenticated
  if (loading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes with layout */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <MainLayout>
              <UserDashboard />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <MainLayout>
              <AdminDashboard />
            </MainLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <MainLayout>
              <UsersList />
            </MainLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <PrivateRoute>
            <MainLayout>
              <Tickets />
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* Redirect root to appropriate dashboard or login */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
