import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useNavigate } from "react-router-dom";
import {
  FaMagic,
  FaServer,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface OLT {
  id: number;
  name: string;
  uptime: string;
  temp: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Estados principales
  const [onlineCount, setOnlineCount] = useState(0);
  const [offlineCount, setOfflineCount] = useState(0);
  const [lowSignals, setLowSignals] = useState(0);
  const [waitingAuth, setWaitingAuth] = useState(0);
  const [olts, setOlts] = useState<OLT[]>([]);
  const [loading, setLoading] = useState(true);

  // 📡 Cargar datos desde backend
  useEffect(() => {
    const loadData = async () => {
      try {
        // Obtener ONUs
        const resOnus = await fetch("http://localhost:4000/api/onus");
        const onusData = await resOnus.json();

        const onus = onusData.response || [];

        // Calcular métricas
        const online = onus.filter((o: any) => o.status === "Online" || o.status === "online").length;
        const offline = onus.filter((o: any) => o.status === "Offline" || o.status === "offline").length;
        const low = onus.filter(
          (o: any) =>
            o.rx_power &&
            !isNaN(parseFloat(o.rx_power)) &&
            parseFloat(o.rx_power) < -26
        ).length;
        const waiting = onus.filter(
          (o: any) => o.status === "Unauthorized" || o.status === "unauthorized"
        ).length;

        setOnlineCount(online);
        setOfflineCount(offline);
        setLowSignals(low);
        setWaitingAuth(waiting);

        // Obtener OLTs
        const resOlts = await fetch("http://localhost:4000/api/olts");
        const oltsData = await resOlts.json();

        const mappedOlts = (oltsData.response || []).map(
          (olt: any, idx: number) => ({
            id: idx + 1,
            name: olt.name || `OLT ${idx + 1}`,
            uptime: olt.uptime || "N/A",
            temp: olt.temperature ? `${olt.temperature}°C` : "N/A",
          })
        );

        setOlts(mappedOlts);
      } catch (err) {
        console.error("❌ Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 📊 Gráfico dinámico
  const chartData = {
    labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
    datasets: [
      {
        label: "Online ONUs",
        data: [
          onlineCount - 5,
          onlineCount - 3,
          onlineCount,
          onlineCount + 2,
          onlineCount,
          onlineCount - 1,
        ],
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.15)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Offline",
        data: [
          offlineCount,
          offlineCount + 1,
          offlineCount + 2,
          offlineCount,
          offlineCount - 1,
          offlineCount,
        ],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239,68,68,0.15)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // 📦 Tarjetas principales
  const cards = [
    {
      title: "Waiting Authorization",
      value: waitingAuth,
      details: "ONUs pendientes",
      icon: <FaMagic className="text-blue-500 text-3xl mb-1" />,
      color: "border-t-4 border-blue-500",
      route: "/unconfigured-onus",
    },
    {
      title: "Online",
      value: onlineCount,
      details: "Total autorizadas",
      icon: <FaServer className="text-green-500 text-3xl mb-1" />,
      color: "border-t-4 border-green-500",
      route: "/online-onus",
    },
    {
      title: "Offline",
      value: offlineCount,
      details: "Sin conexión",
      icon: <FaTimesCircle className="text-gray-700 text-3xl mb-1" />,
      color: "border-t-4 border-gray-600",
      route: "/offline-onus",
    },
    {
      title: "Low Signals",
      value: lowSignals,
      details: "Baja potencia óptica",
      icon: <FaExclamationTriangle className="text-yellow-500 text-3xl mb-1" />,
      color: "border-t-4 border-yellow-500",
      route: "/low-signal-onus",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-[Segoe UI]">
      {/* 🔵 Navbar superior */}
      <div className="flex justify-between items-center bg-slate-800 text-white px-8 py-4 shadow-md">
        <h4 className="font-bold text-xl">
          Ale<span className="text-sky-400">OLT</span>
        </h4>
        <p>
          Bienvenido, <span className="font-semibold">Administrador</span>
        </p>
      </div>

      <div className="p-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-6 uppercase">
          Panel de Control de Red
        </h3>

        {loading ? (
          <div className="text-center text-gray-500">Cargando datos del sistema...</div>
        ) : (
          <>
            {/* 🟩 Tarjetas de estado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-md shadow hover:shadow-lg transition-all duration-200 cursor-pointer text-center py-4 px-2 ${card.color}`}
                  onClick={() => navigate(card.route)}
                >
                  <div className="flex flex-col items-center justify-center">
                    {card.icon}
                    <h4 className="font-semibold text-slate-700 text-sm mt-1">
                      {card.title}
                    </h4>
                    <h2 className="text-3xl font-bold text-slate-900 my-1">
                      {card.value}
                    </h2>
                    <p className="text-gray-500 text-xs">{card.details}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 📈 Gráfica y lista de OLTs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gráfica */}
              <div className="lg:col-span-2 bg-white rounded-md shadow p-4 border border-slate-200">
                <h4 className="font-semibold text-slate-700 mb-2 border-b pb-1">
                  Network Status
                </h4>
                <Line data={chartData} />
              </div>

              {/* Lista de OLTs */}
              <div className="bg-white rounded-md shadow border border-slate-200">
                <h4 className="font-semibold text-slate-700 p-3 border-b">
                  OLTs Activas
                </h4>
                <ul className="divide-y text-sm">
                  {olts.length > 0 ? (
                    olts.map((olt) => (
                      <li
                        key={olt.id}
                        className="flex justify-between items-center p-3"
                      >
                        <span>{olt.name}</span>
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs">
                          {olt.uptime} | {olt.temp}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="p-3 text-gray-500 text-center">
                      No hay OLTs activas
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </>
        )}

        {/* 📆 Footer */}
        <footer className="text-center mt-6 text-gray-500 text-sm">
          v2.5.0 | © 2025 AleSmart | Panel SD-WAN & OLT Monitoring
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
