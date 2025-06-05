import { useState } from "react";
import { SCENARIO_CATEGORIES } from "../../../constants/scenario";
import { createScenario } from "../../../services/scenarios";
import { useModal, useToast } from "../../../context";
import "./CreateScenarioModal.css";
import Select from "../../Select";

const CreateScenarioModal = () => {
  const { closeModal } = useModal();
  const { showToast } = useToast();
  const [title, setTitle] = useState<string | null>(null);
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
      showToast("Scenario created successfully!", "success");
    } catch (err) {
      const errorMessage = "Failed to create Scenario. Please try again.";
      setError(errorMessage);
      showToast(errorMessage, "error");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-group">
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

      {error && <p className="danger">{error}</p>}

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