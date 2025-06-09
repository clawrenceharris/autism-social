import { useState } from "react";
import { useOnboarding } from "../../hooks/useOnboarding";
import { useAuth, useToast } from "../../context";
import type { SignUpFormValues } from "../../types";
import { supabase } from "../../lib/supabase";
import { updateUserInterests } from "../../services/interests";
import { updateUserGoals } from "../../services/goals";

const EditProfile = ({ onSubmit }: { onSubmit: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { user } = useAuth();
  const { renderStep, step } = useOnboarding({
    handleSubmit: (data: Partial<SignUpFormValues>) => handleSubmit(data),
    error,
    stepStart: 2,
    stepEnd: 3,
    isLoading,
  });

  const handleSubmit = async (data: Partial<SignUpFormValues>) => {
    try {
      if (step < 3) {
        return;
      }
      setIsLoading(true);
      if (!user) {
        throw Error("User could not be found");
      }

      // Update interests if provided
      if (data.interests?.length) {
        const { data: interestsData } = await supabase
          .from("interests")
          .select("id, name")
          .in("name", data.interests);

        if (interestsData) {
          await updateUserInterests(
            user.id,
            interestsData.map((i) => i.id)
          );
        }
      } else {
        // If no interests selected, remove all existing interests
        await updateUserInterests(user.id, []);
      }

      // Update goals if provided
      if (data.goals?.length) {
        const { data: goalsData } = await supabase
          .from("goals")
          .select("id, goal")
          .in("goal", data.goals);

        if (goalsData) {
          await updateUserGoals(
            user.id,
            goalsData.map((i) => i.id)
          );
        }
      } else {
        // If no goals selected, remove all existing goals
        await updateUserGoals(user.id, []);
      }

      showToast("Updated profile successfully!", "success");
      onSubmit();
    } catch {
      setError("Uh oh, Something went wrong. Please try again later.");
      showToast("Failed to update profile.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return <>{renderStep()}</>;
};

export default EditProfile;
