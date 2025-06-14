import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp } from "../../services/auth";
import { addUserInterests } from "../../services/interests";
import "./SignUpPage.scss";
import type { SignUpFormValues } from "../../types";

import { useSignUp } from "../../hooks/";
import { useToast } from "../../context/ToastContext";
import { createUser } from "../../services/user";
const NUM_STEPS = 4;
const SignUpPage = () => {
  const navigate = useNavigate();

  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { renderStep, step } = useSignUp({
    handleSubmit: (data) => handleSubmit(data),
    error,
    isLoading,
  });
  const handleSubmit = async (data: SignUpFormValues) => {
    console.log("Handle Submit");
    try {
      if (step < NUM_STEPS) {
        return;
      }
      console.log("Submitting!");

      setIsLoading(true);

      const user = await signUp(data.email!, data.password!);

      if (!user) throw new Error("Failed to create user");

      const { first_name, last_name } = data;
      await Promise.all([
        createUser({ user_id: user.id, first_name, last_name }),
        () => {
          if (data.interests?.length) {
            return addUserInterests(user.id, data.interests);
          }
        },
        () => {
          if (data.goals?.length) {
            return addUserInterests(user.id, data.goals);
          }
        },
      ]);

      showToast("Sign up was successful!", { type: "success" });
      navigate("/", { replace: true });
    } catch (err) {
      setError("Sign up failed: " + String(err));
      showToast("Sign up failed.", { type: "error" });

      console.error("Error signing up:", err);
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

        {renderStep()}
      </div>
    </div>
  );
};

export default SignUpPage;
