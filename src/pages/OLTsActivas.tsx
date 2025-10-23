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

  useEffect(() => {
    const fetchOlts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get("http://localhost:4000/api/olts/temperature");
        // 🔹 Aquí se corrige la extracción de datos
        if (res.data?.status && Array.isArray(res.data.olts)) {
          setOlts(res.data.olts);
        } else {
          setError("No se recibieron datos válidos del servidor");
        }
      } catch (err) {
        console.error("❌ Error al obtener OLTs:", err);
        setError("Error al conectar con el backend");
      } finally {
        setLoading(false);
      }
    };

    fetchOlts();
    const interval = setInterval(fetchOlts, 120000); // refresca cada 2 minutos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
      <h2 className="font-semibold text-gray-700 border-b pb-2 mb-3">
        OLTs Activas
      </h2>

      {loading ? (
        <p className="text-gray-500 text-sm">Cargando datos...</p>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : (
        <div className="space-y-2">
          {olts.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay OLTs registradas</p>
          ) : (
            olts.map((olt) => (
              <div
                key={olt.olt_id}
                className="flex justify-between items-center border-b last:border-none py-1"
              >
                <span className="font-medium text-gray-800">{olt.olt_name}</span>
                <span
                  className={`px-2 py-1 text-xs rounded-full text-white ${
                    parseInt(olt.env_temp) > 35 ? "bg-red-500" : "bg-green-500"
                  }`}
                >
                  ⏱️ {olt.uptime} | 🌡️ {olt.env_temp}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default OLTsActivas;
