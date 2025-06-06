import { useState } from "react";
import { SCENARIO_CATEGORIES } from "../../../constants/scenario";
import { updateScenario } from "../../../services/scenarios";
import { useModal, useToast } from "../../../context";
import Select from "../../Select";
import type { Scenario } from "../../../types";
import { ProgressIndicator } from "../../";
interface EditScenarioModalProps {
  scenario: Scenario;
}
const EditScenarioModal = ({ scenario }: EditScenarioModalProps) => {
  const { showToast } = useToast();
  const { closeModal } = useModal();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Partial<Scenario>>({
    title: scenario.title,
    description: scenario.description,
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await updateScenario(scenario.id, values);
      showToast("Scenario created successfully!", "success");
      closeModal();
    } catch (err) {
      const message = "Failed to create Scenario. Please try again.";
      setError(message);
      showToast(message, "error");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  return (
    <form onSubmit={handleSubmit} className="create-scenario-modal">
      <div className="form-group">
        <label className="form-label">Title</label>
        <Select
          required
          value={values.title}
          onOptionSelect={(opt) =>
            setValues((prev) => ({ ...prev, title: opt.value }))
          }
          onChange={handleChange}
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
          value={values.description}
          onChange={handleChange}
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
          {isSubmitting ? <ProgressIndicator /> : "Update Scenario"}
        </button>
      </div>
    </form>
  );
};

export default EditScenarioModal;
