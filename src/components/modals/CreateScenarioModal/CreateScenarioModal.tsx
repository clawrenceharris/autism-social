import { useState } from "react";
import { SCENARIO_CATEGORIES } from "../../../constants";
import { createScenario } from "../../../services/scenarios";
import { useModal } from "../../../context";
import "./CreateScenarioModal.css";

const CreateScenarioModal = () => {
  const { closeModal } = useModal();
  const [title, setTitle] = useState<string>(SCENARIO_CATEGORIES[0]);
  const [customTitle, setCustomTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await createScenario({
        title: title === "Custom" ? customTitle : title,
        description,
      });
      closeModal();
      setTitle(SCENARIO_CATEGORIES[0]);
      setCustomTitle("");
      setDescription("");
      alert("Scenario Added!");
    } catch (err) {
      setError("Failed to create scenario. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-group">
      <div className="form-group">
        <label className="form-label">Category</label>
        <select
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-select"
        >
          {SCENARIO_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {title === "Custom" && (
        <div className="form-group">
          <label className="form-label">Custom Category</label>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="form-input"
            required
          />
        </div>
      )}

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
          disabled={isSubmitting || (title === "Custom" && !customTitle)}
          className="btn btn-primary"
        >
          {isSubmitting ? "Creating..." : "Create Scenario"}
        </button>
      </div>
    </form>
  );
};

export default CreateScenarioModal;