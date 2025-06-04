import { useCallback, useEffect, useState } from "react";
import type { DialogueStep, ScoreCategory, Dialogue } from "../../types";
import { Plus, Trash2, Wand2 } from "lucide-react";
import "./DialogueForm.css";
import { Select } from "../";
import { DIFFICULTY_LEVELS } from "../../constants/scenario";
import { generateScenarioSteps } from "../../lib/gemini";
import type { ScenarioFormValues } from "../../pages/ScenarioPage/ScenarioPage";

interface DialogueFormProps {
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
}

const SCORE_FIELDS = [
  "clarity",
  "empathy",
  "assertiveness",
  "socialAwareness",
  "selfAdvocacy",
] as const;

const DialogueForm = ({ values, onChange }: DialogueFormProps) => {
  const [steps, setSteps] = useState<DialogueStep[]>(values.steps);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [stepId, setStepId] = useState<string>("");

  const handleStepIdChange = useCallback(
    (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
      setStepId(e.target.value);
      handleStepChange(id, "id", e.target.value);
    },
    []
  );
  const [dialoguesByScenario, _] = useState<{
    [key: string]: Dialogue[];
  }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    onChange({ [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!values.scenarioTitle) {
      alert(
        "Please provide a scenario title and dialogue title before generating."
      );
      return;
    }

    try {
      const generatedSteps = await generateScenarioSteps(
        values.scenarioTitle,
        values.dialogueTitle,
        values.difficulty,
        values.personaTags
      );
      onChange({ steps: generatedSteps });
    } catch (error) {
      console.error("Failed to generate steps:", error);
      alert("Failed to generate steps. Please try again.");
    }
  };
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
    <div>
      <div className="form-group">
        <label className="form-label">Dialogue Title</label>
        <Select
          name="dialogueTitle"
          value={values.dialogueTitle}
          onChange={handleChange}
          options={(dialoguesByScenario[values.scenarioTitle] || []).map(
            (item) => ({
              value: item.title,
              key: item.id,
            })
          )}
          placeholder="Enter a Dialogue title"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Difficulty Level</label>
        <select
          className="form-input"
          name="difficulty"
          value={values.difficulty}
          onChange={handleChange}
        >
          {DIFFICULTY_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="margin-y flex-column">
        <button
          onClick={handleGenerate}
          type="button"
          className="btn special btn-primary"
        >
          <Wand2 />
          Generate Dialogue
        </button>
      </div>

      <div className="dialogue-steps">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`dialogue-step ${
              selectedStepId === step.id ? "selected" : ""
            }`}
            onClick={() => setSelectedStepId(step.id)}
          >
            <div className="step-header">
              <label className="step-id">Step ID: &nbsp; </label>
              <input
                type="text"
                value={step.id}
                className="form-input"
                onChange={(e) =>
                  handleStepChange(step.id, "id", e.target.value)
                }
              />
            </div>

            <div className="npc-line">
              <textarea
                className="form-textarea"
                value={step.npc}
                onChange={(e) =>
                  handleStepChange(step.id, "npc", e.target.value)
                }
                placeholder="NPC dialogue line..."
              />
            </div>

            <div className="dialogue-options-list">
              {step.options.map((option, optionIndex) => (
                <div key={optionIndex} className="dialogue-option-item">
                  <div className="content-row">
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

                    <Select
                      style={{ width: "100%", flex: 1 }}
                      className="form-select"
                      value={option.next}
                      options={steps.map((s) => ({ value: s.id, key: s.id }))}
                      onChange={(e) =>
                        handleOptionChange(
                          step.id,
                          optionIndex,
                          "next",
                          e.target.value
                        )
                      }
                    />
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
                          option.scoreChanges.includes(category)
                            ? "selected"
                            : ""
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
    </div>
  );
};

export default DialogueForm;
