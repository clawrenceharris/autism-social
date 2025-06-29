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
import type { FormLayoutProps } from "../components/layouts/FormLayout/FormLayout";
import { usePreferencesStore } from "../store/usePreferencesStore";
import { useProfileStore } from "../store/useUserStore";

interface UseSignUpProps {
  userId?: string;
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
  userId,
  isLoading,
  stepStart,
  stepEnd = 5,
  error,
  ...props
}: UseSignUpProps) => {
  const [step, setStep] = useState(stepStart || 1);
  const { userGoalIds, userInterestIds } = usePreferencesStore();
  const { user, profile } = useProfileStore();
  const { fetchUserPreferences, fetchGoals, fetchInterests } =
    usePreferencesStore();

  const [formData, setFormData] = useState<SignUpFormValues>({
    agreement: false,
    password: "",
    email: user?.email || "",
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    goals: userGoalIds || [],
    age: null,
    interests: userInterestIds || [],
  });
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      goals: userGoalIds,
      interests: userInterestIds,
    }));
  }, [userGoalIds, userInterestIds]);

  useEffect(() => {
    fetchInterests();
    fetchGoals();
  }, [fetchGoals, fetchInterests]);

  useEffect(() => {
    if (userId) {
      fetchUserPreferences(userId);
    }
  }, [fetchUserPreferences, userId]);
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
  const toggleSelection = (type: "goals" | "interests", value: string) => {
    setFormData((prev) => {
      const currentArray = prev[type] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];
      return { ...prev, [type]: newArray };
    });
  };
  const handleSubmit = (data: SignUpFormValues) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    props.handleSubmit(updatedData);
    nextStep();
  };
  const renderStep = (props?: FormLayoutProps<SignUpFormValues>) => {
    switch (step) {
      case 1:
        return (
          <FormLayout<SignUpFormValues>
            onSubmit={handleSubmit}
            submitText={step === stepEnd ? "Complete" : "Next"}
            isLoading={isLoading}
            defaultValues={formData}
            error={error}
            {...props}
          >
            {({ register, formState: { errors } }) => (
              <SignUpStep1 register={register} errors={errors} />
            )}
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
            onCancel={prevStep}
            error={error}
            {...props}
          >
            {({ register, formState: { errors } }) => (
              <SignUpStep2 register={register} errors={errors} />
            )}
          </FormLayout>
        );

      case 3:
        return (
          <FormLayout
            onSubmit={() => {
              handleSubmit(formData);
            }}
            submitText={step === stepEnd ? "Complete" : "Next"}
            showsCancelButton={step != stepStart}
            onCancel={prevStep}
            isLoading={isLoading}
            error={error}
            cancelText="Back"
            {...props}
          >
            <SignUpStep3
              formData={{ goals: formData.goals || [] }}
              toggleSelection={toggleSelection}
            />
          </FormLayout>
        );

      case 4:
        return (
          <FormLayout<SignUpFormValues>
            onSubmit={handleSubmit}
            submitText={step === stepEnd ? "Complete" : "Next"}
            cancelText="Back"
            showsCancelButton={step != stepStart}
            onCancel={prevStep}
            isLoading={isLoading}
            error={error}
            {...props}
          >
            <SignUpStep4
              formData={{ interests: formData.interests || [] }}
              toggleSelection={toggleSelection}
            />
          </FormLayout>
        );
      case 5:
        return (
          <FormLayout<SignUpFormValues>
            onSubmit={handleSubmit}
            submitText={step === stepEnd ? "Complete" : "Next"}
            cancelText="Back"
            showsCancelButton={step != stepStart}
            onCancel={prevStep}
            isLoading={isLoading}
            error={error}
            {...props}
          >
            {({ register, formState: { errors } }) => (
              <SignUpStep5 register={register} errors={errors} />
            )}
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
