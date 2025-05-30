import React from "react";
import { scenarios } from "../../constants/scenarios";
import ScenarioItem from "../ScenarioItem";
import "./StageSideBar.css";
const StageSideBar = () => {
  return (
    <div className="stage">
      <div className="nav-top">
        <h2>More Scenarios</h2>
        <div>
          {scenarios.map((item) => (
            <ScenarioItem dialogue={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StageSideBar;
