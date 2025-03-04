import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { checkToken } from "../../features/auth/authSlice";

export default function PrivateRoute({ children }) {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !hasChecked) {
      dispatch(checkToken());
      setHasChecked(true);
    }
  }, [dispatch, isAuthenticated, hasChecked]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}
