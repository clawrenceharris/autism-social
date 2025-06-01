import { useState, type FormEvent } from "react";
import { ScenarioForm, SCENARIO_CATEGORIES } from "./components/ScenarioForm";
import { DialogueStep } from "./components/DialogueStep/DialogueStep";
import type { Scenario, Step, Option } from "./types";
import { generateId } from "./utils";
import { insertScenario } from "./services/scenario";

function App() {
  const [scenario, setScenario] = useState<Scenario>({
    title: SCENARIO_CATEGORIES[0],
    variationId: generateId("variation"),
    variationTitle: "",
    description: "",
    userFields: [],
    difficulty: "easy",
    scoringCategories: [],
    personaTags: [],
    steps: [{ stepId: generateId("step"), npcLine: "", options: [] }],
  });

  const [customCategory, setCustomCategory] = useState("");
  const [jsonError, setJsonError] = useState("");

  const addStep = () => {
    setScenario((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        { stepId: generateId("step"), npcLine: "", options: [] },
      ],
    }));
  };

  const removeStep = (index: number) => {
    setScenario((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const addOption = (stepIndex: number) => {
    setScenario((prev) => {
      const newSteps = [...prev.steps];
      newSteps[stepIndex].options.push({
        responseLabel: "",
        eventType: "",
        nextStepId: "",
        scores: prev.scoringCategories.reduce(
          (acc, category) => ({
            ...acc,
            [category]: 0,
          }),
          {}
        ),
      });
      return { ...prev, steps: newSteps };
    });
  };

  const removeOption = (stepIndex: number, optionIndex: number) => {
    setScenario((prev) => {
      const newSteps = [...prev.steps];
      newSteps[stepIndex].options = newSteps[stepIndex].options.filter(
        (_, i) => i !== optionIndex
      );
      return { ...prev, steps: newSteps };
    });
  };

  const updateScenario = (field: keyof Scenario, value: any) => {
    setScenario((prev) => ({ ...prev, [field]: value }));
  };

  const updateStep = (index: number, field: keyof Step, value: any) => {
    setScenario((prev) => {
      const newSteps = [...prev.steps];
      newSteps[index] = { ...newSteps[index], [field]: value };
      return { ...prev, steps: newSteps };
    });
  };

  const updateOption = (
    stepIndex: number,
    optionIndex: number,
    field: keyof Option,
    value: any
  ) => {
    setScenario((prev) => {
      const newSteps = [...prev.steps];
      newSteps[stepIndex].options[optionIndex] = {
        ...newSteps[stepIndex].options[optionIndex],
        [field]: value,
      };
      return { ...prev, steps: newSteps };
    });
  };

  const updateScore = (
    stepIndex: number,
    optionIndex: number,
    category: string,
    value: number
  ) => {
    setScenario((prev) => {
      const newSteps = [...prev.steps];
      newSteps[stepIndex].options[optionIndex].scores = {
        ...newSteps[stepIndex].options[optionIndex].scores,
        [category]: value,
      };
      return { ...prev, steps: newSteps };
    });
  };

  const handleJsonChange = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      setScenario(parsed);
      setJsonError("");
    } catch (error) {
      setJsonError("Invalid JSON format");
    }
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await insertScenario({
        scenario: scenario,
      });
      alert("Scenario submitted successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to submit scenario.");
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Dialogue Scenario Builder
          </h1>

          <ScenarioForm
            scenario={scenario}
            customCategory={customCategory}
            onUpdateScenario={updateScenario}
            onCustomCategoryChange={setCustomCategory}
          />

          {/* Steps */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-700">Steps</h2>
              <button
                onClick={addStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Step
              </button>
            </div>

            {scenario.steps.map((step, stepIndex) => (
              <DialogueStep
                key={step.stepId}
                step={step}
                stepIndex={stepIndex}
                scoringCategories={scenario.scoringCategories}
                onRemove={() => removeStep(stepIndex)}
                onUpdate={(field, value) => updateStep(stepIndex, field, value)}
                onAddOption={() => addOption(stepIndex)}
                onRemoveOption={(optionIndex) =>
                  removeOption(stepIndex, optionIndex)
                }
                onUpdateOption={(optionIndex, field, value) =>
                  updateOption(stepIndex, optionIndex, field, value)
                }
                onUpdateScore={(optionIndex, category, value) =>
                  updateScore(stepIndex, optionIndex, category, value)
                }
              />
            ))}
          </div>
        </div>

        {/* JSON Editor */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            JSON Editor
          </h2>
          <div className="relative">
            <textarea
              className={`w-full h-96 font-mono text-sm p-4 rounded-md border ${
                jsonError ? "border-red-500" : "border-gray-300"
              } focus:border-blue-500 focus:ring-blue-500`}
              value={JSON.stringify(scenario, null, 2)}
              onChange={(e) => handleJsonChange(e.target.value)}
            />
            {jsonError && (
              <p className="text-red-500 text-sm mt-2">{jsonError}</p>
            )}
          </div>
        </div>
        <button type="submit">Submit Scenario</button>
      </form>
    </div>
  );
}

export default App;
