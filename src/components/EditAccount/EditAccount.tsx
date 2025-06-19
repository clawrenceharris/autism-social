import { useState } from "react";
import { useToast } from "../../context";
import type { SignUpFormValues } from "../../types";
import { useSignUp } from "../../hooks";
import type { User } from "@supabase/supabase-js";
import { updateUser } from "../../services/auth";

interface EditAccountProps {
  onSubmit: () => void;
  user: User;
}
const NUM_STEPS = 1;
const EditAccount = ({ onSubmit, user }: EditAccountProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const { renderStep, step } = useSignUp({
    handleSubmit: (data: Partial<SignUpFormValues>) => handleSubmit(data),
    error,
    stepStart: 1,
    stepEnd: NUM_STEPS,
    isLoading,
  });

  const handleSubmit = async (data: Partial<SignUpFormValues>) => {
    try {
      if (step < NUM_STEPS) {
        return;
      }
      if (!user) {
        throw Error("User could not be found");
      }
      setIsLoading(true);

      const { email, password } = data;
      await updateUser({ email, password });

      showToast("Account updated successfully!", { type: "success" });
      onSubmit();
    } catch {
      setError("Something went wrong. Please try again later.");
      showToast("Could not update profile.", { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      {renderStep({
        description:
          "Update your account settings. Changing your email or password will send a confirmation link to your current email address.",
      })}
    </>
  );
};

export default EditAccount;
