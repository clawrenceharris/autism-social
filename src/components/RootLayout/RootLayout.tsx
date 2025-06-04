import { Outlet } from "react-router-dom";
import TaskBar from "../TaskBar";

const RootLayout = () => {
  return (
    <div>
      <TaskBar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
