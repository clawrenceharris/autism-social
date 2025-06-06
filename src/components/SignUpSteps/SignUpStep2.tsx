import { useGoals } from "../../hooks/useGoals";
import type { SignUpFormValues } from "../../types";
import { ProgressIndicator } from "../";

interface SignUpStep2Props {
  formData: Partial<SignUpFormValues>;
  toggleSelection: (type: "goals" | "interests", value: string) => void;
}

export const SignUpStep2 = ({
  formData,
  toggleSelection,
}: SignUpStep2Props) => {
  const { goals, loading, error } = useGoals();

  if (true)
    return (
      <div className="center-absolute">
        <ProgressIndicator />
      </div>
    );
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="form-group">
      <label>What are your goals for using Autism Social?</label>
      <p className="form-helper">
        <small>Select all that apply</small>
      </p>
      <div className="goals-grid">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className={`checkbox-item ${
              formData.goals?.includes(goal.goal) ? "selected" : ""
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
