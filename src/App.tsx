import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// 🏠 Páginas principales
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import StatusPage from "./pages/StatusPage";

// 🌐 Módulo ONUs
import OnlineONUs from "./pages/OnlineONUs";
import OfflineONUs from "./pages/OfflineONUs";
import LowSignalONUs from "./pages/LowSignalONUs";
import UnconfiguredONUs from "./pages/UnconfiguredONUs";
import AuthorizeOnu from "./pages/AuthorizeOnu";
import ONUDetails from "./pages/ONUDetails"; // 👈 Nuevo CRUD individual

// 👥 Clientes y monitoreo
import ClientesActivosPage from "./pages/ClientesActivosPage";
import TraficoPage from "./pages/TraficoPage";
import AlarmasPage from "./pages/AlarmasPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌍 Redirección inicial */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 🔐 Autenticación */}
        <Route path="/login" element={<LoginPage />} />

        {/* 📊 Páginas principales */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/status" element={<StatusPage />} />

        {/* 🧠 ONUs */}
        <Route path="/online-onus" element={<OnlineONUs />} />
        <Route path="/offline-onus" element={<OfflineONUs />} />
        <Route path="/low-signal-onus" element={<LowSignalONUs />} />
        <Route path="/unconfigured-onus" element={<UnconfiguredONUs />} />
        <Route path="/authorize-onu/:sn" element={<AuthorizeOnu />} />
        <Route path="/onu/:id" element={<ONUDetails />} /> {/* 👈 CRUD por ONU */}

        {/* 👥 Clientes */}
        <Route path="/clientes-activos" element={<ClientesActivosPage />} />

        {/* 📈 Monitoreo */}
        <Route path="/trafico" element={<TraficoPage />} />
        <Route path="/alarmas" element={<AlarmasPage />} />

        {/* ❌ Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
