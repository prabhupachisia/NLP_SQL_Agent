import { Link, useLocation } from "react-router-dom";
import {
  Database,
  LayoutDashboard,
  History,
  Settings,
  Key,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Connections", path: "/connections", icon: Database },
    { name: "Workbench", path: "/workbench", icon: Settings },
    { name: "History", path: "/history", icon: History },
    { name: "API Keys", path: "/apikeys", icon: Key },
  ];

  return (
    <aside className="w-64 bg-[#111315] text-white flex flex-col">
      <div className="p-6 border-b border-neutral-800">
        <div className="text-lg font-semibold">
          Struct<span className="text-[#E87400]">QL</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition
                ${
                  active
                    ? "bg-[#E87400] text-white"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
