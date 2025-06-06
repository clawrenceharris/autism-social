import { useInterests } from "../../hooks/useInterests";
import type { SignUpFormValues } from "../../types";

interface SignUpStep3Props {
  formData: Partial<SignUpFormValues>;
  toggleSelection: (type: "goals" | "interests", value: string) => void;
}

export const SignUpStep3 = ({ formData, toggleSelection }: SignUpStep3Props) => {
  const { interests, loading, error } = useInterests();

  if (loading) return <div>Loading interests...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="form-group">
      <label>What are your interests?</label>
      <p className="form-helper">
        <small>Select all that apply</small>
      </p>
      <div className="interests-grid">
        {interests.map((interest) => (
          <div
            key={interest.id}
            className={`checkbox-item ${
              formData.interests?.includes(interest.name) ? "selected" : ""
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