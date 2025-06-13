import { useFormContext } from "react-hook-form";
import { useScenario } from "../../../context";
import { ProgressIndicator } from "../../";

const DialogueOnboardingModal = () => {
  const { dialogue, loading } = useScenario();
  const { register, formState: { errors } } = useFormContext<{ [key: string]: string }>();

  if (loading) {
    return (
      <div className="center-absolute">
        <ProgressIndicator />
      </div>
    );
  }

  if (!dialogue || !dialogue.placeholders || dialogue.placeholders.length === 0) {
    return (
      <div>
        <p>
          This dialogue doesn't require any additional information. You can start practicing right away!
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="description">
        Fill out the fields below so the dialogue engine can provide a realistic
        and personalized experience for you.
      </p>
      
      <div className="form-content">
        {dialogue.placeholders.map((placeholder, index) => {
          const fieldName = placeholder.toLowerCase().replace(/\s+/g, '_');
          const displayName = placeholder.charAt(0).toUpperCase() + placeholder.slice(1);
          
          return (
            <div key={index} className="form-group">
              <label className="form-label" htmlFor={fieldName}>
                {displayName}
              </label>
              <input
                id={fieldName}
                type="text"
                className={`form-input ${errors[fieldName] ? "error" : ""}`}
                placeholder={`Enter your ${placeholder.toLowerCase()}`}
                {...register(fieldName, {
                  required: `${displayName} is required for this dialogue`,
                })}
              />
              {errors[fieldName] && (
                <p className="form-error">{errors[fieldName]?.message}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DialogueOnboardingModal;