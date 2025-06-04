import { useState } from "react";
import type { DialogueStep, ScoreCategory } from "../../types";
import { Plus, Trash2 } from "lucide-react";
import "./DialogueForm.css";

interface DialogueFormProps {
  steps: DialogueStep[];
}

const SCORE_FIELDS = [
  "clarity",
  "empathy",
  "assertiveness",
  "socialAwareness",
  "selfAdvocacy",
] as const;

const EVENT_TYPES = ["CHOOSE_1", "CHOOSE_2", "CHOOSE_3", "CHOOSE_4"];

const DialogueForm = ({ steps: initialSteps }: DialogueFormProps) => {
  const [steps, setSteps] = useState<DialogueStep[]>(initialSteps);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const handleStepChange = (stepId: string, field: string, value: any) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId ? { ...step, [field]: value } : step
      )
    );
  };

  const handleOptionChange = (
    stepId: string,
    optionIndex: number,
    field: string,
    value: any
  ) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              options: step.options.map((opt, idx) =>
                idx === optionIndex ? { ...opt, [field]: value } : opt
              ),
            }
          : step
      )
    );
  };

  const toggleScoreCategory = (
    stepId: string,
    optionIndex: number,
    category: ScoreCategory
  ) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              options: step.options.map((opt, idx) =>
                idx === optionIndex
                  ? {
                      ...opt,
                      scoreChanges: opt.scoreChanges.includes(category)
                        ? opt.scoreChanges.filter((sc) => sc !== category)
                        : [...opt.scoreChanges, category],
                    }
                  : opt
              ),
            }
          : step
      )
    );
  };

  const addOption = (stepId: string) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              options: [
                ...step.options,
                {
                  label: "",
                  event: `CHOOSE_${step.options.length + 1}`,
                  next: "",
                  scoreChanges: [],
                },
              ],
            }
          : step
      )
    );
  };

  const addStep = () => {
    const newStepId = `step-${steps.length + 1}`;
    setSteps((prevSteps) => [
      ...prevSteps,
      {
        id: newStepId,
        npc: "",
        options: [
          {
            label: "",
            event: "CHOOSE_1",
            next: "",
            scoreChanges: [],
          },
        ],
      },
    ]);
  };

  const removeOption = (stepId: string, optionIndex: number) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              options: step.options.filter((_, idx) => idx !== optionIndex),
            }
          : step
      )
    );
  };

  return (
    <div className="dialogue-steps">
      {steps.map((step) => (
        <div
          key={step.id}
          className={`dialogue-step ${
            selectedStepId === step.id ? "selected" : ""
          }`}
          onClick={() => setSelectedStepId(step.id)}
        >
          <div className="step-header">
            <span className="step-id">Step ID: {step.id}</span>
          </div>

          <div className="npc-line">
            <textarea
              className="form-textarea"
              value={step.npc}
              onChange={(e) => handleStepChange(step.id, "npc", e.target.value)}
              placeholder="NPC dialogue line..."
            />
          </div>

          <div className="options-list">
            {step.options.map((option, optionIndex) => (
              <div key={optionIndex} className="option-item">
                <div className="option-grid">
                  <input
                    type="text"
                    className="form-input"
                    value={option.label}
                    onChange={(e) =>
                      handleOptionChange(
                        step.id,
                        optionIndex,
                        "label",
                        e.target.value
                      )
                    }
                    placeholder="Response text..."
                  />

                  <select
                    className="form-select"
                    value={option.event}
                    onChange={(e) =>
                      handleOptionChange(
                        step.id,
                        optionIndex,
                        "event",
                        e.target.value
                      )
                    }
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  <input
                    className="form-select"
                    value={option.next}
                    defaultValue={1}
                    onChange={(e) =>
                      
                      handleOptionChange(
                        step.id,
                        optionIndex,
                        "next",
                        e.target.value
                      )
                    }
                  />
                    <option value="">Select next step</option>
                    {steps.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="score-changes">
                  {SCORE_FIELDS.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        toggleScoreCategory(step.id, optionIndex, category)
                      }
                      className={`score-btn ${
                        option.scoreChanges.includes(category) ? "selected" : ""
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <div className="actions">
                  <button
                    type="button"
                    onClick={() => removeOption(step.id, optionIndex)}
                    className="squircle-btn danger"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="actions">
            <button
              type="button"
              onClick={() => addOption(step.id)}
              className="btn btn-primary"
            >
              <Plus size={20} />
              Add Response
            </button>
          </div>
        </div>
      ))}

      <div className="actions">
        <button type="button" onClick={addStep} className="btn btn-primary">
          <Plus size={20} />
          Add Step
        </button>
      </div>
    </div>
  );
};

export default DialogueForm;