import { SCENARIO_CATEGORIES } from "../../constants/scenario";
import type { DialogueStep } from "../../types";
import { Select } from "../";
import "./ScenarioForm.css";
import type { ScenarioFormValues } from "../../pages/EditScenarioPage/EditScenarioPage";

interface ScenarioFormProps {
  onChange: (data: Partial<ScenarioFormValues>) => void;
  values: {
    scenarioTitle: string;
    dialogueTitle: string;
    personaTags: string[];
    difficulty: string;
    placeholders: string[];
    description: string;
    steps: DialogueStep[];
  };
  error?: string | null;
}

const ScenarioForm = ({ values, onChange, error }: ScenarioFormProps) => {
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    onChange({ [e.target.name]: e.target.value });
  };
  return (
    <div>
      <div className="form-group">
        <label className="form-label">Scenario Title</label>
        <Select
          name="scenarioTitle"
          value={values.scenarioTitle}
          onChange={handleChange}
          options={SCENARIO_CATEGORIES.map((item, i) => ({
            key: i,
            value: item,
          }))}
          placeholder="Enter a Scenario title"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-textarea"
          name="description"
          value={values.description}
          onChange={handleChange}
          placeholder="Enter a description"
        />
      </div>
      {error && <p className="danger">{error}</p>}
    </div>
  );
};

export default ScenarioForm;
