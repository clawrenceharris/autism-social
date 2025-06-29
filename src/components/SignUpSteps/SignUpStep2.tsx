import { useFormContext } from "react-hook-form";
import type { SignUpFormValues } from "../../types";
import "./SignUpStep.scss";

const SignUpStep2 = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<SignUpFormValues>();
  return (
    <>
      <div className="form-group">
        <label htmlFor="first-name">First name</label>
        <input
          type="text"
          id="first-name"
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
        <label htmlFor="last-name">Last name</label>
        <input
          id="last-name"
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
        <label htmlFor="age">Age</label>
        <input
          id="age"
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
