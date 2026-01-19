import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { api } from "./services/api"

import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddHolding from "./pages/AddHolding";
import Learning from "./pages/Learning";
import Income from "./pages/Income";

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);

  const triggerDashboardRefresh = () => {
    setDashboardRefreshKey(prevKey => prevKey + 1);
  };

  useEffect(() => {
    api.get("/auth/me")
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            authed ? <Navigate to="/" replace /> : <Login onLogin={() => setAuthed(true)} />
          }
        />

        {/* Protected app shell only users with authed === true can enter this shell */}
        <Route
          element={authed ? <AppLayout /> : <Navigate to="/login" replace />}
        >
          <Route path="/" element={<Dashboard onLogout={() => setAuthed(false)} refreshKey={dashboardRefreshKey} />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/transactions" element={<AddHolding onHoldingAdded={triggerDashboardRefresh} />} />
          <Route path="/income" element={<Income />} />
        </Route>
        
        {/* Redirect any unknown URL to the correct stating point */}
        <Route path="*" element={<Navigate to={authed ? "/" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}



