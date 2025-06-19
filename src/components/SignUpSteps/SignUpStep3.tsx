import { ProgressIndicator } from "../";
import "./SignUpStep.scss";
import { usePreferencesStore } from "../../store/usePreferencesStore";
import type { SignUpFormValues } from "../../types";

interface SignUpStep2Props {
  toggleSelection: (type: "goals" | "interests", value: string) => void;
  formData: Pick<SignUpFormValues, "goals">;
}

export const SignUpStep3 = ({
  formData,
  toggleSelection,
}: SignUpStep2Props) => {
  const { goals, error, loading } = usePreferencesStore();

  if (loading)
    return (
      <>
        <ProgressIndicator />
      </>
    );
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <label>What are your goals for using Chatterbrain?</label>
      <p className="form-helper">
        <small>Select all that apply</small>
      </p>
      <div className="goals-grid">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className={`checkbox-item ${
              formData.goals.includes(goal.id) ? "selected" : ""
            }`}
            onClick={() => {
              toggleSelection("goals", goal.id);
            }}
          >
            <span>{goal.goal}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignUpStep3;
