import { Outlet } from "react-router-dom";
import TaskBar from "../TaskBar";

const AdminLayout = () => {
  return (
    <div>
      <TaskBar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
