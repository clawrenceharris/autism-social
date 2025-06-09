import { useInterests } from "../../hooks/queries/useInterests";
import { ProgressIndicator } from "../../components";
import "./SignUpStep.scss";

interface SignUpStep3Props {
  values: string[];
  toggleSelection: (type: "goals" | "interests", value: string) => void;
}

const SignUpStep3 = ({ values, toggleSelection }: SignUpStep3Props) => {
  const { data: interests = [], isLoading, error } = useInterests();

  if (isLoading)
    return (
      <div className="center-absolute">
        <ProgressIndicator />
      </div>
    );
  if (error) return <div className="error">{error.message}</div>;

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
