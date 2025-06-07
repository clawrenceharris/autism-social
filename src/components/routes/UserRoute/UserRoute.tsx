import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {ProgressIndicator, UserLayout} from "../../";

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

  return <UserLayout> <Outlet/> </UserLayout>;
};

export default UserRoute;
