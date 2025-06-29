import { ProgressIndicator } from "../";
import "./SignUpStep.scss";
import type { SignUpFormValues } from "../../types";
import { useFormContext } from "react-hook-form";
import { usePreferencesStore } from "../../store/usePreferencesStore";

export const SignUpStep3 = () => {
  const { goals, loading, error } = usePreferencesStore();
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<SignUpFormValues>();
  const selectedGoalIds = watch("goals") || [];

  const toggleGoal = (goalId: string) => {
    const updatedGoals = selectedGoalIds.includes(goalId)
      ? selectedGoalIds.filter((id) => id !== goalId)
      : [...selectedGoalIds, goalId];
    setValue("goals", updatedGoals, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };
  if (loading) {
    return <ProgressIndicator />;
  }
  if (error) {
    return (
      <div className="content-centered-absolute">
        <p>Unable to load goals. You can skip this step and try again later.</p>
      </div>
    );
  }
  return (
    <div>
      <label>What are your goals for using Chatterbrain?</label>
      <p className="form-helper">
        <small>Select all that apply</small>
      </p>
      <div className="selection-list">
        {goals.map((goal) => {
          return (
            <div
              key={goal.id}
              className={`checkbox-item ${
                selectedGoalIds.includes(goal.id) ? "selected" : ""
              }`}
              onClick={() => toggleGoal(goal.id)}
            >
              <span>{goal.goal}</span>
            </div>
          );
        })}
      </div>
      {errors.goals && <p className="danger">{errors.goals.message}</p>}
    </div>
  );
};

export default SignUpStep3;
