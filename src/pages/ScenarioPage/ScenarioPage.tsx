import {useState, useEffect} from "react";
import "./ScenarioPage.css";
import { useScenario,useModal } from "../../context";
import { ScenarioForm } from "../../components";
import type {Dialogue} from "../../types";
import {SelectDialogueModal} from "../../components/modals";
const ScenarioPage = () => {
  const { scenario, loading, error } = useScenario();

  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  useEffect(()=>{
    
  }, []);

 
  if (loading) {
    return <div className="content-centered-absolute">Loading...</div>;
  }
  if (error) {
    return <div className="content-centered-absolute">An error occured: {error}</div>;
  }
  if (!scenario) {
    return <div className="content-centered-absolute">404 Error: Scenario not found.</div>;
  }
  if(!dialogue){
    <SelectDialogueModal/>
  }
  return (
    <div>
      <div>
        <h1>Edit Scenario</h1>
        <p>
          {" "}
          <small>ID: {scenario.id}</small>
        </p>
      </div>
        <ScenarioForm dialogue={dialogue} scenario={scenario} />
     
    </div>
  );
};

export default ScenarioPage;
