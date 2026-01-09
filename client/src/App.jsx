import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Learning from "./pages/Learning";
import Income from "./pages/Income";

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem("token"));

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            authed ? <Navigate to="/" replace /> : <Login onLogin={() => setAuthed(true)} />
          }
        />

        {/* Protected app shell */}
        <Route
          element={authed ? <AppLayout /> : <Navigate to="/login" replace />}
        >
          <Route path="/" element={<Dashboard onLogout={() => setAuthed(false)} />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/income" element={<Income />} />
        </Route>

        <Route path="*" element={<Navigate to={authed ? "/" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}



