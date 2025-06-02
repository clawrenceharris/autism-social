import { useScenarios } from "../../hooks";
import ScenarioListItem from "../../components/ScenarioListItem/ScenarioListItem";

const Scenarios = () => {
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
        {scenarios.map((item) => (
          <ScenarioListItem scenario={item} />
        ))}
      </div>
    </div>
  );
};

export default Scenarios;
