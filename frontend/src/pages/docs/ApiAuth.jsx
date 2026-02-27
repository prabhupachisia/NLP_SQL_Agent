import CodeBlock from "../../components/CodeBlock";

function EndpointHeader({ method, path }) {
  const colors = {
    POST: "bg-green-100 text-green-700",
    GET: "bg-blue-100 text-blue-700",
    PUT: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      <span
        className={`px-3 py-1 rounded text-xs font-semibold ${colors[method]}`}
      >
        {method}
      </span>
      <code className="font-mono text-slate-800 text-sm">{path}</code>
    </div>
  );
}

export default function ApiGuide() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  return (
    <div className="space-y-20">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          API Integration Guide
        </h1>

        <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
          Integrate StructQL into your applications using secure API key
          authentication. Execute natural language queries, manage connections,
          and retrieve execution history programmatically.
        </p>

        <div className="w-16 h-1 bg-[#E87400] mt-6 rounded"></div>
      </div>

      {/* ================= AUTH ================= */}
      <section className="border-t border-slate-200 pt-12 space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">
          Authentication
        </h2>

        <p className="text-slate-600 leading-relaxed">
          All API requests must include your API key in the request headers.
        </p>

        <CodeBlock code={`X-API-Key: YOUR_API_KEY`} />

        <p className="text-sm text-slate-500">
          API keys inherit the same permission level as the user who created
          them.
        </p>
      </section>

      {/* ================= QUERY ================= */}
      <section className="border-t border-slate-200 pt-12 space-y-6">
        <EndpointHeader method="POST" path="/query/" />

        <p className="text-slate-600 leading-relaxed">
          Execute a natural language instruction on a selected database
          connection.
        </p>

        <CodeBlock
          code={`POST ${BASE_URL}/query/

Headers:
  X-API-Key: YOUR_API_KEY
  Content-Type: application/json

Body:
{
  "connection_id": 1,
  "prompt": "List users who spent more than $1000"
}`}
        />

        <h3 className="text-lg font-semibold text-slate-800 mt-8">
          Successful Response
        </h3>

        <CodeBlock
          code={`{
  "sql": "SELECT u.email, u.id, u.name, SUM(o.amount) AS total_spent
          FROM users u
          LEFT JOIN orders o ON u.id = o.user_id
          GROUP BY u.id
          HAVING SUM(o.amount) > 1000;",
  "results": [
    {
      "email": "alice@test.com",
      "id": 1,
      "name": "Alice",
      "total_spent": 1071.94
    }
  ],
  "rows_affected": 1,
  "corrected": false
}`}
        />
      </section>

      {/* ================= HISTORY ================= */}
      <section className="border-t border-slate-200 pt-12 space-y-6">
        <EndpointHeader method="GET" path="/history/" />

        <p className="text-slate-600 leading-relaxed">
          Retrieve execution history for the authenticated user.
        </p>

        <CodeBlock
          code={`GET ${BASE_URL}/history/

Headers:
  X-API-Key: YOUR_API_KEY`}
        />

        <h3 className="text-lg font-semibold text-slate-800 mt-8">
          Example Response
        </h3>

        <CodeBlock
          code={`{
  "history": [
    {
      "connection_id": 1,
      "user_prompt": "List users who spent more than $1000",
      "status": "success",
      "rows_affected": 1,
      "was_corrected": false,
      "created_at": "2026-02-27T17:30:37"
    }
  ]
}`}
        />
      </section>

      {/* ================= UPDATE CONNECTION ================= */}
      <section className="border-t border-slate-200 pt-12 space-y-6">
        <EndpointHeader method="PUT" path="/connections/{id}" />

        <p className="text-slate-600 leading-relaxed">
          Update connection settings such as permission level.
        </p>

        <CodeBlock
          code={`PUT ${BASE_URL}/connections/1

Headers:
  X-API-Key: YOUR_API_KEY
  Content-Type: application/json

Body:
{
  "permission_level": "read_only"
}`}
        />
      </section>

      {/* ================= TEST CONNECTION ================= */}
      <section className="border-t border-slate-200 pt-12 space-y-6">
        <EndpointHeader method="POST" path="/connections/{id}/test" />

        <p className="text-slate-600 leading-relaxed">
          Tests whether the specified database connection is reachable and
          valid. Useful for deployment validation and automated monitoring.
        </p>

        <CodeBlock
          code={`POST ${BASE_URL}/connections/1/test

Headers:
  X-API-Key: YOUR_API_KEY`}
        />

        <h3 className="text-lg font-semibold text-slate-800 mt-8">
          Successful Response
        </h3>

        <CodeBlock
          code={`{
  "success": true,
  "message": "Connection successful."
}`}
        />

        <h3 className="text-lg font-semibold text-slate-800 mt-8">
          Failure Response
        </h3>

        <CodeBlock
          code={`{
  "success": false,
  "error": "Unable to connect to database."
}`}
        />
      </section>

      {/* ================= ERRORS ================= */}
      <section className="border-t border-slate-200 pt-12 space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">
          Error Responses
        </h2>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-sm text-slate-700 space-y-3">
          <div>
            <strong>400</strong> – Query execution error
          </div>
          <div>
            <strong>401</strong> – Invalid or expired API key
          </div>
          <div>
            <strong>403</strong> – Permission level violation
          </div>
          <div>
            <strong>404</strong> – Resource not found
          </div>
        </div>
      </section>
    </div>
  );
}
