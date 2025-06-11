import { ProgressIndicator } from "../../components";
import { usePreferencesStore } from "../../store/usePreferencesStore";
import "./SignUpStep.scss";

interface SignUpStep3Props {
  values: string[];
  toggleSelection: (type: "goals" | "interests", value: string) => void;
}

const SignUpStep3 = ({ values, toggleSelection }: SignUpStep3Props) => {
  const { interests, loading, error } = usePreferencesStore();

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
              values.includes(interest.name) ? "selected" : ""
            }`}
            onClick={() => toggleSelection("interests", interest.name)}
          >
            <span>{interest.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignUpStep3;
