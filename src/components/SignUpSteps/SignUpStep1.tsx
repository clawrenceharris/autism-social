import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { SignUpFormValues } from "../../types";
import "./SignUpStep.scss";

interface SignUpStep1Props {
  register: UseFormRegister<SignUpFormValues>;
  errors: FieldErrors<SignUpFormValues>;
}

const SignUpStep1 = ({ register, errors }: SignUpStep1Props) => {
  return (
    <>
      <p className="description">
        Welcome to Autism Social - your personalized platform for building
        social confidence through interactive scenarios. Sign up to get started!
      </p>
      <div className="form-group">
        <label>First name</label>
        <input
          type="text"
          className={`form-input ${errors.name ? "error" : ""}`}
          {...register("first_name", {
            required: "First name is required",
            maxLength: {
              value: 25,
              message: "First name should not be greater than 25 characters",
            },
          })}
        />
        {errors.first_name && (
          <p className="form-error">{errors.first_name.message}</p>
        )}
      </div>
      <div className="form-group">
        <label>Last name</label>
        <input
          type="text"
          className={`form-input ${errors.name ? "error" : ""}`}
          {...register("last_name", {
            required: "Last name is required",
            maxLength: {
              value: 25,
              message: "Last name should not be greater than 25 characters",
            },
          })}
        />
        {errors.first_name && (
          <p className="form-error">{errors.first_name.message}</p>
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
              message: "Invalid email address",
            },
          })}
        />
        {errors.email && <p className="form-error">{errors.email.message}</p>}
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
              message: "Password must be at least 6 characters",
            },
          })}
        />
        {errors.password && (
          <p className="form-error">{errors.password.message}</p>
        )}
      </div>
    </>
  );
};

export default SignUpStep1;
