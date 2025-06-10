import { useEffect, useState } from "react";
import type {
  Dialogue,
  DialogueStep,
  Scenario,
  ScoreCategory,
} from "../../types";
import { Plus, Trash2, Wand2 } from "lucide-react";
import { Select } from "../";
import { DIFFICULTY_LEVELS } from "../../constants/scenario";
import { generateScenarioSteps } from "../../lib/gemini";

interface DialogueFormProps {
  scenario: Scenario;
  onChange: (data: Partial<Dialogue>) => void;
  values: {
    title: string;
    persona_tags: string[];
    difficulty: string;
    placeholders: string[];
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

const DialogueForm = ({ values, scenario, onChange }: DialogueFormProps) => {
  const [steps, setSteps] = useState<DialogueStep[]>(values.steps);
  const [selectedStepIndex, setSelectedIndex] = useState<number | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    onChange({ [e.target.name]: e.target.value });
  };
  const handleGenerate = async () => {
    if (!values.title) {
      alert(
        "Please provide a scenario title and dialogue title before generating."
      );
      return;
    }

    try {
      const generatedSteps = await generateScenarioSteps(
        scenario.title,
        values.title,
        values.difficulty,
        values.persona_tags
      );
      setSteps(generatedSteps);
    } catch (error) {
      console.error("Failed to generate steps:", error);
      alert("Failed to generate steps. Please try again.");
    }
  };
  useEffect(() => {
    onChange({ steps: steps });
  }, [onChange, steps]);
  const handleStepChange = (index: number, field: string, value: string) => {
    console.log(index + " - " + selectedStepIndex);

    setSteps((prevSteps) =>
      prevSteps.map((step, i) =>
        i === index ? { ...step, [field]: value } : step
      )
    );
  };

  const handleOptionChange = (
    stepId: string,
    optionIndex: number,
    field: string,
    value: string
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
                      scores: opt.scores.includes(category)
                        ? opt.scores.filter((sc) => sc !== category)
                        : [...opt.scores, category],
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
                  scores: [],
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
            scores: [],
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
  const removeStep = (id: string) => {
    setSteps((prevSteps) => prevSteps.filter((i) => i.id !== id));
  };
  return (
    <div>
      <div className="form-group">
        <label className="form-label">Dialogue Title</label>
        <Select
          options={[]}
          name="title"
          required
          value={values.title}
          onChange={handleChange}
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
              selectedStepIndex === index ? "selected" : ""
            }`}
            onClick={() => setSelectedIndex(index)}
          >
            <div className="step-header">
              <label className="step-id">Step ID: &nbsp; </label>
              <input
                type="text"
                value={step.id}
                className="form-input"
                onChange={(e) => handleStepChange(index, "id", e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeStep(step.id)}
                className="squircle-btn danger"
              >
                <Trash2 />
              </button>
            </div>

            <div className="npc-line">
              <textarea
                className="form-textarea"
                value={step.npc}
                onChange={(e) => handleStepChange(index, "npc", e.target.value)}
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
                          option.scores.includes(category) ? "selected" : ""
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
