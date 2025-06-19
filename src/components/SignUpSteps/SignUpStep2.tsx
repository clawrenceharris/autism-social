import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { SignUpFormValues } from "../../types";
import "./SignUpStep.scss";

interface SignUpStep1Props {
  register: UseFormRegister<SignUpFormValues>;
  errors: FieldErrors<SignUpFormValues>;
}

const SignUpStep2 = ({ register, errors }: SignUpStep1Props) => {
  return (
    <>
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
        <label>Age</label>
        <input
          type="number"
          className={`form-input ${errors.email ? "error" : ""}`}
          {...register("age", {
            required: "Age is required",
            validate: (age) => {
              if (age && age < 16) {
                return "You must be at least 16 years old to sign up";
              }
              return true;
            },
          })}
        />
        {errors.age && <p className="form-error">{errors.age.message}</p>}
      </div>
    </>
  );
};

export default SignUpStep2;
