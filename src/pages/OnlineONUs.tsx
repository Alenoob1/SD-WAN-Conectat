import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
  const [onus, setOnus] = useState<ONU[]>([]);
  const [filteredOnus, setFilteredOnus] = useState<ONU[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOlt, setSelectedOlt] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // 🟢 Obtener ONUs desde API
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/onus/details`);
      const json = await res.json();
      const list = json?.response?.onus || json?.onus || [];
      setOnus(list);
      setFilteredOnus(list);
    } catch (err) {
      console.error("Error cargando ONUs:", err);
      toast.error("Error al cargar las ONUs ❌");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Refrescar datos desde SNMP
  const handleForceRefresh = async () => {
    try {
      setRefreshing(true);
      toast.info("Actualizando datos directamente desde SNMP ⏳");

      const res = await fetch(`${API_BASE}/onus/force-refresh`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.status) {
        toast.success(`Caché actualizado: ${data.total} ONUs recargadas 🚀`);
        await fetchData();
      } else {
        toast.warning(data.message || "SmartOLT sigue en límite horario ⚠️");
      }
    } catch (err) {
      toast.error("Error al intentar refrescar datos desde SNMP ❌");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔍 Filtrado dinámico
  useEffect(() => {
    let filtered = [...onus];

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

  // ⏳ Pantalla de carga
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ONUs...</p>
        </div>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={2500} />

      {/* ─────────────── Encabezado ─────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Todas las ONUs — SmartOLT
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* 🏠 Volver al Dashboard */}
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg shadow-md transition-all"
          >
            ⬅️ Volver al Dashboard
          </button>

          {/* 🟢 Filtro OLT */}
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

          {/* 🔄 Botón Refrescar */}
          <button
            onClick={handleForceRefresh}
            disabled={refreshing}
            className={`px-4 py-2 rounded-lg font-semibold text-white shadow-sm transition-all ${
              refreshing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
            }`}
          >
            {refreshing ? "Actualizando..." : "🔄 Refrescar SNMP"}
          </button>
        </div>
      </div>

      {/* ─────────────── Tabla de ONUs ─────────────── */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-200">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <tr>
              <th className="px-4 py-3">SN</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">OLT</th>
              <th className="px-4 py-3">Ubicación</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">RX (1310)</th>
              <th className="px-4 py-3">TX (1490)</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOnus.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-6 text-gray-400">
                  No hay ONUs que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              filteredOnus.map((onu, i) => (
                <tr
                  key={i}
                  className="border-b hover:bg-blue-50 transition-all duration-200"
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
                  <td className="px-4 py-3">{onu.signal_1310}</td>
                  <td className="px-4 py-3">{onu.signal_1490}</td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        onu.status?.toLowerCase() === "online"
                          ? "bg-green-100 text-green-700"
                          : onu.status?.toLowerCase() === "offline"
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {onu.status || "Desconocido"}
                    </span>
                  </td>

                  {/* 🔎 Botón Detalle */}
                  <td className="text-center">
                    <button
                      onClick={() =>
                        navigate(`/onu/${onu.unique_external_id}`)
                      }
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition"
                    >
                      Ver
                    </button>
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
