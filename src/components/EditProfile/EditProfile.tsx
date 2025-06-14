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
  const { fetchPreferences } = usePreferencesStore();
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

      await updateUserInterests(user.id, data.interests || []);

      await updateUserGoals(user.id, data.goals || []);

      showToast("Updated profile successfully!", { type: "success" });
      onSubmit();
    } catch {
      setError("Something went wrong. Please try again later.");
      showToast("Could not update profile.", { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };
  return <>{renderStep()}</>;
};

export default EditProfile;
