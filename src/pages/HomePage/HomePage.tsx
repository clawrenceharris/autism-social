import { useState } from 'react';
import { CreateScenarioModal } from '../../components';
import './HomePage.css';

function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="home-container">
      <h1 className="home-title">Scenario Builder</h1>
      <p className="home-description">
        Welcome to the Scenario Builder. Create and manage interactive dialogue scenarios compatible with XState.
      </p>
      <div className="home-grid">
        <div className="card">
          <h2>Create New Scenario</h2>
          <p>Start building a new interactive dialogue scenario from scratch.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            Create Scenario
          </button>
        </div>
        <div className="card">
          <h2>Manage Scenarios</h2>
          <p>View, edit, and organize your existing scenarios.</p>
        </div>
        <div className="card">
          <h2>Settings</h2>
          <p>Configure your preferences and manage your account.</p>
        </div>
      </div>

      <CreateScenarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default HomePage;