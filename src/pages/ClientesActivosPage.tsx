import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

type Cliente = {
  id: string;
  nombre: string;
  direccion: string;
  plan: string;
  mensualidad: string;
  ip: string;
  fecha_pago: string;
};

const PAGE_SIZE = 15;

const ClientesActivosPage: React.FC = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  // 🔹 Cargar clientes desde Supabase
  useEffect(() => {
    let activo = true;
    const cargarClientes = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("clientes")
          .select("id, nombre, direccion, plan, mensualidad, ip, fecha_pago")
          .order("nombre", { ascending: true });

        if (error) throw error;
        if (activo) setClientes(data || []);
      } catch (err: any) {
        console.error("Error al cargar clientes:", err.message);
        setError(err.message);
      } finally {
        if (activo) setLoading(false);
      }
    };
    cargarClientes();
    return () => {
      activo = false;
    };
  }, []);

  // 🔍 Filtro y orden personalizado
  const filtrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();

    // Filtrado por texto
    let resultado = clientes.filter((c) =>
      [c.nombre, c.direccion, c.plan, c.ip, c.fecha_pago]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );

    // Reordenar: primero los que tienen nombre, dirección o plan
    resultado = resultado.sort((a, b) => {
      const aCompleto =
        (a.nombre?.trim() || "") !== "" ||
        (a.direccion?.trim() || "") !== "" ||
        (a.plan?.trim() || "") !== "";
      const bCompleto =
        (b.nombre?.trim() || "") !== "" ||
        (b.direccion?.trim() || "") !== "" ||
        (b.plan?.trim() || "") !== "";

      if (aCompleto === bCompleto) return 0;
      return aCompleto ? -1 : 1; // Los vacíos se van al final
    });

    return resultado;
  }, [clientes, busqueda]);

  // 🔢 Paginación
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const inicio = (paginaSegura - 1) * PAGE_SIZE;
  const filas = filtrados.slice(inicio, inicio + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
            Clientes <span className="text-blue-600">Activos</span>
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            ← Volver
          </button>
        </div>

        {/* Contenedor principal */}
        <div className="rounded-2xl bg-white/90 border border-gray-200 shadow-sm p-4 md:p-6">
          {/* Barra superior */}
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
            <div className="text-sm text-gray-600">
              {loading
                ? "Cargando clientes..."
                : `Total: ${filtrados.length} clientes`}
              {error && (
                <span className="text-rose-600 font-medium ml-2">
                  (Error: {error})
                </span>
              )}
            </div>
            <input
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por nombre, dirección, IP, plan..."
              className="w-full md:w-80 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gradient-to-r from-blue-600 to-sky-400 text-white text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Dirección</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Mensualidad (Q)</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">Fecha de pago</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500 animate-pulse"
                    >
                      Cargando datos de Supabase...
                    </td>
                  </tr>
                ) : filas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No hay resultados.
                    </td>
                  </tr>
                ) : (
                  filas.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-gray-100 hover:bg-sky-50 transition"
                    >
                      <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                        {c.nombre || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {c.direccion || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{c.plan || "-"}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {c.mensualidad || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{c.ip || "-"}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {c.fecha_pago || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {!loading && filtrados.length > 0 && (
            <div className="flex items-center justify-between mt-5">
              <button
                disabled={paginaSegura === 1}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  paginaSegura === 1
                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                    : "hover:bg-gray-50 border-gray-300"
                }`}
              >
                ← Anterior
              </button>
              <div className="text-sm text-gray-600">
                Página {paginaSegura} de {totalPaginas}
              </div>
              <button
                disabled={paginaSegura === totalPaginas}
                onClick={() =>
                  setPagina((p) => Math.min(totalPaginas, p + 1))
                }
                className={`px-3 py-2 rounded-lg border text-sm ${
                  paginaSegura === totalPaginas
                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                    : "hover:bg-gray-50 border-gray-300"
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

export default ClientesActivosPage;
