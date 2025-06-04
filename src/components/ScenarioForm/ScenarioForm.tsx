import { useState } from "react";
import { Plus, Wand2 } from "lucide-react";
import {
  DIFFICULTY_LEVELS,
  SCENARIO_CATEGORIES,
} from "../../constants/scenario";
import { type Dialogue, type Scenario } from "../../types";
import { Select } from "../";
import { generateScenarioSteps } from "../../lib/gemini";
import "./ScenarioForm.css";
import { updateScenario } from "../../services/scenarios";

interface ScenarioFormProps {
  scenario: Scenario;
}

const ScenarioForm = ({ scenario }: ScenarioFormProps) => {
  const [form, setForm] = useState<{
    title: string;
    description: string;
    difficulty: string;
    personaTags: string[];
  }>({
    title: scenario.title,
    description: scenario.description,
  });
  const [error, setError] = useState<string | null>();

 
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateScenario(scenario.id, form);
      alert("Scenario updated successfully!");
    } catch (err) {
      const error =
        typeof err === "string" ? err : err instanceof Error ? err.message : "";
      setError("Could not update scenario. " + error);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Scenario Title</label>
        <Select
          name="title"
          value={form.title}
          onChange={handleChange}
          options={SCENARIO_CATEGORIES.map((item, i) => ({
            key: i,
            value: item,
          }))}
          placeholder="Enter a Scenario title"
        />
      </div>

     
      {error && <p className="danger">{error}</p>}
     
    </form>
  );
};

export default ScenarioForm;
