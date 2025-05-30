import React from "react";
import "./Dashboard.css";
import { scenarios } from "../../constants/scenarios";
import ScenarioItem from "../../components/ScenarioItem/ScenarioItem";
const Dashboard = () => {
  return (
    <div>
      <h1>Hi, John</h1>
      <p>
        Welcome to your personalized place to get social and improve your
        skills.
      </p>
      <section>
        <h2>Recent Scenarios</h2>
        <div>
          {scenarios.map((item) => (
            <ScenarioItem dialogue={item} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
