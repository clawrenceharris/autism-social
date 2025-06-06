import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { SignUpFormValues } from "../../types";
import { CheckCircle, Shield, Users, Zap } from "lucide-react";
import "./SignUpStep5.scss";

interface SignUpStep5Props {
  register: UseFormRegister<SignUpFormValues>;
  errors: FieldErrors<SignUpFormValues>;
}

const SignUpStep5 = ({ register, errors }: SignUpStep5Props) => {
  return (
    <div className="signup-final-step">
      <div className="welcome-section">
        <div className="welcome-icon">
          <Zap size={48} />
        </div>
        <h2>You're Almost Ready!</h2>
        <p className="welcome-text">
          Complete this last step and unlock a world of immersive social learning. Your journey awaits!
        </p>
      </div>

      <div className="features-preview">
        <div className="feature-item">
          <CheckCircle className="feature-icon" size={20} />
          <span>Practice real-world conversations</span>
        </div>
        <div className="feature-item">
          <Shield className="feature-icon" size={20} />
          <span>Safe, judgment-free environment</span>
        </div>
        <div className="feature-item">
          <Users className="feature-icon" size={20} />
          <span>Personalized scenarios based on your goals</span>
        </div>
      </div>

      <div className="terms-section">
        <div className="terms-content">
          <h3>Ready to Begin?</h3>
          <p>
            By creating an account, you're joining a supportive community dedicated to 
            building social confidence. We're committed to providing a safe, private, 
            and personalized learning experience tailored to your needs.
          </p>
          
          <div className="checkbox-wrapper">
            <label className="custom-checkbox">
              <input 
                type="checkbox" 
                {...register("agreement", { 
                  required: "Please confirm your agreement to continue" 
                })}
              />
              <span className="checkmark"></span>
              <p className="checkbox-text">
                I agree to use this app responsibly and understand that my data will be kept secure and private
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

export default SignUpStep5;