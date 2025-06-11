import { Navigate, useLocation, Outlet } from "react-router-dom";
import { ProgressIndicator } from "../../";
import type { AuthContextType } from "../../../types";
import { useUserStore } from "../../../store/useUserStore";

const UserRoute = () => {
  const { profile, user, loading } = useUserStore();
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
  } else if (!profile) {
    return <div>Could not load your user profile</div>;
  } else {
    const context: AuthContextType = {
      user,
      profile,
    };
    return <Outlet context={context} />;
  }
};

export default UserRoute;
