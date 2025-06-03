import { useState } from "react";
import { SCENARIO_CATEGORIES } from "../../../constants";
import { createScenario } from "../../../services/scenarios";
import {useScenarioDialogues} from "../../../hooks";
import "./SelectDialogueModal.css";
import {Minus, Plus} from "lucide-react"
const SelectDialogueModal = () => {
  const { scenarioDialogues, loading, error } = useScenarioDialogues();
  if(loading){
     return (<div className="content-centered-absolute">
    <p>Loading...</p>
    </div>);
  }
  if(error){
     return (<div className="content-centered-absolute">
    <h1>An Error occurred</h1>
      <p>{error}</p>
    </div>);
  }
  return (
    <div className="outlined flex-column dialogues-container">
     
      
        {scenarioDialogues.length > 0 ? 
         
          <div>
       
            {scenarioDialogues.map((item) =>(
            <button className="card">
              <div>
                <h2>{item.title}</h2>
                <p><small>ID: {item.id}</small></p>
              </div>
        
            </button>))}
       
          </div>
     
        :

       <div className="content-centered align-center">
          <p>There are no Dialogues yet</p>
      </div>}
      <div className="dialogue-actions">
          <div className="content-row">
            <button className="squircle-btn danger outlined">
              <Minus/>
            </button>
             <button className="squircle-btn danger outlined">
              <Plus/>
            </button>
          </div>
      </div>
    </div>
      
     
  );
};

export default SelectDialogueModal;