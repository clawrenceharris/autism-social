import { useState } from "react";
import { SCENARIO_CATEGORIES } from "../../../constants/scenario";
import Select from "../../Select";

const CreateScenarioModal = () => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  return (
    <div className="create-scenario-modal">
      <div className="form-group">
        <label className="form-label">Title</label>
        <Select
          required
          value={title}
          onOptionSelect={(opt) => setTitle(opt.value)}
          onChange={(e) => setTitle(e.target.value)}
          className="form-select"
          options={SCENARIO_CATEGORIES.map((item, idx) => ({
            key: idx,
            value: item,
          }))}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="form-textarea"
          required
        />
      </div>
    </div>
  );
};

export default CreateScenarioModal;
