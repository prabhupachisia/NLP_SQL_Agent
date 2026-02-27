import { useEffect, useState, useRef } from "react";
import api from "../api/axios";

export default function Workbench() {
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [showSQL, setShowSQL] = useState(false);
  const [execTime, setExecTime] = useState(null);

  const textareaRef = useRef(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const res = await api.get("/connections");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.connections || [];
      setConnections(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecute = async () => {
    if (!selectedConnection || !prompt.trim()) {
      setError("Please select a connection and enter an instruction.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);
    setExecTime(null);

    const start = performance.now();

    try {
      const res = await api.post("/query", {
        connection_id: selectedConnection,
        prompt,
      });

      const end = performance.now();
      setExecTime(((end - start) / 1000).toFixed(2));

      setResult(res.data);
    } catch (err) {
      console.error(err);

      if (err.response?.data) {
        const { error, details } = err.response.data;

        if (details) {
          setError(`${error}\n${details}`);
        } else if (error) {
          setError(error);
        } else {
          setError("Execution failed.");
        }
      } else {
        setError("Execution failed. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      handleExecute();
    }
  };

  const copySQL = () => {
    if (result?.sql) {
      navigator.clipboard.writeText(result.sql);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Workbench</h1>
        <p className="text-slate-700 mt-1">
          Execute database operations using natural language.
        </p>
      </div>

      {/* Connection Selector */}
      <div className="bg-white border border-slate-300 rounded-lg p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-900 mb-2">
          Select Database Connection
        </label>

        <select
          value={selectedConnection}
          onChange={(e) => setSelectedConnection(e.target.value)}
          className="w-full border border-slate-300 rounded-md px-3 py-2.5
                     focus:outline-none focus:ring-2  text-slate-700 focus:ring-[#E87400]"
        >
          <option value="">Choose connection...</option>
          {connections.map((conn) => (
            <option key={conn.id} value={conn.id}>
              {conn.name} ({conn.db_type})
            </option>
          ))}
        </select>
      </div>

      {/* Prompt */}
      <div className="bg-white border border-slate-300 rounded-lg p-6 shadow-sm space-y-4">
        <label className="block text-sm font-medium text-slate-900">
          Natural Language Instruction
        </label>

        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={4}
          placeholder="Example: Delete user with id 5"
          className="w-full border border-slate-300 rounded-md px-3 py-2.5
                     focus:outline-none focus:ring-2  text-slate-700 focus:ring-[#E87400]"
        />

        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500">
            Press Ctrl + Enter to execute
          </span>

          <button
            onClick={handleExecute}
            disabled={loading}
            className="bg-[#E87400] hover:bg-[#D46400] text-white
                       px-6 py-2.5 rounded-md text-sm font-medium
                       transition-colors disabled:opacity-60"
          >
            {loading ? "Executing..." : "Execute"}
          </button>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>

      {/* Result Panel */}
      {result && (
        <div className="bg-white border border-slate-300 rounded-lg p-6 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div className="text-sm font-semibold text-slate-900">
              Execution Result
            </div>

            <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
              Success
            </span>
          </div>

          {/* Metadata */}
          <div className="flex gap-6 text-sm text-slate-800">
            <div>
              Rows affected:{" "}
              <span className="font-medium">{result.rows_affected}</span>
            </div>

            {execTime && (
              <div>
                Execution time: <span className="font-medium">{execTime}s</span>
              </div>
            )}
          </div>

          {/* Correction */}
          {result.corrected && (
            <div className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full inline-block font-medium">
              AI Self-Correction Applied
            </div>
          )}

          {/* SQL Toggle */}
          {result.sql && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <button
                  onClick={() => setShowSQL(!showSQL)}
                  className="text-sm font-medium text-slate-900 hover:underline"
                >
                  {showSQL ? "Hide Generated SQL" : "View Generated SQL"}
                </button>

                {showSQL && (
                  <button
                    onClick={copySQL}
                    className="text-xs text-[#E87400] hover:underline"
                  >
                    Copy SQL
                  </button>
                )}
              </div>

              {showSQL && (
                <pre className="bg-slate-100 border border-slate-300 p-4 rounded-md text-xs text-slate-900 overflow-x-auto">
                  {result.sql}
                </pre>
              )}
            </div>
          )}

          {/* Result Data */}
          {result.results && result.results.length > 0 && (
            <div>
              <div className="text-sm font-medium text-slate-900 mb-3">
                Result Data
              </div>

              <div className="overflow-x-auto border border-slate-300 rounded-md">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100 border-b border-slate-300">
                    <tr>
                      {Object.keys(result.results[0]).map((key) => (
                        <th
                          key={key}
                          className="px-4 py-2 text-left text-slate-800 font-medium"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.results.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-slate-200 hover:bg-slate-50"
                      >
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-4 py-2 text-slate-800">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty Result */}
          {result.results && result.results.length === 0 && (
            <div className="text-sm text-slate-700">
              Operation executed successfully. No result dataset returned.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
