import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Dashboard() {
  const navigate = useNavigate();

  const [connections, setConnections] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const [loadingConnections, setLoadingConnections] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    fetchConnections();
    fetchHistory();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoadingConnections(true);
      const res = await api.get("/connections");

      // Handle both wrapped and direct array
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.connections || [];

      setConnections(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load connections.");
      setConnections([]);
    } finally {
      setLoadingConnections(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get("/history");

      const data = res.data?.history || [];

      setRecentActivity(data.slice(0, 5));
    } catch (err) {
      console.error(err);
      setError("Failed to load activity.");
      setRecentActivity([]);
    } finally {
      setLoadingHistory(false);
    }
  };
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My Workspace</h1>
        <p className="text-slate-600 mt-1">
          Manage your connected databases using natural language.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-md">
          {error}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">
          Quick Actions
        </h2>

        <div className="flex flex-wrap gap-4">
          {/* PRIMARY */}
          <button
            onClick={() => navigate("/workbench")}
            className="bg-[#E87400] hover:bg-[#D46400] text-white 
                 px-6 py-2.5 rounded-md text-sm font-medium
                 transition-colors shadow-sm"
          >
            Open Workbench
          </button>

          {/* SECONDARY */}
          <button
            onClick={() => navigate("/connections")}
            className="border border-[#E87400] text-[#E87400]
                 hover:bg-[#FFF4E8]
                 px-6 py-2.5 rounded-md text-sm font-medium
                 transition-colors"
          >
            Manage Connections
          </button>

          {/* TERTIARY */}
          <button
            onClick={() => navigate("/history")}
            className="border border-slate-300 text-slate-700
                 hover:bg-slate-100
                 px-6 py-2.5 rounded-md text-sm font-medium
                 transition-colors"
          >
            View History
          </button>
        </div>
      </div>

      {/* Connected Databases */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">
          Connected Databases
        </h2>

        {loadingConnections ? (
          <div className="text-sm text-slate-500">Loading connections...</div>
        ) : connections.length === 0 ? (
          <div className="text-sm text-slate-500">
            No database connections found.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className="py-4 flex justify-between items-center"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    {conn.name}
                  </div>
                  <div className="text-xs text-slate-500">{conn.db_type}</div>
                </div>

                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                  Active
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">
          Recent Activity
        </h2>

        {loadingHistory ? (
          <div className="text-sm text-slate-500">Loading activity...</div>
        ) : recentActivity.length === 0 ? (
          <div className="text-sm text-slate-500">
            No recent operations found.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="py-4 flex justify-between items-center"
              >
                <div className="max-w-[70%]">
                  <div className="text-sm font-medium text-slate-900 truncate">
                    {item.user_prompt}
                  </div>

                  <div className="text-xs text-slate-500 mt-1">
                    {new Date(item.created_at).toLocaleString()}
                  </div>

                  {item.was_corrected && (
                    <div className="text-xs text-amber-600 mt-1">
                      AI correction applied
                    </div>
                  )}
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    item.status === "success"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
