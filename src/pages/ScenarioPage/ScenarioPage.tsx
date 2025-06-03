import {useState} from "react";
import "./ScenarioPage.css";
import { useScenario } from "../../context";
import { ScenarioForm } from "../../components";
import type {Dialogue} from "../../types";
import {SelectDialogueModal} from "../../components/modals";
import {useModal} from "../../hooks";
const ScenarioPage = () => {
  const { scenario, loading, error } = useScenario();
  const { openModal } = useModal();

  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  useEffect(()=>{
    if(!dialogue){
      handleOpenModal();
    }
  }, []);

  const handleOpenModal = () =>{
    openModal(<SelectDialogueModal />, "Select Dialogue");

  }
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
    <div>
      
    </div>
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
      {dialogue ? <div className="content-body">
        <ScenarioForm dialogue={dialogue} scenario={scenario} />
      </div>
      :
        <button onClick={handleOpenModal} className="btn btn-primary">Select a Dialogue</button>
      }
    </div>
  );
};

export default ScenarioPage;
