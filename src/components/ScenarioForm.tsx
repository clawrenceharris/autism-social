import { useState } from "react";
import { ChevronDown, ChevronRight, Wand2 } from "lucide-react";
import type { Scenario } from "../types";
import { generateScenarioSteps } from "../utils";

interface ScenarioFormProps {
  scenario: Scenario;
  customCategory: string;
  onUpdateScenario: (field: keyof Scenario, value: any) => void;
  onCustomCategoryChange: (value: string) => void;
}

export const SCENARIO_CATEGORIES = [
  "Meet Someone New",
  "Ask For Help",
  "Handle Conflict",
  "Express Boundaries",
  "Job Interview",
  "Make Plans",
  "Give Feedback",
  "Receive Criticism",
  "Group Interaction",
  "Custom",
];

export const SCORING_CATEGORIES = [
  "Clarity",
  "Empathy",
  "Assertiveness",
  "Social Awareness",
  "Self-Advocacy",
];

export const DIFFICULTY_LEVELS = [
  "easy",
  "medium",
  "hard",
  "extra hard",
] as const;

export function ScenarioForm({
  scenario,
  customCategory,
  onUpdateScenario,
  onCustomCategoryChange,
}: ScenarioFormProps) {
  const [expandedSection, setExpandedSection] = useState<string>("basic");

  const handleGenerate = async () => {
    if (!scenario.title || !scenario.variationTitle) {
      alert(
        "Please provide both a category and variation title before generating."
      );
      return;
    }

    try {
      const generatedSteps = await generateScenarioSteps(
        scenario.title,
        scenario.variationTitle,
        scenario.userFields,
        scenario.difficulty,
        scenario.personaTags
      );
      onUpdateScenario("steps", generatedSteps);
    } catch (error) {
      console.error("Failed to generate steps:", error);
      alert("Failed to generate steps. Please try again.");
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? "" : section);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="block text-sm font-medium text-gray-700">
          Scenario: {scenario.title}
        </p>
      </div>

      {/* Basic Information */}
      <div className="border rounded-lg p-4 bg-white">
        <button
          onClick={() => toggleSection("basic")}
          className="flex items-center gap-2 w-full text-left font-medium text-gray-700"
        >
          {expandedSection === "basic" ? (
            <ChevronDown size={20} />
          ) : (
            <ChevronRight size={20} />
          )}
          Basic Information
        </button>

        {expandedSection === "basic" && (
          <div className="mt-4 space-y-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <div className="flex gap-2">
                <select
                  value={scenario.title}
                  onChange={(e) => onUpdateScenario("title", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {SCENARIO_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Category */}
            {scenario.title === "Custom" && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => {
                  onCustomCategoryChange(e.target.value);
                  onUpdateScenario("title", e.target.value);
                }}
                placeholder="Enter custom category"
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            )}

            {/* Variation Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Variation Title
              </label>
              <input
                type="text"
                value={scenario.variationTitle}
                onChange={(e) =>
                  onUpdateScenario("variationTitle", e.target.value)
                }
                placeholder="e.g., Coffee Shop Small Talk"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Actors
              </label>
              <input
                type="text"
                value={scenario.variationTitle}
                onChange={(e) =>
                  onUpdateScenario("variationTitle", e.target.value)
                }
                placeholder="e.g., Coffee Shop Small Talk"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={
                !scenario.title ||
                !scenario.variationTitle ||
                !scenario.personaTags ||
                !scenario.userFields
              }
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Wand2 size={16} />
              Generate Scenario
            </button>
          </div>
        )}
      </div>

      {/* Advanced Settings */}
      <div className="border rounded-lg p-4 bg-white">
        <button
          onClick={() => toggleSection("advanced")}
          className="flex items-center gap-2 w-full text-left font-medium text-gray-700"
        >
          {expandedSection === "advanced" ? (
            <ChevronDown size={20} />
          ) : (
            <ChevronRight size={20} />
          )}
          Advanced Settings
        </button>

        {expandedSection === "advanced" && (
          <div className="mt-4 space-y-4">
            {/* Difficulty Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Difficulty Level
              </label>
              <select
                value={scenario.difficulty}
                onChange={(e) => onUpdateScenario("difficulty", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {DIFFICULTY_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Scoring Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Scoring Categories
              </label>
              <div className="mt-2 space-y-2">
                {SCORING_CATEGORIES.map((category) => (
                  <label
                    key={category}
                    className="inline-flex items-center mr-4"
                  >
                    <input
                      type="checkbox"
                      checked={scenario.scoringCategories.includes(category)}
                      onChange={(e) => {
                        const newCategories = e.target.checked
                          ? [...scenario.scoringCategories, category]
                          : scenario.scoringCategories.filter(
                              (c) => c !== category
                            );
                        onUpdateScenario("scoringCategories", newCategories);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
