import { useFormContext } from "react-hook-form";
import type { Dialogue } from "../../../types";

interface StartDialogueModalProps {
  dialogue: Dialogue;
  placeholders: string[];
}

const StartDialogueModal = ({
  placeholders,
  dialogue,
}: StartDialogueModalProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<{ [key: string]: string }>();

  return (
    <div>
      {dialogue.form_helper && (
        <p className="description">{dialogue.form_helper}</p>
      )}

      <div className="form-content">
        {placeholders.map((placeholder, index) => {
          const fieldName = placeholder.toLowerCase().replace("_", " ");
          const displayName =
            placeholder.charAt(0).toUpperCase() +
            placeholder.slice(1).replace("_", " ");

          return (
            <div key={index} className="form-group">
              <label className="form-label" htmlFor={fieldName}>
                {displayName}
              </label>
              <input
                id={fieldName}
                type="text"
                className={`form-input ${errors[fieldName] ? "error" : ""}`}
                placeholder={`Enter ${fieldName}`}
                {...register(placeholder, {
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

export default StartDialogueModal;
