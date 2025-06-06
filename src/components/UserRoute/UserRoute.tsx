import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface UserRouteProps {
  children: React.ReactNode;
}

const UserRoute = ({ children }: UserRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default UserRoute;
