import { useState } from "react";
import { SCENARIO_CATEGORIES } from "../../../constants";
import { createScenario } from "../../../services/scenarios";
import { useModal } from "../../../context";
import "./CreateScenarioModal.css";
import Select from "../../Select";

const CreateScenarioModal = () => {
  const { closeModal } = useModal();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await createScenario({
        title,
        description,
      });
      closeModal();
      setTitle("");

      alert("Scenario Added!");
    } catch (err) {
      setError("Failed to create Scenario. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-group">
      <div className="form-group">
        <label className="form-label">Category</label>
        <Select
          value={title}
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

      {error && <p className="error-text">{error}</p>}

      <div className="modal-footer">
        <button type="button" onClick={closeModal} className="btn">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? "Creating..." : "Create Scenario"}
        </button>
      </div>
    </form>
  );
};

export default CreateScenarioModal;
