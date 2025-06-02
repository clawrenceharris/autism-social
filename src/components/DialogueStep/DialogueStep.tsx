import { useState } from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import type { Step, Option } from "../../types";
import { DialogueOption } from "../";

interface DialogueStepProps {
  step: Step;
  stepIndex: number;
  scoringCategories: string[];
  onRemove: () => void;
  onUpdate: (field: keyof Step, value: any) => void;
  onAddOption: () => void;
  onRemoveOption: (optionIndex: number) => void;
  onUpdateOption: (
    optionIndex: number,
    field: keyof Option,
    value: any
  ) => void;
  onUpdateScore: (optionIndex: number, category: string, value: number) => void;
}

const DialogueStep = ({
  step,
  stepIndex,
  scoringCategories,
  onRemove,
  onUpdate,
  onAddOption,
  onRemoveOption,
  onUpdateOption,
  onUpdateScore,
}: DialogueStepProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
      <div className="flex justify-between items-start">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-md font-medium text-gray-700 hover:text-gray-900"
        >
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          Step {stepIndex + 1}
        </button>
        <button onClick={onRemove} className="text-red-600 hover:text-red-700">
          <Trash2 size={20} />
        </button>
      </div>

      {isExpanded && (
        <>
          {/* NPC Line */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              NPC Line
            </label>
            <textarea
              value={step.npcLine}
              onChange={(e) => onUpdate("npcLine", e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-700">Options</h4>
              <button
                onClick={onAddOption}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                Add Option
              </button>
            </div>

            {step.options.map((option, optionIndex) => (
              <DialogueOption
                key={optionIndex}
                option={option}
                optionIndex={optionIndex}
                scoringCategories={scoringCategories}
                onRemove={() => onRemoveOption(optionIndex)}
                onUpdate={(field, value) =>
                  onUpdateOption(optionIndex, field, value)
                }
                onUpdateScore={(category, value) =>
                  onUpdateScore(optionIndex, category, value)
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DialogueStep;
