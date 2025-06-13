import { useEffect, useState } from "react";
import { useToast } from "../../context";
import type { SignUpFormValues } from "../../types";
import { updateUserInterests } from "../../services/interests";
import { updateUserGoals } from "../../services/user";
import { usePreferencesStore } from "../../store/usePreferencesStore";
import { useOnboarding } from "../../hooks";
import type { User } from "@supabase/supabase-js";

interface EditProfileProps {
  onSubmit: () => void;
  user: User;
}
const EditProfile = ({ onSubmit, user }: EditProfileProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { interests, goals, fetchPreferences } = usePreferencesStore();
  const { showToast } = useToast();
  useEffect(() => {
    fetchPreferences(user.id);
  }, [fetchPreferences, user.id]);
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
      if (!user) {
        throw Error("User could not be found");
      }
      setIsLoading(true);

      await updateUserInterests(
        user.id,
        interests
          .filter((i) => data.interests?.includes(i.name))
          .map((i) => i.id) || []
      );

      await updateUserGoals(
        user.id,
        goals.filter((g) => data.goals?.includes(g.goal)).map((g) => g.id)
      );

      showToast("Updated profile successfully!", { type: "success" });
      onSubmit();
    } catch {
      setError("Uh oh, Something went wrong. Please try again later.");
      showToast("Failed to update profile.", { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };
  return <>{renderStep()}</>;
};

export default EditProfile;
