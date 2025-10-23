import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type ONU = {
  unique_external_id: string;
  sn: string;
  olt_name: string;
  board: string;
  port: string;
  onu: string;
  onu_type_name: string;
  zone_name: string;
  name: string;
  signal_1310: string;
  signal_1490: string;
  status: string;
};

const AllONUs: React.FC = () => {
  // 🔧 Variable global de entorno
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

  const [onus, setOnus] = useState<ONU[]>([]);
  const [filteredOnus, setFilteredOnus] = useState<ONU[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOlt, setSelectedOlt] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  // 🟢 Cargar ONUs iniciales
  const fetchData = async (force = false) => {
    setLoading(true);
    try {
      const url = force
        ? `${API_BASE}/onus/details?force=true`
        : `${API_BASE}/onus/details`;

      const res = await fetch(url);
      const json = await res.json();
      const list = json?.response?.onus || json?.onus || [];

      // 🔍 Filtrar ONUs con alarmas LOS o Power Fail
      const alertOnus = list.filter((onu: ONU) => {
        const status = (onu.status || "").toLowerCase();
        return status.includes("los") || status.includes("power fail");
      });

      setOnus(alertOnus);
      setFilteredOnus(alertOnus);
    } catch (err) {
      console.error("Error cargando ONUs:", err);
      toast.error("Error al cargar las ONUs desde el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // 🧠 Cargar al montar
  useEffect(() => {
    fetchData();
  }, []);

  // 🧩 Filtrar por OLT y texto de búsqueda
  useEffect(() => {
    let filtered = onus;

    if (selectedOlt !== "Todos") {
      filtered = filtered.filter(
        (o) => o.olt_name?.toLowerCase() === selectedOlt.toLowerCase()
      );
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.name?.toLowerCase().includes(term) ||
          o.sn?.toLowerCase().includes(term) ||
          o.zone_name?.toLowerCase().includes(term)
      );
    }

    setFilteredOnus(filtered);
  }, [selectedOlt, searchTerm, onus]);

  // 🔁 Refrescar desde SNMP (SmartOLT)
  const handleRefreshSNMP = async () => {
    try {
      setRefreshing(true);
      toast.info("Consultando SNMP en SmartOLT ⏳", { autoClose: 2000 });

      const res = await fetch(`${API_BASE}/onus/force-refresh`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.status) {
        toast.success(`Caché actualizado con ${data.total} ONUs nuevas 🚀`);
        await fetchData(true);
      } else {
        toast.warning(data.message || "SmartOLT alcanzó límite horario ⚠️");
      }
    } catch (err) {
      console.error("Error en refresh SNMP:", err);
      toast.error("Error al actualizar desde SNMP ❌");
    } finally {
      setRefreshing(false);
    }
  };

  // 🌀 Pantalla de carga
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Cargando ONUs con alarmas (LOS o Power Fail)...
          </p>
        </div>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={2500} />

      {/* ──────────────── Encabezado ──────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          ONUs con alarma — LOS / Power Fail
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* 🟢 Filtro por OLT */}
          <div className="flex items-center gap-2">
            <label className="text-gray-700 font-medium">OLT:</label>
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={selectedOlt}
              onChange={(e) => setSelectedOlt(e.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="POAQUIL">Poaquil</option>
              <option value="COMALAPA">Comalapa</option>
            </select>
          </div>

          {/* 🔍 Buscador */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, SN o zona..."
              className="border border-gray-300 rounded-lg px-4 py-2 pl-10 bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition w-72"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>

          {/* 🔄 Botón Refrescar SNMP */}
          <button
            onClick={handleRefreshSNMP}
            disabled={refreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold shadow-sm transition ${
              refreshing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600"
            }`}
          >
            {refreshing ? (
              <>
                <span className="animate-spin">🔄</span>
                <span>Actualizando...</span>
              </>
            ) : (
              <>
                <span>⚡ Refrescar SNMP</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ──────────────── Tabla ──────────────── */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-md">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <tr>
              <th className="px-4 py-3">SN</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">OLT</th>
              <th className="px-4 py-3">Ubicación</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">RX (1310)</th>
              <th className="px-4 py-3">TX (1490)</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredOnus.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-400">
                  ✅ No hay ONUs en estado LOS o Power Fail.
                </td>
              </tr>
            ) : (
              filteredOnus.map((onu, i) => (
                <tr
                  key={i}
                  className="border-b bg-yellow-50 hover:bg-yellow-100 transition-all duration-200"
                >
                  <td className="px-4 py-3 font-mono text-sm text-blue-600">
                    {onu.sn}
                  </td>
                  <td className="px-4 py-3">{onu.name || "-"}</td>
                  <td className="px-4 py-3">{onu.olt_name}</td>
                  <td className="px-4 py-3">
                    Board {onu.board} / Port {onu.port} / ONU {onu.onu}
                  </td>
                  <td className="px-4 py-3">{onu.onu_type_name || "—"}</td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      parseFloat(onu.signal_1310) < -28
                        ? "text-red-500"
                        : "text-green-600"
                    }`}
                  >
                    {onu.signal_1310 || "N/A"}
                  </td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      parseFloat(onu.signal_1490) < -28
                        ? "text-red-500"
                        : "text-green-600"
                    }`}
                  >
                    {onu.signal_1490 || "N/A"}
                  </td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        onu.status?.toLowerCase().includes("los")
                          ? "bg-yellow-200 text-yellow-800"
                          : onu.status?.toLowerCase().includes("power fail")
                          ? "bg-red-200 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {onu.status || "Desconocido"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllONUs;
