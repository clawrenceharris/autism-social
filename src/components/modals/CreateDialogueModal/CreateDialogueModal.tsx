import React, { useState } from "react";
import type {
  CreateDialogueData,
  Dialogue,
  Difficulty,
  Scenario,
} from "../../../types";
import Select from "../../Select";
import { PERSONA_TAGS } from "../../../constants/scenario";
import { X } from "lucide-react";
import "./CreateDialogueModal.scss";
import { createDialogue } from "../../../services/dialogues";
import { useToast } from "../../../context";

interface CreateDialogueModalProps {
  scenario: Scenario;
  onSubmit: (dialogue: Dialogue) => void;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
}

const CreateDialogueModal = ({
  scenario,
  onClose,
  isLoading,
  error,
  onSubmit,
}: CreateDialogueModalProps) => {
  const [personaTags, setPersonaTags] = useState<string[]>([]);
  // const { addDialogue } = useScenarioStore(scenario.id);
  const { showToast } = useToast();

  const [form, setForm] = useState<{
    title: string;
    personaTags: string[];
    difficulty: Difficulty;
  }>({
    title: "",
    personaTags: [],
    difficulty: "easy",
  });
  const handleAddDialogue = async (data: CreateDialogueData) => {
    try {
      await createDialogue(data);
      showToast("Dialogue created successfully", { type: "success" });
    } catch (err) {
      console.error("Error creating Dialogue: " + err);
      showToast("Could not create Dialogue", { type: "error" });
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createDialogue({
        ...form,
        scenario_id: scenario.id,
        persona_tags: personaTags,
        scoring_categories: [],
        placeholders: [],
        steps: [],
      });
      handleAddDialogue(result);
      onSubmit(result);
      showToast("Dialogue created successfully!", { type: "success" });
    } catch (err) {
      showToast("Failed to create Dialogue. Please try again.", {
        type: "error",
      });
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

      {error && <p className="danger">{error}</p>}

      <div className="modal-footer">
        <button type="button" onClick={onClose} className="btn">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="btn btn-primary">
          {isLoading ? "Creating" : "Create Dialogue"}
        </button>
      </div>
    </form>
  );
};

export default CreateDialogueModal;
