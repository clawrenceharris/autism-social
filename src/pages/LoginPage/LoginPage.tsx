import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { FormLayout } from "../../components";
import { useState } from "react";

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

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      // Check user role and redirect accordingly
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      const redirectPath = roleData?.role === 'admin' ? '/' : '/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" container flex items-center ">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Log in</h1>
          <p className="text-gray-600">
            Welcome to the Dialogue App! Log in to access interactive scenarios.
          </p>
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
                <label htmlFor="email" className="form-label">Email</label>
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
                <label htmlFor="password" className="form-label">Password</label>
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

        <p className="text-center mt-4">
          Don't have an account?{" "}
          <Link 
            to="/signup" 
            className="text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;