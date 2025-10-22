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
  const navigate = useNavigate();

  // 🔹 Cargar ONUs desde el backend
  useEffect(() => {
    const loadUnconfiguredOnus = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/onus/unconfigured");
        const data = await res.json();

        if (data && data.response) {
          const mapped = data.response.map((onu: any, idx: number) => ({
            id: idx + 1,
            ponType: onu.pon_type || "GPON",
            board: onu.board || 0,
            port: onu.port || 0,
            sn: onu.sn || "-",
            type: onu.model || "-",
            status: onu.status || "Disabled",
          }));
          setOnus(mapped);
        }
      } catch (err) {
        console.error("Error cargando ONUs:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUnconfiguredOnus();
  }, []);

  // 🔹 Redirigir al formulario de autorización
  const handleAuthorize = (onu: ONU) => {
    navigate(`/authorize-onu/${onu.sn}`, { state: onu });
  };

  // 🔹 Recargar tabla
  const handleRefresh = () => {
    setLoading(true);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-[Inter]">
      {/* 🔹 Encabezado */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          ONUs <span className="text-sky-600">sin autorizar</span>
        </h2>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg shadow transition-all"
        >
          <span className="text-lg">🔄</span> Refresh
        </button>
      </div>

      {/* 🔹 Filtros */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select className="border border-slate-300 rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-sky-400 outline-none text-slate-700">
          <option>OLT - POAQUIL</option>
          <option>OLT - COMALAPA</option>
        </select>
        <select className="border border-slate-300 rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-sky-400 outline-none text-slate-700">
          <option>Any PON</option>
          <option>GPON</option>
          <option>EPON</option>
        </select>
      </div>

      {/* 🔹 Tabla */}
      <div className="bg-white border border-slate-200 shadow-md rounded-xl overflow-hidden">
        <table className="min-w-full text-sm text-slate-700">
          <thead className="bg-sky-600 text-white uppercase text-xs">
            <tr>
              <th className="py-3 px-4 text-left">#</th>
              <th className="py-3 px-4 text-left">PON Type</th>
              <th className="py-3 px-4 text-left">Board</th>
              <th className="py-3 px-4 text-left">Port</th>
              <th className="py-3 px-4 text-left">SN / MAC</th>
              <th className="py-3 px-4 text-left">Model</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-500 italic">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                    Cargando ONUs no configuradas...
                  </div>
                </td>
              </tr>
            ) : onus.length > 0 ? (
              onus.map((onu) => (
                <tr
                  key={onu.id}
                  className="border-b border-slate-100 hover:bg-sky-50 transition-all"
                >
                  <td className="py-3 px-4">{onu.id}</td>
                  <td className="py-3 px-4">{onu.ponType}</td>
                  <td className="py-3 px-4">{onu.board}</td>
                  <td className="py-3 px-4">{onu.port}</td>
                  <td className="py-3 px-4 font-mono text-sky-700">{onu.sn}</td>
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
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-sm transition-all"
                    >
                      Authorize
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

      {/* 🔹 Botón inferior */}
      <div className="text-center mt-8">
        <button className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all">
          ➕ Add ONU for later authorization
        </button>
      </div>
    </div>
  );
};

export default UnconfiguredONUs;
