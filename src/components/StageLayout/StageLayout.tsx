import React from "react";
import "./StageLayout.css";
import { Outlet } from "react-router-dom";
import { Footer, StageSideBar } from "../";
const StageLayout = () => {
  return (
    <div className="stage">
      <main>
        <Outlet />
        <StageSideBar />
      </main>
      <Footer />
    </div>
  );
};

export default StageLayout;
