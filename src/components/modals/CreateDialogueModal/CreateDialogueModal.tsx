import { useState } from "react";
import { createDialogue } from "../../../services/scenarios";
import type { Scenario } from "../../../types";
import { useModal } from "../../../context";
import Select from "../../Select";
import { PERSONA_TAGS } from "../../../constants/scenario";
import { X } from "lucide-react";
import "./CreateDialogueModal.css";

interface CreateDialogueModalProps {
  scenario: Scenario;
}

const CreateDialogueModal = ({ scenario }: CreateDialogueModalProps) => {
  const { closeModal } = useModal();
  const [error, setError] = useState<string | null>(null);
  const [personaTags, setPersonaTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [form, setForm] = useState({
    title: "",
    scenario_id: scenario.id,
    scoring_categories: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await createDialogue({
        ...form,
        persona_tags: personaTags,
        scoring_categories: [],
        steps: [],
        user_fields: [],
      });

      setIsSubmitting(false);
      closeModal();
    } catch (err) {
      setError("Failed to create Dialogue. Please try again.");
      setIsSubmitting(false);

      console.error(err);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleDeleteTag = (tag: string) => {
    setPersonaTags((prev) => prev.filter((t) => tag !== t));
  };
  const handleAddTag = (tag: string) => {
    if (personaTags.includes(tag)) {
      return;
    }
    setPersonaTags((prev) => [...prev, tag]);
  };
  return (
    <form onSubmit={handleSubmit} className="form-group">
      <div className="form-group">
        <label className="form-label">Dialogue Title</label>
        <input
          required
          name="title"
          value={form.title}
          onChange={handleChange}
          className="form-select"
        />
      </div>

      <div className="form-group">
        <label>Persona Tags</label>
        <Select
          options={PERSONA_TAGS.map((item, idx) => ({ key: idx, value: item }))}
          onOptionSelect={(opt) => handleAddTag(opt.value)}
        />
        <div className="tags scroll-content">
          {personaTags.map((item, index) => (
            <div key={index} className="tag outlined content-row">
              {item}
              <button type="button" onClick={() => handleDeleteTag(item)}>
                <X />
              </button>
            </div>
          ))}
        </div>
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
          {isSubmitting ? "Creating" : "Create Dialogue"}
        </button>
      </div>
    </form>
  );
};

export default CreateDialogueModal;
