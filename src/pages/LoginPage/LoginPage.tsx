import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check user role and redirect accordingly
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      const redirectPath = roleData?.role === 'admin' ? '/' : '/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <h1 style={{ marginBottom: "0.5rem" }}>Log in</h1>
          <p className="description" style={{ margin: 0 }}>
            Welcome to the Dialogue App! Log in to access interactive scenarios and practice your social skills in a safe, supportive environment.
          </p>
        </div>

        {error && (
          <div 
            role="alert" 
            className="error-text" 
            style={{ 
              padding: "0.75rem", 
              backgroundColor: "var(--color-red-100)", 
              borderRadius: "0.5rem",
              marginBottom: "1rem" 
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              aria-describedby="email-description"
            />
          </div>

          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required="true"
              aria-describedby="password-description"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: "100%" }}
            aria-label="Log in to your account"
          >
            Log in
          </button>

          <p style={{ textAlign: "center", marginTop: "1rem", marginBottom: 0 }}>
            Don't have an account?{" "}
            <Link 
              to="/signup" 
              className="text-primary"
              style={{ color: "var(--color-primary)" }}
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;