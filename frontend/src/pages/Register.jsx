import { useState } from "react";
import { Eye, EyeOff, Database } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(formData);
      navigate("/login");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
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
                  Intelligent Database Management
                </div>
                <h1 className="text-3xl font-semibold text-white mb-4 leading-tight">
                  Create Your StructQL Account
                </h1>
                <p className="text-neutral-400 leading-relaxed">
                  Start managing databases using natural language. StructQL
                  interprets intent and securely executes database operations
                  across multiple engines.
                </p>
              </div>

              {/* Feature List */}
              <div className="border-l-2 border-[#E87400]/40 pl-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-[#E87400] rounded-full mt-2"></div>
                  <span className="text-neutral-300 text-sm">
                    Execute secure CRUD operations using natural language
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-[#E87400] rounded-full mt-2"></div>
                  <span className="text-neutral-300 text-sm">
                    Support for MySQL, Oracle, PostgreSQL, SQLite etc.
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-[#E87400] rounded-full mt-2"></div>
                  <span className="text-neutral-300 text-sm">
                    Intelligent schema-aware execution engine
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-[#E87400] rounded-full mt-2"></div>
                  <span className="text-neutral-300 text-sm">
                    Permission-based access and security enforcement
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-neutral-600 text-xs pt-8 border-t border-neutral-800">
            <span>© 2026 StructQL</span>
            <span className="font-mono">v1.0</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-10 bg-[#F5F6F8]">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              Create Account
            </h2>
            <p className="text-slate-600">
              Register to start managing databases intelligently
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-md 
                           bg-white text-slate-900 text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#E87400]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-md 
                           bg-white text-slate-900 text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#E87400]"
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-md 
                             bg-white text-slate-900 text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#E87400]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E87400] hover:bg-[#D46400] 
                         text-white py-2.5 rounded-md font-medium
                         transition-colors disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-sm text-center text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#E87400] hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
