export default function DatabaseSetup() {
  return (
    <div className="space-y-14">
      {/* Page Title */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Connecting a Database
        </h1>
        <p className="text-slate-600 text-lg leading-relaxed">
          StructQL allows you to securely connect and interact with your
          relational database using natural language.
        </p>
        <div className="w-16 h-1 bg-[#E87400] mt-4 rounded"></div>
      </div>

      {/* Required Fields */}
      <div className="border-t border-slate-200 pt-10">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">
          Required Connection Details
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <FieldCard
            title="Connection Name"
            description="A custom name to identify your database connection inside StructQL."
          />
          <FieldCard
            title="Host"
            description="The database server address (e.g., localhost or cloud endpoint)."
          />
          <FieldCard
            title="Port"
            description="Database port (e.g., 3306 for MySQL, 5432 for PostgreSQL)."
          />
          <FieldCard
            title="Username"
            description="Database user with required permissions."
          />
          <FieldCard
            title="Password"
            description="Password associated with the database user."
          />
          <FieldCard
            title="Database Name"
            description="The specific database you want to connect to."
          />
        </div>
      </div>

      {/* Database Types */}
      <div className="border-t border-slate-200 pt-10">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">
          Supported Database Types
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <TypeCard name="MySQL" />
          <TypeCard name="PostgreSQL" />
        </div>
      </div>

      {/* Permission Levels */}
      <div className="border-t border-slate-200 pt-10">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          Permission Level
        </h2>

        <p className="text-slate-600 mb-6 leading-relaxed">
          When creating a connection, you can define the permission level to
          control what queries can be executed.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
          <PermissionRow
            title="Read Only"
            description="Allows SELECT queries only. Prevents INSERT, UPDATE, DELETE, and DDL operations."
          />
          <PermissionRow
            title="Read/Write"
            description="Allows SELECT, INSERT, UPDATE, and DELETE queries. DDL operations are still restricted."
          />
          <PermissionRow
            title="Full Access"
            description="Allows all permitted database operations depending on your user credentials."
          />
        </div>
      </div>

      {/* External Access Notice */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
        <h3 className="font-semibold text-blue-900 mb-2">
          External Database Access Required
        </h3>

        <p className="text-blue-800 text-sm leading-relaxed mb-4">
          StructQL operates as a hosted service. Your database must allow secure
          external connections for StructQL to establish a connection.
        </p>

        <ul className="text-blue-800 text-sm space-y-2 list-disc pl-5">
          <li>Enable remote access on your database server.</li>
          <li>Configure firewall rules to allow inbound connections.</li>
          <li>Whitelist StructQL’s outbound IP addresses if required.</li>
          <li>
            Enable SSL/TLS if your database provider mandates secure
            connections.
          </li>
        </ul>
      </div>
    </div>
  );
}

/* ================= Sub Components ================= */

function FieldCard({ title, description }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function TypeCard({ name }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition">
      <h3 className="font-semibold text-slate-900">{name}</h3>
    </div>
  );
}

function PermissionRow({ title, description }) {
  return (
    <div>
      <h4 className="font-semibold text-slate-900 mb-1">{title}</h4>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
