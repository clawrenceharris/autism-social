import { Outlet } from "react-router-dom";
import { UserTaskBar } from "../../";

const UserLayout = () => {
  return (
    <div>
      <UserTaskBar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
