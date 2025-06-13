import { ProgressIndicator } from "../";
import "./SignUpStep.scss";
import { usePreferencesStore } from "../../store/usePreferencesStore";

interface SignUpStep2Props {
  toggleSelection: (type: "goals" | "interests", value: string) => void;
}

export const SignUpStep2 = ({ toggleSelection }: SignUpStep2Props) => {
  const { goals, userGoalIds, error, loading } = usePreferencesStore();
  if (loading)
    return (
      <div className="center-absolute">
        <ProgressIndicator />
      </div>
    );
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <label>What are your goals for using Autism Social?</label>
      <p className="form-helper">
        <small>Select all that apply</small>
      </p>
      <div className="goals-grid">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className={`checkbox-item ${
              userGoalIds.includes(goal.id) ? "selected" : ""
            }`}
            onClick={() => toggleSelection("goals", goal.goal)}
          >
            <span>{goal.goal}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignUpStep2;
