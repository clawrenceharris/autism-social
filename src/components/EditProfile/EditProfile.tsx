import { useState } from "react";
import { useOnboarding } from "../../hooks/useOnboarding";
import { useAuth, useToast } from "../../context";
import type { SignUpFormValues } from "../../types";
import { updateUserInterests } from "../../services/interests";
import { useGoals, useInterests } from "../../hooks";
import { useUser } from "../../store/hooks";
import { updateUserGoals } from "../../services/user";

const EditProfile = ({ onSubmit }: { onSubmit: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: interests = [] } = useInterests();
  const { data: goals = [] } = useGoals();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { goals: userGoals, interests: userInterests } = useUser();
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

      showToast("Updated profile successfully!", "success");
      onSubmit();
    } catch {
      setError("Uh oh, Something went wrong. Please try again later.");
      showToast("Failed to update profile.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {renderStep({
        defaultValues: {
          interests: userInterests.map((i) => i.name),
          goals: userGoals.map((g) => g.goal),
        },
      })}
    </>
  );
};

export default EditProfile;
