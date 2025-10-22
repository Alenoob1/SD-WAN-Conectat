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
  FaHome,
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

  // 📊 Estados principales
  const [stats, setStats] = useState({
    waiting: 0,
    online: 0,
    offline: 0,
    low: 0,
  });
  const [olts, setOlts] = useState<OLT[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [onlineData, setOnlineData] = useState<number[]>([]);
  const [offlineData, setOfflineData] = useState<number[]>([]);

  // 🧠 Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        const statsRes = await fetch("http://localhost:4000/api/olt/stats");
        const statsData = await statsRes.json();
        setStats({
          waiting: statsData.waiting || 0,
          online: statsData.online || 0,
          offline: statsData.offline || 0,
          low: statsData.lowsignal || 0,
        });

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
        console.error("❌ Error al cargar datos iniciales:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 🔄 Actualizar stats reales cada minuto
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const statsRes = await fetch("http://localhost:4000/api/olt/stats");
        const statsData = await statsRes.json();
        setStats({
          waiting: statsData.waiting || 0,
          online: statsData.online || 0,
          offline: statsData.offline || 0,
          low: statsData.lowsignal || 0,
        });
      } catch (err) {
        console.error("⚠️ Error al actualizar stats:", err);
      }
    }, 60000); // cada 1 minuto

    return () => clearInterval(interval);
  }, []);

  // 🔁 Simular movimiento cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const onlineVar = Math.max(
        stats.online + Math.floor(Math.random() * 5 - 2),
        0
      );
      const offlineVar = Math.max(
        stats.offline + Math.floor(Math.random() * 3 - 1),
        0
      );

      setChartLabels((prev) => {
        const updated = [...prev, currentTime];
        return updated.length > 12 ? updated.slice(-12) : updated;
      });

      setOnlineData((prev) => {
        const updated = [...prev, onlineVar];
        return updated.length > 12 ? updated.slice(-12) : updated;
      });

      setOfflineData((prev) => {
        const updated = [...prev, offlineVar];
        return updated.length > 12 ? updated.slice(-12) : updated;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [stats]);

  // 📈 Configurar gráfico
  const chartData = {
    labels: chartLabels.length ? chartLabels : ["00:00"],
    datasets: [
      {
        label: "ONUs Online",
        data: onlineData.length ? onlineData : [stats.online],
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.15)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#22c55e",
      },
      {
        label: "ONUs Offline",
        data: offlineData.length ? offlineData : [stats.offline],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239,68,68,0.15)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#ef4444",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      tooltip: { mode: "index" as const, intersect: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#475569", stepSize: 10 },
        grid: { color: "#e2e8f0" },
      },
      x: {
        ticks: { color: "#475569" },
        grid: { color: "#f1f5f9" },
      },
    },
  };

  // 📊 Tarjetas principales
  const cards = [
    {
      title: "Waiting Authorization",
      value: stats.waiting,
      details: "ONUs pendientes",
      icon: <FaMagic className="text-sky-500 text-3xl mb-1" />,
      color: "border-t-4 border-sky-500",
      route: "/unconfigured-onus",
    },
    {
      title: "Online",
      value: stats.online,
      details: "Total autorizadas",
      icon: <FaServer className="text-green-500 text-3xl mb-1" />,
      color: "border-t-4 border-green-500",
      route: "/online-onus",
    },
    {
      title: "Offline",
      value: stats.offline,
      details: "Sin conexión",
      icon: <FaTimesCircle className="text-gray-700 text-3xl mb-1" />,
      color: "border-t-4 border-gray-700",
      route: "/offline-onus",
    },
    {
      title: "Low Signals",
      value: stats.low,
      details: "Baja potencia óptica",
      icon: <FaExclamationTriangle className="text-yellow-500 text-3xl mb-1" />,
      color: "border-t-4 border-yellow-500",
      route: "/low-signal-onus",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-[Segoe UI]">
      {/* 🔵 Navbar */}
      <div className="flex justify-between items-center bg-slate-800 text-white px-8 py-4 shadow-md">
        <h4 className="font-bold text-xl">
          Ale<span className="text-sky-400">OLT</span>
        </h4>
        <p>
          Bienvenido, <span className="font-semibold">Administrador</span>
        </p>
      </div>

      <div className="p-6">
        {/* 🔙 Botón para regresar al HomePage */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate("/home")}

            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg shadow transition"
          >
            <FaHome className="text-lg" />
            <span>Regresar al Home</span>
          </button>
        </div>

        <h3 className="text-2xl font-bold text-slate-800 mb-6 uppercase">
          Panel de Control de Red
        </h3>

        {loading ? (
          <div className="text-center text-gray-500">
            Cargando datos del sistema...
          </div>
        ) : (
          <>
            {/* 🟩 Tarjetas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {cards.map((card, index) => (
                <div
                  key={index}
                  onClick={() => navigate(card.route)}
                  className={`bg-white rounded-md shadow hover:shadow-lg transition-all duration-200 cursor-pointer text-center py-4 px-2 ${card.color}`}
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

            {/* 📈 Gráfica y OLTs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-md shadow p-4 border border-slate-200">
                <h4 className="font-semibold text-slate-700 mb-2 border-b pb-1">
                  Estado de Red (ONUs Online vs Offline)
                </h4>
                <Line data={chartData} options={chartOptions} />
              </div>

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

        <footer className="text-center mt-6 text-gray-500 text-sm">
          v2.7.0 | © 2025 AleSmart | SD-WAN & OLT Monitoring
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
