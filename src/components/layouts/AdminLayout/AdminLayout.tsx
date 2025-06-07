import { AdminHeader } from "../../";
import type React from "react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <AdminHeader />
      <main>{children}</main>
    </div>
  );
};

export default AdminLayout;
