import { useEffect, useState } from "react";
import { FormLayout } from "../components";
import type { SignUpFormValues } from "../types";
import {
  SignUpStep1,
  SignUpStep2,
  SignUpStep3,
  SignUpStep4,
  SignUpStep5,
} from "../components/SignUpSteps";
import { usePreferencesStore } from "../store/usePreferencesStore";
import { useProfileStore } from "../store/useProfileStore";
import { useAuth } from "../context";
import type { FormLayoutProps } from "../components/layouts/FormLayout/FormLayout";

interface UseSignUpProps {
  handleSubmit: (data: SignUpFormValues) => void;
  onNext?: () => void;
  onPrev?: () => void;
  error?: string | null;
  stepStart?: number;
  stepEnd?: number;

  isLoading?: boolean;
}

const useSignUp = ({
  onNext,
  onPrev,
  isLoading,
  stepStart,
  stepEnd = 5,
  error,
  ...props
}: UseSignUpProps) => {
  const [step, setStep] = useState(stepStart || 1);
  const { userGoalIds, userInterestIds } = usePreferencesStore();
  const { profile } = useProfileStore();
  const { user } = useAuth();
  const { fetchUserPreferences, fetchGoals, fetchInterests } =
    usePreferencesStore();

  const [formData, setFormData] = useState<SignUpFormValues>({
    agreement: false,
    password: "",
    email: "",
    first_name: "",
    last_name: "",
    goals: [],
    age: null,
    interests: [],
  });
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      email: user?.email || "",
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      goals: userGoalIds || [],
      age: profile?.age || 0,
      interests: userInterestIds || [],
    }));
  }, [profile, user, userGoalIds, userInterestIds]);

  useEffect(() => {
    fetchInterests();
    fetchGoals();
  }, [fetchGoals, fetchInterests]);

  useEffect(() => {
    if (user) {
      fetchUserPreferences(user.id);
    }
  }, [fetchUserPreferences, user]);
  const nextStep = () => {
    if (step === stepEnd) {
      return;
    }
    setStep(step + 1);
    if (onNext) {
      onNext();
    }
  };
  const prevStep = () => {
    setStep(step - 1);
    if (onPrev) {
      onPrev();
    }
  };

  const handleSubmit = (data: SignUpFormValues) => {
    const updatedData = { ...formData, ...data };
    console.log({ updatedData });
    setFormData(updatedData);
    props.handleSubmit(updatedData);
    nextStep();
  };
  const renderStep = (props?: FormLayoutProps<SignUpFormValues>) => {
    switch (step) {
      case 1:
        return (
          <FormLayout<SignUpFormValues>
            {...props}
            onSubmit={handleSubmit}
            submitText={step === stepEnd ? "Complete" : "Next"}
            isLoading={isLoading}
            defaultValues={formData}
            error={error}
          >
            <SignUpStep1 />
          </FormLayout>
        );

      case 2:
        return (
          <FormLayout<SignUpFormValues>
            onSubmit={handleSubmit}
            submitText={step === stepEnd ? "Complete" : "Next"}
            showsCancelButton={step != stepStart}
            isLoading={isLoading}
            cancelText="Back"
            defaultValues={formData}
            onCancel={prevStep}
            error={error}
          >
            <SignUpStep2 />
          </FormLayout>
        );

      case 3:
        return (
          <FormLayout
            {...props}
            onSubmit={handleSubmit}
            submitText={step === stepEnd ? "Complete" : "Next"}
            showsCancelButton={step != stepStart}
            onCancel={prevStep}
            isLoading={isLoading}
            defaultValues={formData}
            error={error}
            cancelText="Back"
          >
            <SignUpStep3 />
          </FormLayout>
        );

      case 4:
        return (
          <FormLayout<SignUpFormValues>
            {...props}
            onSubmit={handleSubmit}
            submitText={step === stepEnd ? "Complete" : "Next"}
            cancelText="Back"
            showsCancelButton={step != stepStart}
            onCancel={prevStep}
            defaultValues={formData}
            isLoading={isLoading}
            error={error}
          >
            <SignUpStep4 />
          </FormLayout>
        );
      case 5:
        return (
          <FormLayout<SignUpFormValues>
            {...props}
            onSubmit={handleSubmit}
            submitText={step === stepEnd ? "Complete" : "Next"}
            cancelText="Back"
            showsCancelButton={step != stepStart}
            onCancel={prevStep}
            isLoading={isLoading}
            defaultValues={formData}
            error={error}
          >
            <SignUpStep5 />
          </FormLayout>
        );
    }
  };
  return {
    step,
    nextStep,
    prevStep,

    renderStep,
  };
};

export default useSignUp;
