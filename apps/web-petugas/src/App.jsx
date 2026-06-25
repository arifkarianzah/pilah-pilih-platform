import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import BottomNav from "./components/BottomNav";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Timbang from "./pages/Timbang";
import Riwayat from "./pages/Riwayat";
import Profil from "./pages/Profil";
import Chat from "./pages/Chat";
import SendToPengepul from "./pages/SendToPengepul";

import TopUp from "./pages/TopUp";
import TarikSaldo from "./pages/TarikSaldo";

// ─── Auth Guard ───────────────────────────────────────────────────────────────
function RequireAuth() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) return <Navigate to="/login" replace />;
  if (user.role !== "petugas" && user.role !== "admin") {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

// ─── App Layout (sidebar + topbar + content) ─────────────────────────────────
function AppLayout() {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "{}")
  );

  // Re-sync if localStorage changes (e.g. profile update)
  useEffect(() => {
    const sync = () => setUser(JSON.parse(localStorage.getItem("user") || "{}"));
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return (
    <div className="app-layout">
      <div className="main-content">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/orders/:id/send" element={<SendToPengepul />} />
            <Route path="/timbang" element={<Timbang />} />
            <Route path="/riwayat" element={<Riwayat />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/topup" element={<TopUp />} />
            <Route path="/tarik-saldo" element={<TarikSaldo />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
