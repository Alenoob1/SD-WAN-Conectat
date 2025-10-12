import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import OnlineONUs from "./pages/OnlineONUs";
import OfflineONUs from "./pages/OfflineONUs";
import LowSignalONUs from "./pages/LowSignalONUs";
import UnconfiguredONUs from "./pages/UnconfiguredONUs";
import StatusPage from "./pages/StatusPage";
import ClientesActivosPage from "./pages/ClientesActivosPage"; // 👈 nueva página

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página inicial = Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Rutas principales */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* ONUs */}
        <Route path="/online-onus" element={<OnlineONUs />} />
        <Route path="/offline-onus" element={<OfflineONUs />} />
        <Route path="/low-signal-onus" element={<LowSignalONUs />} />
        <Route path="/unconfigured-onus" element={<UnconfiguredONUs />} />

        {/* Clientes Activos */}
        <Route path="/clientes-activos" element={<ClientesActivosPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
