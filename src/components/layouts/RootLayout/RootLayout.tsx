import { Outlet, useOutletContext } from "react-router-dom";
import { SideNav } from "../..";
import type { AuthContextType } from "../../routes";

const RootLayout = () => {
  const context = useOutletContext<AuthContextType>();
  return (
    <div className="layout-container">
      <SideNav />
      <main className="main-content">
        <div className="container">
          <Outlet context={context} />
        </div>
      </main>
    </div>
  );
};

export default RootLayout;