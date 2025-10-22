import React, { useEffect, useMemo, useState } from "react";
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
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const TraficoPage: React.FC = () => {
  const navigate = useNavigate();

  const socket = useMemo<Socket>(() => io("http://localhost:4000", { autoConnect: true }), []);
  const [socketOk, setSocketOk] = useState(false);
  const [labels, setLabels] = useState<string[]>([]);
  const [inData, setInData] = useState<number[]>([]);
  const [outData, setOutData] = useState<number[]>([]);

  useEffect(() => {
    const onConnect = () => setSocketOk(true);
    const onDisconnect = () => setSocketOk(false);

    const onTrafico = (data: any) => {
      const inVal = Number(data?.inGbps || 0).toFixed(2);
      const outVal = Number(data?.outGbps || 0).toFixed(2);
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      setLabels((prev) => {
        const updated = [...prev, time];
        return updated.length > 15 ? updated.slice(-15) : updated;
      });

      setInData((prev) => {
        const updated = [...prev, parseFloat(inVal)];
        return updated.length > 15 ? updated.slice(-15) : updated;
      });

      setOutData((prev) => {
        const updated = [...prev, parseFloat(outVal)];
        return updated.length > 15 ? updated.slice(-15) : updated;
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("trafico", onTrafico);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("trafico", onTrafico);
      socket.close();
    };
  }, [socket]);

  // Simulación si no hay socket
  useEffect(() => {
    if (socketOk) return;
    const id = setInterval(() => {
      const inVal = 1 + Math.random() * 0.5;
      const outVal = 0.8 + Math.random() * 0.6;
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      setLabels((prev) => {
        const updated = [...prev, time];
        return updated.length > 15 ? updated.slice(-15) : updated;
      });

      setInData((prev) => {
        const updated = [...prev, inVal];
        return updated.length > 15 ? updated.slice(-15) : updated;
      });

      setOutData((prev) => {
        const updated = [...prev, outVal];
        return updated.length > 15 ? updated.slice(-15) : updated;
      });
    }, 5000);
    return () => clearInterval(id);
  }, [socketOk]);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Tráfico Entrante INFINITUM (Gbps)",
        data: inData,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.15)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
      },
      {
        label: "Tráfico Saliente ACCESO A INTERNET (Gbps)",
        data: outData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.15)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
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
        title: { display: true, text: "Gbps", color: "#374151" },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-sky-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-slate-800">
          Monitoreo de <span className="text-sky-600">Tráfico</span> en Tiempo Real
        </h1>
        <button
          onClick={() => navigate("/home")}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-all"
        >
          ⬅ Regresar
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-700 mb-3">
          Estado Actual del Enlace Principal
        </h2>
        <Line data={chartData} options={chartOptions} />
      </div>

      <footer className="text-center text-gray-500 text-sm mt-6">
        v2.7.0 | © 2025 AleSmart | Network Traffic Monitor
      </footer>
    </div>
  );
};

export default TraficoPage;
