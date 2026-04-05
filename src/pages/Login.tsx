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

  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

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
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential?: string) => {
    if (!credential) {
      toast.error("Google sign-in failed");
      return;
    }

    setIsGoogleLoading(true);
    try {
      const ok = await googleLogin(credential);

      if (ok) {
        toast.success("Logged in with Google!");
        navigate("/");
      } else {
        toast.error("Google authentication failed");
      }
    } catch (err: any) {
      toast.error(err?.message || "Google authentication failed");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error("Please enter your email");
      return;
    }

    setResetLoading(true);
    try {
      const res = await fetch("https://api.jsgallor.com/api/affordable/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.text();
      toast.success(data || "Reset link sent to your email");
      setShowForgotModal(false);
      setResetEmail("");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center md:justify-end p-4 md:pr-16 bg-gradient-to-br from-yellow-100 to-yellow-200">
      
      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8">
          
          {/* Logo */}
          <Link to="/" className="flex justify-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl">JS</span>
            </div>
          </Link>

          <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
          <p className="text-gray-500 mb-6">Sign in to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email */}
            <div>
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  className="pl-10 h-12"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10 h-12"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end text-sm">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <Button className="w-full" disabled={isAnyLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Google */}
          <div className="mt-6 text-center">
            <GoogleLogin
              onSuccess={(res) => handleGoogleSuccess(res.credential)}
              onError={() => toast.error("Google failed")}
            />
          </div>

          {/* ✅ Register Link */}
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary font-semibold hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[350px] shadow-xl">

            <h3 className="text-xl font-semibold mb-2">Reset Password</h3>
            <p className="text-sm text-gray-500 mb-4">
              Enter your email to receive a reset link
            </p>

            <Input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="mb-4"
            />

            <button
              onClick={handleForgotPassword}
              className="w-full bg-primary text-white py-2 rounded-lg"
            >
              {resetLoading ? "Sending..." : "Send Reset Link"}
            </button>

            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full mt-3 text-sm text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;