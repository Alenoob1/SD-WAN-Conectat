import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type ONU = {
  id: number;
  ponType: string;
  board: number;
  port: number;
  sn: string;
  type: string;
  status: string;
};

const UnconfiguredONUs: React.FC = () => {
  const [onus, setOnus] = useState<ONU[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOLT, setSelectedOLT] = useState("Todos");
  const [selectedPON, setSelectedPON] = useState("Any PON");
  const navigate = useNavigate();

  const API_BASE = "https://backend-sd-wan-1.onrender.com/api";

  useEffect(() => {
    console.log("🌍 API usada por Vercel:", API_BASE);
  }, []);

  useEffect(() => {
    const loadUnconfiguredOnus = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/onus/unconfigured`);
        const data = await res.json();

        if (data?.response && Array.isArray(data.response)) {
          const mapped = data.response.map((onu: any, idx: number) => ({
            id: idx + 1,
            ponType: onu.pon_type || "GPON",
            board: onu.board || 0,
            port: onu.port || 0,
            sn: onu.sn || "-",
            type: onu.model || "Desconocido",
            status: onu.status || "Disabled",
          }));
          setOnus(mapped);
        } else {
          setOnus([]);
          console.warn("⚠️ No se encontraron ONUs sin autorizar.");
        }
      } catch (err) {
        console.error("Error cargando ONUs:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUnconfiguredOnus();
  }, []);

  const handleAuthorize = (onu: ONU) => {
    navigate(`/authorize-onu/${onu.sn}`, { state: onu });
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/onus/unconfigured?force=true`);
      const data = await res.json();
      if (data?.response && Array.isArray(data.response)) {
        const mapped = data.response.map((onu: any, idx: number) => ({
          id: idx + 1,
          ponType: onu.pon_type || "GPON",
          board: onu.board || 0,
          port: onu.port || 0,
          sn: onu.sn || "-",
          type: onu.model || "Desconocido",
          status: onu.status || "Disabled",
        }));
        setOnus(mapped);
      }
    } catch (err) {
      console.error("Error recargando ONUs:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOnus = onus.filter((onu) => {
    const matchOLT =
      selectedOLT === "Todos" ||
      onu.ponType.toLowerCase().includes(selectedOLT.toLowerCase());
    const matchPON =
      selectedPON === "Any PON" ||
      onu.ponType.toLowerCase() === selectedPON.toLowerCase();
    return matchOLT && matchPON;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8 font-[Inter]">
      <div className="max-w-6xl mx-auto bg-white border border-slate-200 shadow-xl rounded-2xl p-4 sm:p-8">
        {/* 🔹 Encabezado */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            ONUs <span className="text-sky-600">sin autorizar</span>
          </h2>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
          >
            <span className="text-lg">🔄</span> Actualizar
          </button>
        </div>

        {/* 🔹 Filtros */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={selectedOLT}
            onChange={(e) => setSelectedOLT(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-sky-400 outline-none text-slate-700"
          >
            <option value="Todos">Todos los OLTs</option>
            <option value="Poaquil">OLT - Poaquil</option>
            <option value="Comalapa">OLT - Comalapa</option>
          </select>

          <select
            value={selectedPON}
            onChange={(e) => setSelectedPON(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-sky-400 outline-none text-slate-700"
          >
            <option>Any PON</option>
            <option>GPON</option>
            <option>EPON</option>
          </select>
        </div>

        {/* 🧾 Tabla responsiva */}
        <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="min-w-full text-sm text-slate-700">
            <thead className="bg-sky-600 text-white text-xs uppercase">
              <tr>
                <th className="py-3 px-4 text-left">#</th>
                <th className="py-3 px-4 text-left">PON TYPE</th>
                <th className="py-3 px-4 text-left">BOARD</th>
                <th className="py-3 px-4 text-left">PORT</th>
                <th className="py-3 px-4 text-left">SN / MAC</th>
                <th className="py-3 px-4 text-left">MODEL</th>
                <th className="py-3 px-4 text-left">STATUS</th>
                <th className="py-3 px-4 text-center">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-10 text-center text-slate-500 italic"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Cargando ONUs no configuradas...
                    </div>
                  </td>
                </tr>
              ) : filteredOnus.length > 0 ? (
                filteredOnus.map((onu) => (
                  <tr
                    key={onu.id}
                    className="border-b border-slate-100 hover:bg-sky-50 transition-all"
                  >
                    <td className="py-3 px-4">{onu.id}</td>
                    <td className="py-3 px-4">{onu.ponType}</td>
                    <td className="py-3 px-4">{onu.board}</td>
                    <td className="py-3 px-4">{onu.port}</td>
                    <td className="py-3 px-4 font-mono text-sky-700 break-all">
                      {onu.sn}
                    </td>
                    <td className="py-3 px-4">{onu.type}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          onu.status === "Disabled"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {onu.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleAuthorize(onu)}
                        className="bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-sm transition-all"
                      >
                        Autorizar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-6 text-slate-500 italic"
                  >
                    No hay ONUs pendientes de autorización
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 📱 Vista móvil tipo tarjeta */}
        <div className="grid grid-cols-1 sm:hidden gap-3 mt-4">
          {loading ? (
            <p className="text-center text-slate-500 italic">
              Cargando ONUs no configuradas...
            </p>
          ) : filteredOnus.length > 0 ? (
            filteredOnus.map((onu) => (
              <div
                key={onu.id}
                className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-sky-600">
                    #{onu.id} • {onu.ponType.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500">
                    Board {onu.board} / Port {onu.port}
                  </span>
                </div>
                <p className="font-mono text-blue-700 break-all">{onu.sn}</p>
                <p className="text-sm text-slate-600 mt-1">
                  Modelo: {onu.type}
                </p>
                <span
                  className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold ${
                    onu.status === "Disabled"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {onu.status}
                </span>
                <button
                  onClick={() => handleAuthorize(onu)}
                  className="mt-3 w-full bg-gradient-to-r from-blue-500 to-sky-600 text-white rounded-md py-2 text-sm font-semibold hover:from-blue-600 hover:to-sky-700 transition-all"
                >
                  Autorizar
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-500 italic">
              No hay ONUs pendientes de autorización
            </p>
          )}
        </div>

        {/* ➕ Botón inferior */}
        <div className="text-center mt-8">
          <button className="bg-sky-50 border border-sky-300 text-sky-700 font-semibold px-6 py-3 rounded-xl hover:bg-sky-100 transition-all">
            ➕ Agregar ONU manualmente
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnconfiguredONUs;
