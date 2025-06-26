import { useNavigate, Link } from "react-router-dom";
import { FormLayout } from "../../components";
import { useState } from "react";
import { signIn } from "../../services/auth";
import "./LoginPage.scss";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { useUserStore } from "../../store/useUserStore";

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler({
    showToast: false,
    component: "LoginPage",
  });
  const { user: existingUser, logout } = useUserStore();
  const handleSubmit = async (data?: LoginFormValues) => {
    try {
      if (existingUser) {
        return navigate("/dashboard");
      }
      setIsLoading(true);
      setError(null);
      if (!data) {
        throw new Error("Please fill out all fields.");
      }
      const user = await signIn(data.email, data.password);

      if (!user) {
        throw new Error("Unable to load your account");
      }
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const err = handleError({ error, action: "login" });
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  if (existingUser) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Log in</h1>
          </div>
          <p className="auth-status-box">
            Looks like you're already logged in!
          </p>
          <div className="flex-content">
            <button onClick={logout} className="btn btn-tertiary">
              Log Out
            </button>

            <button onClick={() => handleSubmit()} className="btn btn-primary">
              Go to Dashboard
            </button>
          </div>

          <div className="login-footer">
            <p>
              Or <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Log in</h1>
        </div>

        <FormLayout<LoginFormValues>
          onSubmit={handleSubmit}
          submitText="Log in"
          description="Welcome back! Log in to continue chatting."
          isLoading={isLoading}
          error={error}
        >
          {({ register, formState: { errors } }) => (
            <>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
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
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
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
          )}
        </FormLayout>

        <div className="login-footer">
          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
