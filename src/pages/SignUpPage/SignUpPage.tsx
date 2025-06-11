import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { signUp } from "../../services/auth";
import { addUserInterests } from "../../services/interests";
import "./SignUpPage.scss";
import type { SignUpFormValues } from "../../types";

import { useOnboarding } from "../../hooks/";
import { useToast } from "../../context/ToastContext";
const NUM_STEPS = 4;
const SignUpPage = () => {
  const navigate = useNavigate();

  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { renderStep, step } = useOnboarding({
    handleSubmit: () => handleSubmit,
    error,
    isLoading,
  });
  const handleSubmit = async (data: Partial<SignUpFormValues>) => {
    try {
      if (step < NUM_STEPS) {
        return;
      }

      setIsLoading(true);

      const { user, error: signUpError } = await signUp(
        data.email!,
        data.password!
      );

      if (signUpError) throw signUpError;
      if (!user) throw new Error("Failed to create user");

      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: user.id,
          name: data.name,
        });

      if (profileError) throw profileError;

      if (data.interests?.length) {
        const { data: interestsData } = await supabase
          .from("interests")
          .select("id, name")
          .in("name", data.interests);

        if (interestsData) {
          await addUserInterests(
            user.id,
            interestsData.map((i) => i.id)
          );
        }
      }
      if (data.goals?.length) {
        const { data: goalsData } = await supabase
          .from("goals")
          .select("id, goal")
          .in("goal", data.goals);

        if (goalsData) {
          await addUserInterests(
            user.id,
            goalsData.map((i) => i.id)
          );
        }
      }
      showToast("Sign up was successful!", { type: "success" });
      navigate("/", { replace: true });
    } catch (err) {
      setError("Sign up failed");
      console.error("Sign up error:", err);
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
