import { Outlet, useOutletContext } from "react-router-dom";
import { RootHeader } from "../..";
import type { AuthContextType } from "../../../types";

const UserLayout = () => {
  const context = useOutletContext<AuthContextType>();
  return (
    <div className="layout-container">
      <RootHeader />
      <main style={{ marginTop: "120px" }} className="container">
        <Outlet context={context} />
      </main>
    </div>
  );
};

export default UserLayout;
