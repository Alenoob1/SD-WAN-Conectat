import React from "react";
import { useNavigate } from "react-router-dom";

const AlarmasPage: React.FC = () => {
  const navigate = useNavigate();

  // Ejemplo de alarmas de advertencia
  const alarmas = [
    { id: 1, dispositivo: "ONU ZTE-GPON-1234", tipo: "Señal baja (-25 dBm)", estado: "Advertencia", hora: "10:42 AM" },
    { id: 2, dispositivo: "OLT ZTE-C300 Puerto 2/4", tipo: "Pérdida de paquetes", estado: "Advertencia", hora: "10:50 AM" },
    { id: 3, dispositivo: "Router Mikrotik CORE", tipo: "Latencia elevada (190 ms)", estado: "Advertencia", hora: "11:10 AM" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-amber-100 text-gray-800 flex flex-col p-6 md:p-10 font-[Segoe UI]">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-amber-700">
          Alarmas del Sistema ⚠️
        </h1>
        <button
          onClick={() => navigate("/home")}
          className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
        >
          ← Volver al Panel
        </button>
      </div>

      {/* Descripción */}
      <p className="text-gray-600 mb-4">
        Estas son las alarmas detectadas recientemente en el sistema. 
        Las advertencias no son críticas, pero requieren seguimiento técnico.
      </p>

      {/* Tabla de alarmas */}
      <div className="overflow-x-auto rounded-2xl bg-white/90 border border-yellow-300 shadow-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-gradient-to-r from-yellow-500 to-amber-400 text-white uppercase text-xs">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Dispositivo</th>
              <th className="px-6 py-3">Tipo</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Hora</th>
            </tr>
          </thead>
          <tbody>
            {alarmas.map((a) => (
              <tr
                key={a.id}
                className="border-b hover:bg-amber-50 transition-all duration-150"
              >
                <td className="px-6 py-3 font-semibold text-gray-700">{a.id}</td>
                <td className="px-6 py-3">{a.dispositivo}</td>
                <td className="px-6 py-3">{a.tipo}</td>
                <td className="px-6 py-3">
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                    ⚠️ {a.estado}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-600">{a.hora}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pie */}
      <footer className="text-center text-gray-500 text-xs mt-8">
        v2.5.0 | © 2025 AleSmart - Monitoreo de Alarmas
      </footer>
    </div>
  );
};

export default AlarmasPage;
