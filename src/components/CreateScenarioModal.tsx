import { useState } from 'react';
import { Modal } from './Modal';
import { SCENARIO_CATEGORIES } from './ScenarioForm';
import { createScenario } from '../services/scenarios';

interface CreateScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateScenarioModal({ isOpen, onClose }: CreateScenarioModalProps) {
  const [title, setTitle] = useState(SCENARIO_CATEGORIES[0]);
  const [customTitle, setCustomTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const finalTitle = title === 'Custom' ? customTitle : title;
      await createScenario({
        title: finalTitle,
        description,
      });
      onClose();
      setTitle(SCENARIO_CATEGORIES[0]);
      setCustomTitle('');
      setDescription('');
    } catch (err) {
      setError('Failed to create scenario. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Scenario">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {SCENARIO_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {title === 'Custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Custom Category
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (title === 'Custom' && !customTitle)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isSubmitting ? 'Creating...' : 'Create Scenario'}
          </button>
        </div>
      </form>
    </Modal>
  );
}