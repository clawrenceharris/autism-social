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
        <p className="description">
          Unlock a world of immersive social learning. Your journey begins now
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
          <h3>Terms & Privacy</h3>
          <p>
            By creating an account, you agree to our commitment to providing a safe, 
            supportive learning environment. Your personal information and progress 
            will be kept private and secure.
          </p>
          
          <div className="checkbox-wrapper">
            <label className="custom-checkbox">
              <input 
                type="checkbox" 
                {...register("agreement", { 
                  required: "You must agree to the terms to continue" 
                })}
              />
              <span className="checkmark"></span>
              <p className="checkbox-text">
                I agree to the <a href="#" className="terms-link">Terms of Service</a> and 
                <a href="#" className="terms-link"> Privacy Policy</a>
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