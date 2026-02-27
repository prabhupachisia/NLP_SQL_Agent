import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Connections from "./pages/Connections";
import Workbench from "./pages/Workbench";
import History from "./pages/History";
import APIKeys from "./pages/APIKeys";
import DocsLayout from "./components/DocsLayout";
import GettingStarted from "./pages/docs/GettingStarted";
import DatabaseSetup from "./pages/docs/DatabaseSetup";
import WorkbenchGuide from "./pages/docs/WorkBenchGuide";
import ApiAuth from "./pages/docs/ApiAuth";
import HomeRedirect from "./components/HomeRedirect";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="connections" element={<Connections />} />
        <Route path="workbench" element={<Workbench />} />
        <Route path="history" element={<History />} />
        <Route path="apikeys" element={<APIKeys />} />
      </Route>

      <Route path="/docs" element={<DocsLayout />}>
        <Route index element={<GettingStarted />} />
        <Route path="database" element={<DatabaseSetup />} />
        <Route path="workbench" element={<WorkbenchGuide />} />
        <Route path="auth" element={<ApiAuth />} />
      </Route>
    </Routes>
  );
}

export default App;
