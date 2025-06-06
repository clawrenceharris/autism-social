import { UseFormRegister } from "react-hook-form";
import type { SignUpFormValues } from "../../types";

interface SignUpStep4Props {
  register: UseFormRegister<SignUpFormValues>;
}

export const SignUpStep4 = ({ register }: SignUpStep4Props) => {
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