import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "../../services/auth";
import "./SignUpPage.scss";
import type { SignUpFormValues } from "../../types";
import { useSignUp } from "../../hooks/";
import { useToast } from "../../context/ToastContext";
import { createUserProfile } from "../../services/user";

import { useErrorHandler } from "../../hooks";
import {
  updateUserGoals,
  updateUserInterests,
} from "../../services/preferences";

const NUM_STEPS = 5;

const SignUpPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler({
    showToast: false,
    component: "SignUpPage",
  });

  const { renderStep, step } = useSignUp({
    handleSubmit: (data) => handleSubmit(data),
    error,
    isLoading,
  });

  const handleSubmit = async (data: SignUpFormValues) => {
    try {
      if (step < NUM_STEPS) {
        return;
      }

      setIsLoading(true);
      setError(null);

      const user = await signUp(data.email, data.password);
      if (!user) {
        throw new Error("Failed to create user");
      }
      const { first_name, last_name } = data;
      await createUserProfile({ user_id: user.id, first_name, last_name });
      if (data.interests?.length) {
        await updateUserInterests(user.id, data.interests);
      }
      if (data.goals?.length) {
        await updateUserGoals(user.id, data.goals);
      }

      showToast("Sign up was successful!", { type: "success" });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const err = handleError({ error, action: "sign up" });
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form signup-container">
      <div className="signup-card">
        <div className="signup-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(step / NUM_STEPS) * 100}%` }}
            />
          </div>
          <p>
            Step {step} of {NUM_STEPS}
          </p>
        </div>

        {renderStep({
          description:
            step !== NUM_STEPS
              ? "Sign up to start practicing and join the Chatterbrain community."
              : undefined,
        })}
        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;