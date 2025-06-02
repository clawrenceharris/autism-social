import { useState } from "react";
import { Plus, Wand2 } from "lucide-react";
import { DIFFICULTY_LEVELS, SCENARIO_CATEGORIES } from "../../constants";
import { type Dialogue, type Scenario } from "../../types";
import { Select } from "../";
import { generateScenarioSteps } from "../../lib/gemini";
import "./ScenarioForm.css";
interface ScenarioFormProps {
  scenario: Scenario;
}

const ScenarioForm = ({ scenario }: ScenarioFormProps) => {
  const [form, setForm] = useState<{
    title: string;
    description: string;
    dialogueTitle: string;
    difficulty: string;
    personaTags: string[];
  }>({
    title: "",
    description: "",
    dialogueTitle: "",
    difficulty: "easy",
    personaTags: [],
  });
  const [dialogueSteps, setDialogueSteps] = useState<object>([]);

  const [dialoguesByScenario, _] = useState<{
    [key: string]: Dialogue[];
  }>({});

  // useEffect(() => {
  //   const getGeneratedDialogues = async () => {
  //     try {
  //       const dialogues = await generateSuggestedDialogues(form.title);
  //       console.log(dialogues);
  //       setGeneratedDialogues(dialogues.split(","));
  //     } catch (error) {
  //       alert(error);
  //     }
  //   };
  //   // getGeneratedDialogues();
  // }, []);

  const handleGenerate = async () => {
    if (!scenario.title) {
      alert(
        "Please provide a scenario title and dialogue title before generating."
      );
      return;
    }

    try {
      const generatedSteps = await generateScenarioSteps(
        form.title,
        form.dialogueTitle,
        form.difficulty,
        form.personaTags
      );
      setDialogueSteps(generatedSteps);
    } catch (error) {
      console.error("Failed to generate steps:", error);
      alert("Failed to generate steps. Please try again.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex-column form-group">
        <div>
          {/* Scenario Title */}
          <label>Scenario Title</label>
          <Select
            name="title"
            value={form.title}
            onChange={handleChange}
            options={SCENARIO_CATEGORIES.map((item, i) => ({
              key: i,
              value: item,
            }))}
            placeholder="Enter a Scenario title"
          />
        </div>

        {/* Dialogue Title */}

        <div>
          <label>Dialogue Title</label>
          <Select
            name="dialogueTitle"
            value={form.dialogueTitle}
            onChange={handleChange}
            options={(dialoguesByScenario[form.title] || []).map((item) => ({
              value: item.title,
              key: item.id,
            }))}
            placeholder="Enter a Dialogue title"
          />
        </div>

        {/* Difficulty */}
        <div>
          <label>Difficulty Level: </label>
          <select
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
          >
            {DIFFICULTY_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="margin-y flex-content">
        {dialogueSteps && (
          <button
            onClick={handleGenerate}
            type="submit"
            className="btn btn-primary"
          >
            <Plus />
            Add Dialogue
          </button>
        )}

        <button
          onClick={handleGenerate}
          type="button"
          className="btn special btn-primary"
        >
          <Wand2 />
          Generate Dialogue
        </button>
      </div>
    </form>
  );
};

export default ScenarioForm;
