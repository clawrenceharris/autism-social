import { Outlet } from "react-router-dom";

const ScenarioLayout = () => {
  return (
    <div>
      <div style={{ minHeight: "100vh" }}>
        <Outlet />
      </div>
    </div>
  );
};

export default ScenarioLayout;
