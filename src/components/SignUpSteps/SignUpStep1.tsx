import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { SignUpFormValues } from "../../types";

interface SignUpStep1Props {
  register: UseFormRegister<SignUpFormValues>;
  errors: FieldErrors<SignUpFormValues>;
}

const SignUpStep1 = ({ register, errors }: SignUpStep1Props) => {
  return (
    <>
      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          className={`form-input ${errors.name ? "error" : ""}`}
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && <p className="form-error">{errors.name.message}</p>}
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
