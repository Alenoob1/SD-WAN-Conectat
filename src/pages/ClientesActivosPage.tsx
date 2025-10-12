import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Onu = {
  unique_external_id: string;
  sn: string;
  olt_name: string;
  board: string;
  port: string;
  onu: string;
  onu_type_name: string;
  name: string;
  status: string;
  signal: string;
  signal_1310?: string | null;
  signal_1490?: string | null;
  zone_name?: string | null;
  plan_up?: string | null;
  plan_down?: string | null;
  iptv?: string | null;
  tr069?: string | null;
  catv?: string | null;
  authorization_date?: string | null;
  administrative_status?: string | null;
  mode?: string | null;
};

const PAGE_SIZE = 15;

const ClientesActivosPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Onu[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("http://localhost:4000/api/smartolt/onus");
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || `HTTP ${res.status}`);
        }
        const json = await res.json();
        if (!alive) return;
        setData(json.onus || []);
      } catch (e: any) {
        setError(e?.message || "Error desconocido");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data;
    return data.filter((o) =>
      [
        o.name,
        o.sn,
        o.unique_external_id,
        o.olt_name,
        o.onu_type_name,
        o.status,
        o.zone_name,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term))
    );
  }, [data, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const start = (pageSafe - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-800">
            Clientes <span className="text-blue-600">Activos</span>
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            ← Volver
          </button>
        </div>

        <div className="rounded-2xl bg-white/90 border border-gray-200 shadow-sm p-4 md:p-6">
          {/* Controles */}
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
            <div className="text-sm text-gray-600">
              {loading ? "Cargando…" : `Total: ${filtered.length} ONUs`}
              {error && (
                <span className="text-rose-600 font-medium ml-2">
                  (Error: {error})
                </span>
              )}
            </div>
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nombre, SN, OLT, estado…"
              className="w-full md:w-80 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-blue-600 to-sky-400 text-white text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">SN</th>
                  <th className="px-4 py-3">OLT / PON</th>
                  <th className="px-4 py-3">Modelo</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Señal</th>
                  <th className="px-4 py-3">Plan</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                      Cargando datos de SmartOLT…
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                      No hay resultados
                    </td>
                  </tr>
                ) : (
                  pageRows.map((o) => {
                    const estadoColor =
                      o.status?.toLowerCase().includes("online") ||
                      o.status?.toLowerCase().includes("working")
                        ? "text-green-600"
                        : o.status?.toLowerCase().includes("power")
                        ? "text-amber-600"
                        : "text-red-500";
                    return (
                      <tr key={o.unique_external_id} className="border-b border-gray-100 hover:bg-sky-50">
                        <td className="px-4 py-3 font-semibold text-gray-700">{o.name || "-"}</td>
                        <td className="px-4 py-3">{o.sn}</td>
                        <td className="px-4 py-3">
                          <div className="text-gray-700">{o.olt_name}</div>
                          <div className="text-xs text-gray-500">
                            B{O(o.board)} / P{O(o.port)} / ONU {O(o.onu)}
                          </div>
                        </td>
                        <td className="px-4 py-3">{o.onu_type_name || "-"}</td>
                        <td className={`px-4 py-3 font-bold ${estadoColor}`}>{o.status || "-"}</td>
                        <td className="px-4 py-3">
                          {o.signal || "-"}
                          <div className="text-xs text-gray-500">
                            1310: {o.signal_1310 ?? "-"}&nbsp;|&nbsp;1490: {o.signal_1490 ?? "-"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {o.plan_down || "-"} / {o.plan_up || "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación simple */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <button
                disabled={pageSafe === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={`px-3 py-2 rounded-lg border ${
                  pageSafe === 1 ? "text-gray-400 border-gray-200" : "hover:bg-gray-50"
                }`}
              >
                ← Anterior
              </button>
              <div className="text-sm text-gray-600">
                Página {pageSafe} de {totalPages}
              </div>
              <button
                disabled={pageSafe === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={`px-3 py-2 rounded-lg border ${
                  pageSafe === totalPages ? "text-gray-400 border-gray-200" : "hover:bg-gray-50"
                }`}
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// helper para mostrar 0 cuando falten datos
function O(v: any) {
  if (v === undefined || v === null || v === "") return "-";
  return String(v);
}

export default ClientesActivosPage;
