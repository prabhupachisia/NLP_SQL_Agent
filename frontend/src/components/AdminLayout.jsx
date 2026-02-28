import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-56 bg-gray-900 text-white flex flex-col justify-between p-6">
        <div>
          <h2 className="text-xl font-semibold text-orange-500">StructQL</h2>
          <p className="text-sm text-gray-400 mt-1">Admin Console</p>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-10">
          <h3 className="text-lg font-semibold text-gray-800">
            AI System Overview
          </h3>

          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-600">
              {user?.name} <span className="text-gray-400">(Admin)</span>
            </span>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
