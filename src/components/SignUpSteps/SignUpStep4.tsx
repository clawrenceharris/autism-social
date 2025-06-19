import { ProgressIndicator } from "../../components";
import { usePreferencesStore } from "../../store/usePreferencesStore";
import type { SignUpFormValues } from "../../types";
import "./SignUpStep.scss";

interface SignUpStep3Props {
  toggleSelection: (type: "goals" | "interests", value: string) => void;
  formData: Pick<SignUpFormValues, "interests">;
}

const SignUpStep4 = ({ formData, toggleSelection }: SignUpStep3Props) => {
  const { interests, error, loading } = usePreferencesStore();

  if (loading)
    return (
      <div className="center-absolute">
        <ProgressIndicator />
      </div>
    );
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <label>What are your interests?</label>
      <p className="form-helper">
        <small>Select all that apply</small>
      </p>
      <div className="interests-grid">
        {interests.map((interest) => (
          <div
            key={interest.id}
            className={`checkbox-item ${
              formData.interests.includes(interest.id) ? "selected" : ""
            }`}
            onClick={() => toggleSelection("interests", interest.id)}
          >
            <span>{interest.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignUpStep4;
