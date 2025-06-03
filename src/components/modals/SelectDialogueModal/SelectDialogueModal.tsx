import { useState } from "react";
import { SCENARIO_CATEGORIES } from "../../../constants";
import { createScenario } from "../../../services/scenarios";
import { useModal } from "../../../context";
import {useScenarioDialogues} from "../../../hooks";
import "./SelectDialogueModal.css";

const SelectDialogueModal = () => {
  const { closeModal } = useModal();
  const { dialogues, loading, error } = useScenarioDialogues();
console.log(dialogues);
  return (
    <div>
      {/* {dialogues.map((item) =>(
      <button className="card">
      <div>
        <h2>{item.title}</h2>
        <p><small>ID: {item.id}</small></p>
      </div>
        
      </button>
      ))} */}
    </div>
  );
};

export default SelectDialogueModal;