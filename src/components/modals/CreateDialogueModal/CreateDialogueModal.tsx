import React, { useState } from "react";
import type { Dialogue, Difficulty, Scenario } from "../../../types";
import Select from "../../Select";
import { PERSONA_TAGS } from "../../../constants/scenario";
import { X } from "lucide-react";
import "./CreateDialogueModal.scss";

interface CreateDialogueModalProps {
  scenario: Scenario;
  onSubmit: (dialogue: Dialogue) => void;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
}

const CreateDialogueModal = ({
  onClose,
  isLoading,
  error,
}: CreateDialogueModalProps) => {
  const [personaTags, setPersonaTags] = useState<string[]>([]);

  const [form, setForm] = useState<{
    title: string;
    personaTags: string[];
    difficulty: Difficulty;
  }>({
    title: "",
    personaTags: [],
    difficulty: "easy",
  });

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
    <div className="form-group">
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
    </div>
  );
};

export default CreateDialogueModal;
