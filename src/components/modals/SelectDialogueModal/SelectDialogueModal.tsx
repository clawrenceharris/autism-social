import { useState } from "react";
import { SCENARIO_CATEGORIES } from "../../../constants";
import { createScenario } from "../../../services/scenarios";
import {useScenarioDialogues} from "../../../hooks";
import "./SelectDialogueModal.css";

const SelectDialogueModal = () => {
  const { scenarioDialogues, loading, error } = useScenarioDialogues();
  if(loading){
     return <div>
    <p>Loading...</p>
    </div>
  }
  if(error){
    return <div>
    <h1>An Error occurred</h1>
      <p>{error?.message}</p>
    </div>
  }
  return (
    <div>
     <div>
      {scenarioDialogues.map((item) =>(
      <button className="card">
      <div>
        <h2>{item.title}</h2>
        <p><small>ID: {item.id}</small></p>
      </div>
        
      </button>
      ))}
     </div>
    </div>
  );
};

export default SelectDialogueModal;