import type { UseFormRegister } from "react-hook-form";
import type { SignUpFormValues } from "../../types";

interface SignUpStep4Props {
  register: UseFormRegister<SignUpFormValues>;
}

const SignUpStep5 = ({ register }: SignUpStep4Props) => {
  return (
    <div className="form-group">
      <p>One More Step!</p>
      <label>
        I Agree
        <input type="checkbox" {...register("agreement")} />
      </label>
    </div>
  );
};
export default SignUpStep5;
