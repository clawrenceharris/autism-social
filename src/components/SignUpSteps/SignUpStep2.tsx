import { useGoals } from "../../hooks/queries/useGoals";
import { ProgressIndicator } from "../";
import "./SignUpStep.scss";

interface SignUpStep2Props {
  values: string[];
  toggleSelection: (type: "goals" | "interests", value: string) => void;
}

export const SignUpStep2 = ({ values, toggleSelection }: SignUpStep2Props) => {
  const { data: goals = [], isLoading, error } = useGoals();

  if (isLoading)
    return (
      <div className="center-absolute">
        <ProgressIndicator />
      </div>
    );
  if (error) return <div className="error">{error.message}</div>;

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
              values.includes(goal.goal) ? "selected" : ""
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
