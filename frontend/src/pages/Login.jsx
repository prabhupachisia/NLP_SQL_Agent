import { useState } from "react";
import { Eye, EyeOff, Database, ArrowRight, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate("/");
    } catch {
      setError("Authentication failed. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#111315] border-r border-neutral-800">
        <div className="flex flex-col justify-between p-16 w-full">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-24">
              <div className="w-10 h-10 bg-[#E87400] rounded-sm flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-semibold text-white">StructQL</div>
                <div className="text-xs text-[#E87400] uppercase tracking-wider">
                  AI Database Platform
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="max-w-xl space-y-8">
              <div>
                <div className="text-[#E87400]/80 text-xs uppercase tracking-wider mb-3">
                  Natural Language Database Management
                </div>
                <h1 className="text-3xl font-semibold text-white mb-4 leading-tight">
                  Manage Databases Using Plain English
                </h1>
                <p className="text-neutral-400 leading-relaxed">
                  StructQL allows you to perform database operations using
                  natural language. From data retrieval to structural updates,
                  the system intelligently interprets intent and executes
                  operations securely across multiple database engines.
                </p>
              </div>

              {/* Feature List */}
              <div className="border-l-2 border-[#E87400]/40 pl-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-[#E87400] rounded-full mt-2"></div>
                  <span className="text-neutral-300 text-sm">
                    Intelligent NL-to-Database execution engine
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-[#E87400] rounded-full mt-2"></div>
                  <span className="text-neutral-300 text-sm">
                    Secure CRUD & schema operations
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-[#E87400] rounded-full mt-2"></div>
                  <span className="text-neutral-300 text-sm">
                    Multi-database support (MySQL, PostgreSQL)
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-[#E87400] rounded-full mt-2"></div>
                  <span className="text-neutral-300 text-sm">
                    Role-based access control & permission enforcement
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-neutral-600 text-xs pt-8 border-t border-neutral-800">
            <span>© 2026 StructQL</span>
            <span className="font-mono">v1.0</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-10 bg-[#F5F6F8]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#E87400] rounded-sm flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-semibold text-slate-900">
                StructQL
              </div>
              <div className="text-xs text-[#E87400] uppercase tracking-wider">
                AI SQL Platform
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              Sign in to StructQL
            </h2>
            <p className="text-slate-600">
              Access your SQL intelligence workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-md 
                           bg-white text-slate-900 text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#E87400] 
                           focus:border-transparent"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-md
                             bg-white text-slate-900 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#E87400] 
                             focus:border-transparent"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 border-slate-300 rounded text-[#E87400] focus:ring-2 focus:ring-[#E87400]"
              />
              <label className="ml-2 text-sm text-slate-700">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#E87400] hover:bg-[#D46400] 
                         text-white py-2.5 rounded-md font-medium
                         transition-colors flex items-center justify-center gap-2
                         disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Lock className="w-4 h-4 animate-pulse" />
                  Authenticating
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          <div className="mt-8 text-sm text-center text-slate-600">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-[#E87400] hover:underline font-medium"
            >
              Create one
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Protected by JWT authentication and permission-based access
              control
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
