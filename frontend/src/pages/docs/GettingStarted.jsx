export default function GettingStarted() {
  return (
    <div className="space-y-12">
      {/* Page Title */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Getting Started
        </h1>
        <p className="text-slate-600 text-lg leading-relaxed">
          StructQL allows you to interact with structured databases using
          natural language. Follow the steps below to begin.
        </p>
      </div>

      {/* Section Divider */}
      <div className="border-t border-slate-200 pt-8">
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">
          1. Create an Account
        </h2>
        <p className="text-slate-600 leading-relaxed">
          Register and sign in to access your workspace.
        </p>
      </div>

      <div className="border-t border-slate-200 pt-8">
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">
          2. Add a Database Connection
        </h2>
        <p className="text-slate-600 leading-relaxed">
          Navigate to the{" "}
          <span className="font-medium text-slate-800">Connections</span> page
          and provide your database host, port, username, and password.
        </p>
      </div>

      <div className="border-t border-slate-200 pt-8">
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">
          3. Start Querying
        </h2>
        <p className="text-slate-600 leading-relaxed">
          Go to the{" "}
          <span className="font-medium text-slate-800">Workbench</span> and
          enter a natural language prompt. StructQL will generate and execute
          the SQL query.
        </p>
      </div>
    </div>
  );
}
