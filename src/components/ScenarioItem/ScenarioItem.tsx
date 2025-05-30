import React from "react";
import "./ScenarioItem.css";
import { Dialogue } from "../../types";
import { Link } from "react-router-dom";
import { assets } from "../../constants/assets";
const ScenarioItem = ({ dialogue }: { dialogue: Dialogue }) => {
  return (
    <Link to={`/scenario/${dialogue.id}`} className="scenario-item-container">
      <h3>{dialogue.name}</h3>
      <p>{dialogue.description}</p>
      <div className="flex-column">
        <button className="primary circle-button">
          <img className="icon" src={assets.play} alt="Play" />
        </button>
        {/* <button className="secondary">Restart</button> */}
      </div>
    </Link>
  );
};

export default ScenarioItem;
