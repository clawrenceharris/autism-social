import { Outlet } from "react-router-dom";
import UserTaskBar from "../UserTaskBar/UserTaskBar";

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