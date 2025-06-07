import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { ProgressIndicator } from "../../";

const UserRoute = () => {
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

  return <Outlet />;
};

export default UserRoute;
