import { TaskBar } from "../../";
import type React from "react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <TaskBar />
      <main>{children}</main>
    </div>
  );
};

export default AdminLayout;
