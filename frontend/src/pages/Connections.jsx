import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Connections() {
  const [connections, setConnections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [testingId, setTestingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    db_type: "",
    host: "",
    port: "",
    username: "",
    password: "",
    database_name: "",
    permission_level: "read_only",
  });

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    const res = await api.get("/connections");
    setConnections(res.data.connections || []);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      db_type: "",
      host: "",
      port: "",
      username: "",
      password: "",
      database_name: "",
      permission_level: "read_only",
    });
    setShowModal(true);
  };

  const openEdit = (conn) => {
    setEditing(conn);
    setForm({
      ...conn,
      database_name: "",
      host: "",
      port: "",
      username: "",
      password: "",
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      port: Number(form.port),
    };

    if (editing) {
      await api.put(`/connections/${editing.id}`, payload);
    } else {
      await api.post("/connections", payload);
    }

    setShowModal(false);
    fetchConnections();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this connection?")) return;
    await api.delete(`/connections/${id}`);
    fetchConnections();
  };

  const handleTestConnection = async (id) => {
    setTestingId(id);

    try {
      const res = await api.post(`/connections/${id}/test`);
      alert(res.data.message);
    } catch (err) {
      alert("Connection failed.");
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Database Connections
        </h1>

        <button
          onClick={openCreate}
          className="bg-[#E87400] hover:bg-[#D46400] text-white
                     px-5 py-2.5 rounded-md text-sm font-medium"
        >
          + Add Connection
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 border-b border-slate-300">
            <tr>
              <th className="px-4 py-3 text-left text-slate-800 font-medium">
                Name
              </th>
              <th className="px-4 py-3 text-left text-slate-800 font-medium">
                Type
              </th>
              <th className="px-4 py-3 text-left text-slate-800 font-medium">
                Permission
              </th>
              <th className="px-4 py-3 text-left text-slate-800 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {connections.map((conn) => (
              <tr
                key={conn.id}
                className="border-b border-slate-200 hover:bg-slate-50"
              >
                <td className="px-4 py-3 text-slate-800">{conn.name}</td>
                <td className="px-4 py-3 text-slate-800">{conn.db_type}</td>
                <td className="px-4 py-3 text-slate-800">
                  {conn.permission_level}
                </td>
                <td className="px-4 py-3 flex gap-4">
                  <button
                    onClick={() => openEdit(conn)}
                    className="text-[#E87400] font-medium"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleTestConnection(conn.id)}
                    className="text-slate-800 font-medium"
                  >
                    {testingId === conn.id ? "Testing..." : "Test"}
                  </button>

                  <button
                    onClick={() => handleDelete(conn.id)}
                    className="text-red-700 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-lg border border-slate-300 p-6 shadow-lg space-y-5">
            <h2 className="text-lg font-semibold text-slate-900">
              {editing ? "Edit Connection" : "Add Connection"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                "name",
                "host",
                "port",
                "username",
                "password",
                "database_name",
              ].map((field) => (
                <input
                  key={field}
                  name={field}
                  type={field === "password" ? "password" : "text"}
                  placeholder={field}
                  value={form[field] || ""}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-md px-3 py-2.5
                             text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E87400]"
                />
              ))}

              <select
                name="db_type"
                value={form.db_type}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-md px-3 py-2.5
                           text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E87400]"
              >
                <option value="">Select DB Type</option>
                <option value="mysql">MySQL</option>
                <option value="postgresql">PostgreSQL</option>
              </select>

              <select
                name="permission_level"
                value={form.permission_level}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-md px-3 py-2.5
                           text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E87400]"
              >
                <option value="read_only">Read Only</option>
                <option value="read_write">Read & Write</option>
                <option value="full_access">Full Access</option>
              </select>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-800 border border-slate-300 rounded-md"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-[#E87400] text-white rounded-md font-medium"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
