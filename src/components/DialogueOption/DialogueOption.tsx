import { useState } from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import type { Option } from "../../types";

interface DialogueOptionProps {
  option: Option;
  optionIndex: number;
  scoringCategories: string[];
  onRemove: () => void;
  onUpdate: (field: keyof Option, value: any) => void;
  onUpdateScore: (category: string, value: number) => void;
}

export function DialogueOption({
  option,
  optionIndex,
  scoringCategories,
  onRemove,
  onUpdate,
  onUpdateScore,
}: DialogueOptionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-white">
      <div className="flex justify-between items-start">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          Option {optionIndex + 1}
        </button>
        <button onClick={onRemove} className="text-red-600 hover:text-red-700">
          <Trash2 size={16} />
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Response Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Response Label
            </label>
            <input
              type="text"
              value={option.responseLabel}
              onChange={(e) => onUpdate("responseLabel", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Event Type
            </label>
            <input
              type="text"
              value={option.eventType}
              onChange={(e) => onUpdate("eventType", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Score Changes */}
          {scoringCategories.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Score Changes
              </label>
              <div className="grid grid-cols-2 gap-4">
                {scoringCategories.map((category) => (
                  <div key={category}>
                    <label className="block text-sm text-gray-600">
                      {category}
                    </label>
                    <select
                      value={option.scores[category] || 0}
                      onChange={(e) =>
                        onUpdateScore(category, Number(e.target.value))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value={0}>No Credit (0)</option>
                      <option value={1}>Full Credit (1)</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
