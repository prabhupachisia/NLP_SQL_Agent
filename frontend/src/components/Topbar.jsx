import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
      {/* Left Section */}
      <div className="text-sm text-slate-600 font-medium">
        AI-Powered Database Management
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-8">
        {/* Docs Link */}
        <Link
          to="/docs"
          className="text-sm text-slate-600 hover:text-[#E87400] transition"
        >
          Docs
        </Link>

        {/* User Info */}
        <span className="text-sm text-slate-700 font-medium">
          {user?.name || user?.email}
        </span>

        {/* Logout */}
        <button
          onClick={logout}
          className="text-sm text-[#E87400] hover:underline"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
