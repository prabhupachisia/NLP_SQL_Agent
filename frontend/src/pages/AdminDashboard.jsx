import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = ["#f97316", "#6366f1", "#10b981", "#ef4444", "#8b5cf6"];

const AdminDashboard = () => {
  const [overview, setOverview] = useState({});
  const [health, setHealth] = useState({});
  const [aiMetrics, setAiMetrics] = useState({});
  const [timeSeries, setTimeSeries] = useState([]);
  const [dbDistribution, setDbDistribution] = useState([]);
  const [latency, setLatency] = useState([]);
  const [healthScore, setHealthScore] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [
      overviewRes,
      healthRes,
      aiRes,
      timeRes,
      dbRes,
      latencyRes,
      scoreRes,
    ] = await Promise.all([
      api.get("/admin/overview"),
      api.get("/admin/system-health"),
      api.get("/admin/ai-metrics"),
      api.get("/admin/time-series"),
      api.get("/admin/database-distribution"),
      api.get("/admin/latency-distribution"),
      api.get("/admin/ai-health-score"),
    ]);

    setOverview(overviewRes.data);
    setHealth(healthRes.data);
    setAiMetrics(aiRes.data);
    setTimeSeries(timeRes.data.daily || []);
    setDbDistribution(
      Object.entries(dbRes.data.distribution || {}).map(([k, v]) => ({
        name: k,
        value: v,
      }))
    );
    setLatency(
      Object.entries(latencyRes.data).map(([k, v]) => ({
        bucket: k,
        count: v,
      }))
    );
    setHealthScore(scoreRes.data.ai_health_score);
  };

  const queryTypeData = Object.entries(
    aiMetrics.query_type_distribution || {}
  ).map(([k, v]) => ({ name: k, value: v }));

  return (
    <div>
      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <Card title="Total Queries" value={overview.total_queries} />
        <Card
          title="Success Rate"
          value={`${(overview.success_rate * 100 || 0).toFixed(1)}%`}
        />
        <Card title="24h Queries" value={health.queries_24h} />
        <Card
          title="Avg Latency"
          value={`${health.avg_execution_time || 0}s`}
        />
        <Card
          title="AI Health Score"
          value={`${healthScore || 0}/100`}
          highlight
        />
      </div>

      {/* Time Series */}
      <Section title="Daily Query Trends">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={timeSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" tick={{ fill: "#6B7280" }} />
            <YAxis tick={{ fill: "#6B7280" }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#f97316"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="success"
              stroke="#10b981"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="failed"
              stroke="#ef4444"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Section>

      {/* Lower Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Section title="Query Type Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={queryTypeData} dataKey="value" outerRadius={90}>
                {queryTypeData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Latency Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={latency}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="bucket" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* Database Distribution */}
      <Section title="Database Usage" className="mt-8">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={dbDistribution} dataKey="value" outerRadius={110}>
              {dbDistribution.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Section>
    </div>
  );
};

const Card = ({ title, value, highlight }) => (
  <div
    className={`bg-white p-6 rounded-2xl border border-gray-200 shadow-sm 
    ${highlight ? "ring-2 ring-orange-500" : ""}`}
  >
    <p className="text-sm text-gray-500 mb-2">{title}</p>
    <h2 className="text-2xl font-semibold text-gray-800">{value ?? 0}</h2>
  </div>
);

const Section = ({ title, children }) => (
  <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-800 mb-6">{title}</h3>
    {children}
  </div>
);

export default AdminDashboard;
