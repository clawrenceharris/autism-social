import { Outlet } from "react-router-dom";
import { UserHeader } from "../../";

const UserLayout = () => {
  return (
    <div>
      <UserHeader />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
