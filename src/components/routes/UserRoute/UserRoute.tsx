import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { ProgressIndicator } from "../../";
import { useUser } from "../../../context";
import type { AuthContextType } from "../../../types";

const UserRoute = () => {
  const { user, loading: loadingAuth } = useAuth();
  const { profile, loading: loadingUser } = useUser();
  const location = useLocation();

  if (loadingAuth || loadingUser) {
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
