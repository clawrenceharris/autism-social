import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { SignUpFormValues } from "../../types";
import "./SignUpStep.scss";

interface SignUpStep5Props {
  register: UseFormRegister<SignUpFormValues>;
  errors: FieldErrors<SignUpFormValues>;
}

const SignUpStep6 = ({ register, errors }: SignUpStep5Props) => {
  return (
    <div className="signup-final-step">
      <div className="welcome-section">
        <h2>You're Almost Ready!</h2>
        <p className="welcome-text">
          Complete this last step before you go on to start chatting!
        </p>
      </div>

      <div className="terms-section">
        <div className="terms-content">
          <p>
            By creating an account, you're joining a supportive community
            dedicated to fostering social growth. We're committed to providing a
            safe, private, and personalized experience tailored to your needs.
          </p>

          <div className="checkbox-wrapper">
            <label className="custom-checkbox">
              <input
                type="checkbox"
                {...register("agreement", {
                  required: "Please confirm your agreement to continue",
                })}
              />
              <span className="checkmark"></span>
              <p className="checkbox-text">
                I agree to use this app responsibly and understand that my data
                will be kept secure and private and may be used to improve user
                experience.
              </p>
            </label>
            {errors.agreement && (
              <p className="form-error">{errors.agreement.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpStep6;
