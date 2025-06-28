import { Navigate, useLocation, Outlet } from "react-router-dom";
import { ProgressIndicator } from "../../";
import { useAuth } from "../../../context";
import type { UserProfile } from "../../../types";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  profile: UserProfile;
  user: User;
}
const UserRoute = () => {
  const { profile, user, loading } = useAuth();
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
    return (
      <div>
        <h1>Oops...</h1>
        <p>We were unable to load your user data</p>
      </div>
    );
  } else {
    const context: AuthContextType = {
      user,
      profile,
    };
    return <Outlet context={context} />;
  }
};

export { UserRoute, type AuthContextType };
