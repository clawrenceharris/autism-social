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
  stepStart?: number;
  isLoading?: boolean;
}

export const useOnboarding = ({
  onNext,
  onPrev,
  isLoading,
  stepStart,
  error,
  ...props
}: UseOnboardingProps) => {
  const [step, setStep] = useState(stepStart || 1);
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
  const handleSubmit = (data: Partial<SignUpFormValues>) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    nextStep();
    props.handleSubmit(data);
  };
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <FormLayout<SignUpFormValues>
            onSubmit={handleSubmit}
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
            }}
            submitText="Next"
            showsCancelButton={step != stepStart}
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
            }}
            submitText="Next"
            showsCancelButton={step != stepStart}
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
            onSubmit={handleSubmit}
            submitText="Complete"
            cancelText="Back"
            showsCancelButton={step != stepStart}
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
