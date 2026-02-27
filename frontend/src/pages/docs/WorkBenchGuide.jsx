import select from "../../assets/workbench-select.png";
import full from "../../assets/workbench-full.png";

export default function WorkbenchGuide() {
  return (
    <div className="space-y-16">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Using the Workbench
        </h1>
        <p className="text-slate-600 text-lg leading-relaxed">
          The Workbench allows you to execute structured database operations
          using natural language.
        </p>
        <div className="w-16 h-1 bg-[#E87400] mt-4 rounded"></div>
      </div>

      {/* Step 1 - Connection Selection */}
      <section className="border-t border-slate-200 pt-10 space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">
          1. Select a Database Connection
        </h2>

        <p className="text-slate-600 leading-relaxed">
          Choose an existing database connection from the dropdown. StructQL
          will use the selected connection’s schema to generate SQL queries.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
          <img
            src={select}
            alt="Select Database Connection"
            className="rounded-lg"
          />
        </div>
      </section>

      {/* Step 2 - Input + Output Combined */}
      <section className="border-t border-slate-200 pt-10 space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">
          2. Enter Instruction and Review Results
        </h2>

        <p className="text-slate-600 leading-relaxed">
          Enter your requirement in plain English and execute the query.
          StructQL automatically generates SQL, validates permissions, executes
          the query, and displays results in real-time.
        </p>

        <div className="bg-slate-900 text-green-400 p-6 rounded-lg text-sm">
          I want the list of all users who spent more than $1000
        </div>

        <p className="text-slate-600 leading-relaxed">
          You can press <span className="font-medium">Ctrl + Enter</span>
          or click <span className="font-medium">Execute</span>.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
          <img
            src={full}
            alt="Workbench Input and Output"
            className="rounded-lg"
          />
        </div>

        <ul className="list-disc pl-6 text-slate-600 space-y-2">
          <li>Execution status (Success / Error)</li>
          <li>Rows affected</li>
          <li>Execution time</li>
          <li>Generated SQL</li>
          <li>Result dataset</li>
        </ul>
      </section>

      {/* Technical Pipeline */}
      <section className="border-t border-slate-200 pt-10">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Execution Pipeline
        </h2>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-sm text-slate-700 leading-relaxed">
          <ol className="list-decimal pl-6 space-y-2">
            <li>Fetch database schema</li>
            <li>Retrieve relevant tables (RAG-based filtering)</li>
            <li>Generate SQL query</li>
            <li>Check permission level</li>
            <li>Execute query</li>
            <li>Attempt smart correction if execution fails</li>
            <li>Log execution history</li>
          </ol>
        </div>
      </section>
    </div>
  );
}
