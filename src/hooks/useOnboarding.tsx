import { useState } from "react";
import { FormLayout } from "../components";
import type { SignUpFormValues } from "../types";
import {
  SignUpStep1,
  SignUpStep2,
  SignUpStep3,
  SignUpStep5,
} from "../components/SignUpSteps";

interface UseOnboardingProps {
  handleSubmit: (data: Partial<SignUpFormValues>) => void;
  onNext?: () => void;
  onPrev?: () => void;
  error?: string | null;
  isLoading?: boolean;
}

export const useOnboarding = ({
  handleSubmit,
  onNext,
  onPrev,
  isLoading,
  error,
}: UseOnboardingProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<SignUpFormValues>>({
    goals: [],
    interests: [],
  });
  const nextStep = () => {
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
  const renderStep = (s: number = step) => {
    switch (s) {
      case 1:
        return (
          <FormLayout<SignUpFormValues>
            onSubmit={(data) => {
              handleSubmit(data);
              nextStep();
            }}
            submitText="Next"
            isLoading={isLoading}
          >
            {({ register, formState: { errors } }) => (
              <SignUpStep1 register={register} errors={errors} />
            )}
          </FormLayout>
        );

      case 2:
        return (
          <FormLayout
            onSubmit={() => {
              handleSubmit({ goals: formData.goals });
              nextStep();
            }}
            submitText="Next"
            showsCancelButton
            isLoading={isLoading}
            cancelText="Back"
            onCancel={prevStep}
          >
            <>
              <SignUpStep2
                formData={formData}
                toggleSelection={toggleSelection}
              />
            </>
          </FormLayout>
        );

      case 3:
        return (
          <FormLayout
            onSubmit={() => {
              handleSubmit({ interests: formData.interests });
              nextStep();
            }}
            submitText="Next"
            showsCancelButton
            onCancel={prevStep}
            isLoading={isLoading}
            cancelText="Back"
          >
            <SignUpStep3
              formData={formData}
              toggleSelection={toggleSelection}
            />
          </FormLayout>
        );

      case 4:
        return (
          <FormLayout<SignUpFormValues>
            onSubmit={(data) => {
              handleSubmit(data);
              nextStep();
            }}
            submitText="Create Account"
            cancelText="Back"
            showsCancelButton
            onCancel={prevStep}
            isLoading={isLoading}
            error={error}
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
