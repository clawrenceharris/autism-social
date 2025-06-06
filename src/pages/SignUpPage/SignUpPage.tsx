import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { FormLayout } from "../../components";
import { signUp } from "../../services/auth";
import { getInterests, type Interest, addUserInterests } from "../../services/interests";
import "./SignUpPage.scss";

interface SignUpFormValues {
  name: string;
  email: string;
  password: string;
  goals: string[];
  interests: string[];
  profilePhoto?: File;
}

const GOALS = [
  "Improve my social skills",
  "Practice tough conversations",
  "Build my confidence in social situations",
  "Learn to read social cues better",
  "Handle intimidating interactions",
  "Manage anxiety in social settings",
  "Make and maintain relationships",
  "Other"
];

const SignUpPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<SignUpFormValues>>({
    goals: [],
    interests: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableInterests, setAvailableInterests] = useState<Interest[]>([]);

  useEffect(() => {
    const loadInterests = async () => {
      try {
        const interests = await getInterests();
        setAvailableInterests(interests);
      } catch (err) {
        console.error("Failed to load interests:", err);
        setError("Failed to load interests. Please try again.");
      }
    };

    loadInterests();
  }, []);

  const handleSubmit = async (data: Partial<SignUpFormValues>) => {
    try {
      setError(null);
      const updatedData = { ...formData, ...data };
      setFormData(updatedData);

      if (step < 4) {
        setStep(step + 1);
        return;
      }

      setIsLoading(true);

      // 1. Sign up the user
      const { user, error: signUpError } = await signUp(
        updatedData.email!,
        updatedData.password!
      );

      if (signUpError) throw signUpError;
      if (!user) throw new Error("Failed to create user");

      // 2. Upload profile photo if provided
      let profilePhotoUrl = null;
      if (updatedData.profilePhoto) {
        const fileExt = updatedData.profilePhoto.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, updatedData.profilePhoto);

        if (uploadError) throw uploadError;
        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(uploadData.path);
          profilePhotoUrl = publicUrl;
        }
      }

      // 3. Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          name: updatedData.name,
          goals: updatedData.goals,
          profile_photo_url: profilePhotoUrl
        });

      if (profileError) throw profileError;

      // 4. Add user interests
      const selectedInterests = availableInterests
        .filter(interest => updatedData.interests?.includes(interest.name))
        .map(interest => interest.id);

      await addUserInterests(user.id, selectedInterests);

      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (type: 'goals' | 'interests', value: string) => {
    setFormData(prev => {
      const currentArray = prev[type] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [type]: newArray };
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <FormLayout<Pick<SignUpFormValues, "name" | "email" | "password">>
            onSubmit={handleSubmit}
            submitText="Next"
            isLoading={isLoading}
            error={error}
          >
            {({ register, formState: { errors } }) => (
              <>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    className={`form-input ${errors.name ? "error" : ""}`}
                    {...register("name", { required: "Name is required" })}
                  />
                  <p className="description">What would you like to be called?</p>
                  {errors.name && (
                    <p className="form-error">{errors.name.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className={`form-input ${errors.email ? "error" : ""}`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                  />
                  {errors.email && (
                    <p className="form-error">{errors.email.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    className={`form-input ${errors.password ? "error" : ""}`}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                      }
                    })}
                  />
                  {errors.password && (
                    <p className="form-error">{errors.password.message}</p>
                  )}
                </div>
              </>
            )}
          </FormLayout>
        );

      case 2:
        return (
          <FormLayout
            onSubmit={() => handleSubmit({ goals: formData.goals })}
            submitText="Next"
            isLoading={isLoading}
            error={error}
          >
            <div className="form-group">
              <label>What are your goals for using Autism Social?</label>
              <p className="form-helper"><small>Select all that apply</small></p>
              <div className="goals-grid">
                {GOALS.map((goal) => (
                  <div
                    key={goal}
                    className={`checkbox-item ${formData.goals?.includes(goal) ? 'selected' : ''}`}
                    onClick={() => toggleSelection('goals', goal)}
                  >
                    <span>{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          </FormLayout>
        );

      case 3:
        return (
          <FormLayout
            onSubmit={() => handleSubmit({ interests: formData.interests })}
            submitText="Next"
            isLoading={isLoading}
            error={error}
          >
            <div className="form-group">
              <label>What are your interests?</label>
              <p className="form-helper"><small>Select all that apply</small></p>
              <div className="interests-grid">
                {availableInterests.map((interest) => (
                  <div
                    key={interest.id}
                    className={`checkbox-item ${formData.interests?.includes(interest.name) ? 'selected' : ''}`}
                    onClick={() => toggleSelection('interests', interest.name)}
                  >
                    <span>{interest.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </FormLayout>
        );

      case 4:
        return (
          <FormLayout<Pick<SignUpFormValues, "profilePhoto">>
            onSubmit={handleSubmit}
            submitText="Complete Sign Up"
            isLoading={isLoading}
            error={error}
          >
            {({ register }) => (
              <div className="form-group">
                <label>Profile Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-input"
                  {...register("profilePhoto")}
                />
              </div>
            )}
          </FormLayout>
        );
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
          <p>Step {step} of 4</p>
        </div>

        {renderStep()}
      </div>
    </div>
  );
};

export default SignUpPage;