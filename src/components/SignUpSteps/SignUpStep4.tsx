import { ProgressIndicator } from "../";
import "./SignUpStep.scss";
import type { SignUpFormValues } from "../../types";
import { useFormContext } from "react-hook-form";
import { usePreferencesStore } from "../../store/usePreferencesStore";

export const SignUpStep4 = () => {
  const { interests, loading, error } = usePreferencesStore();
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<SignUpFormValues>();
  const selectedInterestIds = watch("interests") || [];

  const toggleGoal = (goalId: string) => {
    const updatedInterests = selectedInterestIds.includes(goalId)
      ? selectedInterestIds.filter((id) => id !== goalId)
      : [...selectedInterestIds, goalId];
    setValue("interests", updatedInterests, {
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
        <p>
          Unable to load interests. You can skip this step and try again later.
        </p>
      </div>
    );
  }
  return (
    <div>
      <label>What kind of stuff captures your interests</label>
      <p className="form-helper">
        <small>Select all that apply</small>
      </p>
      <div className="selection-list">
        {interests.map((interest) => {
          return (
            <div
              key={interest.id}
              className={`checkbox-item ${
                selectedInterestIds.includes(interest.id) ? "selected" : ""
              }`}
              onClick={() => toggleGoal(interest.id)}
            >
              <span>{interest.name}</span>
            </div>
          );
        })}
      </div>
      {errors.interests && <p className="danger">{errors.interests.message}</p>}
    </div>
  );
};

export default SignUpStep4;
