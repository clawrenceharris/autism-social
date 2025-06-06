import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { FormLayout } from "../../components";
import { signUp } from "../../services/auth";
import { addUserInterests } from "../../services/interests";
import "./SignUpPage.scss";
import { useToast } from "../../context";
import type { SignUpFormValues } from "../../types";

import {
  SignUpStep5,
  SignUpStep4,
  SignUpStep3,
  SignUpStep2,
  SignUpStep1,
} from "../../components/SignUpSteps";
const NUM_STEPS = 5;
const SignUpPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<SignUpFormValues>>({
    goals: [],
    interests: [],
  });
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: Partial<SignUpFormValues>) => {
    try {
      setError(null);
      const updatedData = { ...formData, ...data };
      setFormData(updatedData);

      if (step < NUM_STEPS) {
        setStep(step + 1);
        return;
      }

      setIsLoading(true);

      const { user, error: signUpError } = await signUp(
        updatedData.email!,
        updatedData.password!
      );

      if (signUpError) throw signUpError;
      if (!user) throw new Error("Failed to create user");

      let profilePhotoUrl = null;
      if (updatedData.profilePhoto) {
        const fileExt = updatedData.profilePhoto.name.split(".").pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from("profile-photos")
          .upload(fileName, updatedData.profilePhoto);

        if (uploadError) throw uploadError;
        if (uploadData) {
          const {
            data: { publicUrl },
          } = supabase.storage
            .from("profile-photos")
            .getPublicUrl(uploadData.path);
          profilePhotoUrl = publicUrl;
        }
      }

      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: user.id,
          name: updatedData.name,
          profile_photo_url: profilePhotoUrl,
        });

      if (profileError) throw profileError;

      if (updatedData.interests?.length) {
        const { data: interestsData } = await supabase
          .from("interests")
          .select("id, name")
          .in("name", updatedData.interests);

        if (interestsData) {
          await addUserInterests(
            user.id,
            interestsData.map((i) => i.id)
          );
        }
      }

      showToast("Sign up was successful!", "success");
      navigate("/", { replace: true });
    } catch (err) {
      setError("Sign up failed");
      console.error("Sign up error:", err);
    } finally {
      setIsLoading(false);
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
            onSubmit={() => handleSubmit({ goals: formData.goals })}
          
            showsCancelButton
            isLoading={isLoading}
            cancelText="Back"
            onCancle={() => setStep(step -1)}
            error={error}
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
            onSubmit={() => handleSubmit({ interests: formData.interests })}
            submitText="Next"
            showsCancelButton
            onCancel={() => setStep(step - 1)}
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
            showsCancelButton
            submitText="Next" 
            isLoading={isLoading}
            cancelText="Back"
            onCancle={() => setStep(step -1)}
          >
            {({ register }) => <SignUpStep4 register={register} />}
          </FormLayout>
        );
      case 5:
    console.log(formData);
        return (
          <FormLayout<SignUpFormValues>
            onSubmit={handleSubmit}
            submitText="Sign Up!"
            cancelText="Back"
            onCancle={() => setStep(step -1)}
            isLoading={isLoading}
          >
            {({ register }) => <SignUpStep5 register={register} />}
          </FormLayout>
        );
    }
  };

  return (
    <div className="form signup-container">
      <div className="signup-card">
        <div className="signup-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(step / NUM_STEPS) * 100}%` }}
            />
          </div>
          <p>
            Step {step} of {NUM_STEPS}
          </p>
        </div>

        {renderStep()}
        {/* <div className="form-actions">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="btn"
              disabled={isLoading}
            >
              Back
            </button>
          )}

          <button
            onClick={handleSubmit}
            type="button"
            className="btn btn-primary"
          >
            Next
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default SignUpPage;
