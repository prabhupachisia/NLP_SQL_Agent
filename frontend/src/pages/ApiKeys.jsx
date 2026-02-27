import { useEffect, useState } from "react";
import api from "../api/axios";
import { Copy, Trash2 } from "lucide-react";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // =========================
  // FETCH KEYS
  // =========================
  const loadKeys = async () => {
    try {
      const res = await api.get("/apikeys/");
      setKeys(res.data.api_keys);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  // =========================
  // GENERATE KEY
  // =========================
  const handleGenerate = async () => {
    if (!newKeyName.trim()) return;

    try {
      setLoading(true);

      const res = await api.post("/apikeys/", {
        name: newKeyName,
      });

      setGeneratedKey(res.data.api_key);
      setNewKeyName("");
      await loadKeys();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // REVOKE KEY
  // =========================
  const handleRevoke = async (id) => {
    try {
      await api.delete(`/apikeys/${id}`);
      await loadKeys();
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedKey);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-semibold text-slate-800">
        API Key Management
      </h1>

      {/* =========================
            GENERATE SECTION
      ========================== */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
        <h2 className="font-medium text-slate-700">Generate New API Key</h2>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter key name..."
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1 border border-slate-300 rounded-md text-slate-700 px-4 py-2 text-sm"
          />

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-[#E87400] text-white px-5 py-2 rounded-md text-sm hover:opacity-90"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        {generatedKey && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
            <p className="text-sm font-medium text-yellow-700">
              Copy this key now. It will not be shown again.
            </p>

            <div className="flex items-center justify-between mt-3 text-slate-700 bg-white border rounded-md px-3 py-2">
              <code className="text-sm break-all">{generatedKey}</code>

              <button
                onClick={copyToClipboard}
                className={`text-sm flex items-center gap-1 transition ${
                  copied ? "text-green-600" : "text-[#E87400]"
                }`}
              >
                {copied ? (
                  <>✓ Copied</>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================
            EXISTING KEYS
      ========================== */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h2 className="font-medium text-slate-700 mb-4">Your API Keys</h2>

        {keys.length === 0 ? (
          <p className="text-sm text-slate-500">No API keys created yet.</p>
        ) : (
          <div className="space-y-3">
            {keys.map((key) => (
              <div
                key={key.id}
                className="flex justify-between items-center border rounded-md px-4 py-3"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-slate-700">
                      {key.name}
                    </div>

                    {/* STATUS BADGE */}
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        key.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {key.is_active ? "Active" : "Revoked"}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500">
                    Created: {new Date(key.created_at).toLocaleString()}
                  </div>

                  <div className="text-xs text-slate-500">
                    Usage Count: {key.usage_count || 0}
                  </div>
                </div>

                {/* Only show revoke if active */}
                {key.is_active && (
                  <button
                    onClick={() => handleRevoke(key.id)}
                    className="text-red-500 text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
