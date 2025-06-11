import { Outlet } from "react-router-dom";

const ScenarioLayout = () => {
  return (
    <div className="layout-container">
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default ScenarioLayout;
