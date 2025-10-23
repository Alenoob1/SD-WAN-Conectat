import React, { useEffect, useState } from "react";
import axios from "axios";

type Olt = {
  olt_id: string;
  olt_name: string;
  uptime: string;
  env_temp: string;
};

const OLTsActivas: React.FC = () => {
  const [olts, setOlts] = useState<Olt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🌐 URL base desde variable de entorno
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

  useEffect(() => {
    const fetchOlts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${API_BASE}/olts/temperature`);

        // ✅ Adaptar al formato real del backend
        const data = res.data?.response || res.data?.olts || [];

        if (Array.isArray(data) && data.length > 0) {
          // Mapea para garantizar consistencia
          const mapped = data.map((olt: any) => ({
            olt_id: olt.olt_id || olt.id || "",
            olt_name: olt.olt_name || "Desconocida",
            uptime: olt.uptime || "N/A",
            env_temp: olt.env_temp?.replace("°C", "") || "N/A",
          }));
          setOlts(mapped);
        } else {
          setOlts([]);
          setError("No se recibieron datos válidos del servidor.");
        }
      } catch (err) {
        console.error("❌ Error al obtener OLTs:", err);
        setError("Error al conectar con el backend o servidor inactivo.");
      } finally {
        setLoading(false);
      }
    };

    // 🔄 Llamar al cargar
    fetchOlts();

    // 🔁 Actualizar cada 2 minutos
    const interval = setInterval(fetchOlts, 120000);
    return () => clearInterval(interval);
  }, [API_BASE]);

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-md p-4">
      <h2 className="font-semibold text-gray-700 border-b pb-2 mb-3">
        OLTs Activas
      </h2>

      {loading ? (
        <p className="text-gray-500 text-sm animate-pulse">
          Cargando datos...
        </p>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : olts.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay OLTs registradas</p>
      ) : (
        <div className="space-y-2">
          {olts.map((olt) => (
            <div
              key={olt.olt_id}
              className="flex justify-between items-center border-b last:border-none py-2 px-1 hover:bg-gray-50 rounded-lg transition-all"
            >
              <span className="font-medium text-gray-800">{olt.olt_name}</span>

              <span
                className={`px-2 py-1 text-xs rounded-full text-white flex items-center gap-1 ${
                  parseInt(olt.env_temp) > 35
                    ? "bg-red-500"
                    : parseInt(olt.env_temp) >= 30
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              >
                ⏱️ {olt.uptime} | 🌡️ {olt.env_temp}°C
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OLTsActivas;
