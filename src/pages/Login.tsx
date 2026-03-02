import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

const WEBSITE: "affordable" | "mid" | "luxury" = "affordable";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // ✅ use context for both email/pass + google
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const isAnyLoading = isLoading || isGoogleLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email, password);

      if (success) {
        toast.success("Welcome back!");
        navigate("/");
        // ✅ no reload needed if context updates UI properly
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential?: string) => {
    if (!credential) {
      toast.error("Google sign-in failed (no credential).");
      return;
    }

    setIsGoogleLoading(true);
    try {
      // ✅ context handles saving token/user
      const ok = await googleLogin(credential);

      if (ok) {
        toast.success("Logged in with Google!");
        navigate("/");
      } else {
        toast.error("Google authentication failed");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Google authentication failed");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center md:justify-end p-4 md:pr-16"
      style={{
        background: `linear-gradient(135deg, hsl(43 100% 95%) 0%, hsl(43 100% 88%) 100%)`,
      }}
    >
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-strong p-8 animate-scale-in">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-glow">
              <span className="text-primary-foreground font-bold text-xl">JS</span>
            </div>
          </Link>

          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
          <p className="text-muted-foreground mb-8">Sign in to continue shopping</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                  disabled={isAnyLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 rounded-xl"
                  required
                  disabled={isAnyLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isAnyLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-border accent-primary"
                  disabled={isAnyLoading}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isAnyLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          {/* Social login */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/80 px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="mt-4">
              <div className={`flex justify-center ${isGoogleLoading ? "opacity-60 pointer-events-none" : ""}`}>
                <GoogleLogin
                  onSuccess={(resp) => handleGoogleSuccess(resp.credential)}
                  onError={() => toast.error("Google sign-in failed")}
                  useOneTap
                />
              </div>

              {isGoogleLoading && (
                <p className="mt-3 text-xs text-muted-foreground text-center">
                  Signing in with Google...
                </p>
              )}
            </div>
          </div>

          {/* kept for future if you want to show platform */}
          <p className="sr-only">website: {WEBSITE}</p>
        </div>
      </div>
    </div>
  );
};

export default Login;