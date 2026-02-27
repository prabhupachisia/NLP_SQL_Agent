import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DocsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogoClick = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  const navItems = [
    { name: "Getting Started", path: "/docs" },
    { name: "Connecting a Database", path: "/docs/database" },
    { name: "Using the Workbench", path: "/docs/workbench" },
    { name: "API Integration Guide", path: "/docs/auth" },
  ];

  return (
    <div className="flex h-screen bg-[#F5F6F8]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 p-8 overflow-y-auto">
        {/* Clickable Logo */}
        <div
          onClick={handleLogoClick}
          className="text-xl font-semibold cursor-pointer select-none hover:opacity-80 transition mb-10"
        >
          <span className="text-slate-900">Struct</span>
          <span className="text-[#E87400]">QL</span>
          <div className="text-xs text-slate-500 mt-1">Documentation</div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 text-sm">
          {navItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-4 py-2 rounded-md transition ${
                  active
                    ? "bg-[#E87400] text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-20 py-16">
        <div className="max-w-3xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
