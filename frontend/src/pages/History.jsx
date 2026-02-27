import { useEffect, useState } from "react";
import api from "../api/axios";

export default function History() {
  const [history, setHistory] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/history");
      setHistory(res.data.history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Execution History
        </h1>
        <p className="text-slate-700 mt-1">
          Review your previous database operations.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-slate-800">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="p-6 text-slate-800">No history found.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 border-b border-slate-300">
              <tr>
                <th className="px-4 py-3 text-left text-slate-800 font-medium">
                  Prompt
                </th>
                <th className="px-4 py-3 text-left text-slate-800 font-medium">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-slate-800 font-medium">
                  Rows
                </th>
                <th className="px-4 py-3 text-left text-slate-800 font-medium">
                  Executed At
                </th>
                <th className="px-4 py-3 text-left text-slate-800 font-medium"></th>
              </tr>
            </thead>

            <tbody>
              {history.map((item) => (
                <>
                  <tr
                    key={item.id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-slate-800 max-w-md truncate">
                      {item.user_prompt}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          item.status === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-800">
                      {item.rows_affected}
                    </td>

                    <td className="px-4 py-3 text-slate-800">
                      {new Date(item.created_at).toLocaleString()}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="text-[#E87400] font-medium text-sm"
                      >
                        {expanded === item.id ? "Hide" : "View"}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expanded === item.id && (
                    <tr className="bg-slate-50">
                      <td colSpan="5" className="px-6 py-4 space-y-4">
                        {/* Correction */}
                        {item.was_corrected && (
                          <div className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full inline-block font-medium">
                            AI Self-Correction Applied
                          </div>
                        )}

                        {/* SQL */}
                        <div>
                          <div className="text-sm font-medium text-slate-900 mb-2">
                            Generated SQL
                          </div>
                          <pre className="bg-white border border-slate-300 p-4 rounded-md text-xs text-slate-900 overflow-x-auto">
                            {item.generated_sql}
                          </pre>
                        </div>

                        {/* Error */}
                        {item.error && (
                          <div>
                            <div className="text-sm font-medium text-red-700 mb-2">
                              Error
                            </div>
                            <div className="bg-red-50 border border-red-200 p-4 rounded-md text-sm text-red-700">
                              {item.error}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
