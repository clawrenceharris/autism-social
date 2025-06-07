import { useState } from "react";
import { useOnboarding } from "../../hooks/useOnboarding";

const EditProfile = () => {
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [step, setStep] = useState(2);
  const { renderStep } = useOnboarding({
    handleSubmit: () => handleSubmit,
    error,
    isLoading,
    onNext: () => setStep(step + 1),
    onPrev: () => setStep(step - 1),
  });
  const handleSubmit = () => {};

  return <>{renderStep(step)}</>;
};

export default EditProfile;
