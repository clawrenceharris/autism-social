import type { UseFormRegister } from "react-hook-form";
import type { SignUpFormValues } from "../../types";
import "./SignUpStep.scss";

interface SignUpStep4Props {
  register: UseFormRegister<SignUpFormValues>;
}

const SignUpStep4 = ({ register }: SignUpStep4Props) => {
  return (
    <div className="form-group">
      <label>Profile Photo (Optional)</label>
      <input
        type="file"
        accept="image/*"
        className="form-input"
        {...register("profilePhoto")}
      />
    </div>
  );
};
export default SignUpStep4;
