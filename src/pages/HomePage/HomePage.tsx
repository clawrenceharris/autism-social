import { CreateScenarioModal } from "../../components/modals";
import { useModal } from "../../context";
import "./HomePage.css";

const HomePage = () => {
  const { openModal } = useModal();

  const handleCreateScenario = () => {
    openModal(<CreateScenarioModal />, "Create New Scenario");
  };

  return (
    <div className="container">
      <h1>Scenario Builder</h1>
      <p className="description">
        Welcome to the Scenario Builder. Create and manage interactive dialogue
        scenarios compatible with XState.
      </p>
      <div className="home-grid">
        <button onClick={handleCreateScenario} className="card">
          <h2>Create New Scenario</h2>
          <p className="description">Start building a new interactive dialogue scenario from scratch.</p>
        </button>
        <button className="card">
          <h2>Manage Scenarios</h2>
          <p className="description">View, edit, and organize your existing scenarios.</p>
        </button>
        <button className="card">
          <h2>Settings</h2>
          <p className="description">Configure your preferences and manage your account.</p>
        </button>
      </div>
    </div>
  );
};

export default HomePage;