import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

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
        <Route
          path="/"
          element={authed ? <Dashboard onLogout={() => setAuthed(false)} /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}



