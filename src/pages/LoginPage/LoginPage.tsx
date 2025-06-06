import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FormLayout } from "../../components";
import { useState } from "react";
import { signIn, getUserRole } from "../../services/auth";
import "./LoginPage.scss";

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      const { user, error: signInError } = await signIn(data.email, data.password);

      if (signInError) throw signInError;
      if (!user) throw new Error("No user data received");

      const { role, error: roleError } = await getUserRole(user.id);
      
      if (roleError) {
        console.error("Error fetching user role:", roleError);
      }

      const redirectPath = role === 'admin' ? '/admin' : '/';
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setError(err.message || "Failed to log in");

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Log in</h1>
          <p>Welcome to the Dialogue App! Log in to access interactive scenarios.</p>
        </div>

        <FormLayout<LoginFormValues>
          onSubmit={handleSubmit}
          submitText="Log in"
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
                  className={`form-input ${errors.email ? 'error' : ''}`}
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
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
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

        <div className="login-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;