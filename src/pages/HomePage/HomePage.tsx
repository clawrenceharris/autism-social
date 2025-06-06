import { useNavigate } from "react-router-dom";
import { CreateScenarioModal } from "../../components";
import { useModal } from "../../context";
import { Plus, FolderOpen, Settings, Wand2 } from "lucide-react";
import "./HomePage.css";

const HomePage = () => {
  const { openModal } = useModal();
  const navigate = useNavigate();

  const handleCreateScenario = () => {
    openModal(<CreateScenarioModal />, "Create New Scenario");
  };

  return (
    <div className="container">
      <section className="hero">
        <h1>Scenario Builder</h1>
        <p className="description">
          Create and manage interactive dialogue scenarios for social skills
          training. Build branching conversations with scoring and feedback.
        </p>
      </section>

      <div className="feature-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <Wand2 size={24} />
          </div>
          <h2>Create New Scenario</h2>
          <p className="description">
            Start building a new interactive dialogue scenario from scratch. Use
            AI assistance to generate realistic conversations.
          </p>
          <button onClick={handleCreateScenario} className="btn btn-primary">
            <Plus size={20} />
            Create Scenario
          </button>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <FolderOpen size={24} />
          </div>
          <h2>Manage Scenarios</h2>
          <p className="description">
            View, edit, and organize your existing scenarios. Track progress and
            manage multiple dialogue variations.
          </p>
          <button
            onClick={() => navigate("/scenarios")}
            className="btn btn-primary"
          >
            View Scenarios
          </button>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <Settings size={24} />
          </div>
          <h2>Settings</h2>
          <p className="description">
            Customize your experience, manage scoring categories, and configure
            AI generation preferences.
          </p>
          <button
            onClick={() => navigate("/settings")}
            className="btn btn-primary"
          >
            Open Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
