import { Outlet, useOutletContext } from "react-router-dom";
import { UserHeader } from "../../";
import type { AuthContextType } from "../../../types";

const UserLayout = () => {
  const context = useOutletContext<AuthContextType>();
  return (
    <div>
      <UserHeader />
      <main>
        <Outlet context={context} />
      </main>
    </div>
  );
};

export default UserLayout;
