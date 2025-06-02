import { useScenarios } from "../../hooks";
import ScenarioListItem from "../../components/ScenarioListItem/ScenarioListItem";
import "./ScenariosPage.css";
const ScenariosPage = () => {
  const { scenarios, loading, error } = useScenarios();
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>An error occured: {error}</div>;
  }

  return (
    <div>
      <div className="flex-column">
        {Object.entries(scenarios).map(([key, value]) => (
          <ScenarioListItem key={key} scenario={value} />
        ))}
      </div>
    </div>
  );
};

export default ScenariosPage;
