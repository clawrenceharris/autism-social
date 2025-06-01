import { useState } from 'react';
import Modal from './Modal';
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
      <form onSubmit={handleSubmit} className="form-group">
        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-select"
          >
            {SCENARIO_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {title === 'Custom' && (
          <div className="form-group">
            <label className="form-label">Custom Category</label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="form-textarea"
            required
          />
        </div>

        {error && (
          <p className="error-text">{error}</p>
        )}

        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (title === 'Custom' && !customTitle)}
            className="btn btn-primary"
          >
            {isSubmitting ? 'Creating...' : 'Create Scenario'}
          </button>
        </div>
      </form>
    </Modal>
  );
}