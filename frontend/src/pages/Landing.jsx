import { Link } from "react-router-dom";
import heroImage from "../assets/hero-workbench.png";
import howImage from "../assets/how-it-works.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F5F6F8] text-slate-800 flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="flex justify-between items-center px-16 py-6 bg-white border-b border-slate-200">
        <div className="text-xl font-semibold">
          Struct<span className="text-[#E87400]">QL</span>
        </div>

        <div className="flex items-center gap-8 text-sm font-medium">
          <Link to="/docs" className="hover:text-[#E87400]">
            Documentation
          </Link>
          <Link to="/login" className="hover:text-[#E87400]">
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-[#E87400] text-white px-5 py-2 rounded-md hover:opacity-90"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="px-16 py-24">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-5xl font-semibold leading-tight">
              Use Your Database
              <br />
              Without Writing SQL
            </h1>

            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              StructQL enables you to interact with structured databases using
              natural language. Ask questions, retrieve data, and execute
              operations securely — without learning SQL.
            </p>

            <div className="mt-8 flex gap-6">
              <Link
                to="/register"
                className="bg-[#E87400] text-white px-8 py-3 rounded-md text-sm font-medium hover:opacity-90"
              >
                Create Account
              </Link>

              <Link
                to="/docs"
                className="border border-slate-300 px-8 py-3 rounded-md text-sm font-medium hover:bg-slate-100"
              >
                View Documentation
              </Link>
            </div>
          </div>

          <div>
            <img
              src={heroImage}
              alt="StructQL Workbench Interface"
              className="rounded-xl shadow-xl border border-slate-200"
            />
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="bg-white py-24 px-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-semibold mb-8">How StructQL Works</h2>

            <div className="space-y-8 text-slate-600">
              <div>
                <div className="text-[#E87400] font-semibold">01</div>
                <p className="font-medium text-slate-800">
                  Connect Your Database
                </p>
                <p className="text-sm">
                  Securely connect your MySQL or PostgreSQL database using your
                  credentials.
                </p>
              </div>

              <div>
                <div className="text-[#E87400] font-semibold">02</div>
                <p className="font-medium text-slate-800">
                  Describe Your Requirement
                </p>
                <p className="text-sm">
                  Enter a natural language prompt such as “Show revenue for last
                  quarter”.
                </p>
              </div>

              <div>
                <div className="text-[#E87400] font-semibold">03</div>
                <p className="font-medium text-slate-800">Get Secure Results</p>
                <p className="text-sm">
                  StructQL generates, validates, and executes the corresponding
                  SQL query safely.
                </p>
              </div>
            </div>
          </div>

          <div>
            <img
              src={howImage}
              alt="How StructQL Works"
              className="rounded-xl shadow-lg border border-slate-200"
            />
          </div>
        </div>
      </section>

      {/* ================= SECURITY ================= */}
      <section className="py-24 px-16 bg-[#F9FAFB] border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4">
              Built with Security and Control
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              StructQL ensures every database interaction is authenticated,
              permission-aware, and safely executed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <SecurityCard
              title="JWT Authentication"
              description="Secure user authentication ensures controlled access to your workspace."
            />

            <SecurityCard
              title="API Key Access"
              description="Generate API keys for secure programmatic access and integrations."
            />

            <SecurityCard
              title="Permission Enforcement"
              description="Role-based access control prevents unauthorized query execution."
            />

            <SecurityCard
              title="Execution History"
              description="Track and review query execution history for transparency and auditing."
            />
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 text-center">
        <h2 className="text-3xl font-semibold">
          Simplify Database Interaction Today
        </h2>

        <Link
          to="/register"
          className="mt-8 inline-block bg-[#E87400] text-white px-10 py-3 rounded-md text-sm font-medium hover:opacity-90"
        >
          Get Started
        </Link>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-8 text-center text-sm text-slate-500 border-t border-slate-200">
        © {new Date().getFullYear()} StructQL. All rights reserved.
      </footer>
    </div>
  );
}

function SecurityCard({ title, description }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
      <h3 className="font-semibold text-lg mb-3">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
