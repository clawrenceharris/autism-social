import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ProgressIndicator from "../ProgressIndicator";

interface UserRouteProps {
  children: React.ReactNode;
}

const UserRoute = ({ children }: UserRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="center-absolute">
        <ProgressIndicator />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default UserRoute;
