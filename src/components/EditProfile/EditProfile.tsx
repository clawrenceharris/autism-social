import { useState } from "react";
import { useToast } from "../../context";
import type { SignUpFormValues } from "../../types";
import { useSignUp } from "../../hooks";
import type { User } from "@supabase/supabase-js";
import {
  updateUserGoals,
  updateUserInterests,
} from "../../services/preferences";
import { updateUserProfile } from "../../services/user";

interface EditProfileProps {
  onSubmit: () => void;
  user: User;
}
const EditProfile = ({ onSubmit, user }: EditProfileProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const { renderStep, step } = useSignUp({
    handleSubmit: (data: SignUpFormValues) => handleSubmit(data),
    error,
    stepStart: 2,
    stepEnd: 4,
    isLoading,
  });

  const handleSubmit = async (data: SignUpFormValues) => {
    try {
      if (step < 4) {
        return;
      }
      if (!user) {
        throw Error("User could not be found");
      }
      setIsLoading(true);
      console.log({ goalss: data.goals });

      await Promise.all([
        updateUserInterests(user.id, data.interests || []),
        updateUserGoals(user.id, data.goals || []),
        updateUserProfile(user.id, {
          first_name: data.first_name,
          last_name: data.last_name,
          age: data.age,
        }),
      ]);

      showToast("Profile updated successfully!", { type: "success" });
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
