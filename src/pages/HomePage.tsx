import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import userPhoto from "../assets/spyese.jpg";

// Helper para tiempo relativo
function relativeTime(ts: number) {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return `hace ${sec}s`;
  const min = Math.floor(sec / 60);
  if (min === 1) return "hace 1 minuto";
  return `hace ${min} minutos`;
}

const StatusPage: React.FC = () => {
  const navigate = useNavigate();

  // 🔹 Leer base URL del backend desde .env
  const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:4000";

  // Crear conexión Socket.io
  const socket = useMemo<Socket>(() => io(API_BASE, { autoConnect: true }), [API_BASE]);

  const [trafico, setTrafico] = useState("0.00 Gbps");
  const [socketOk, setSocketOk] = useState<boolean>(false);

  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [nowTick, setNowTick] = useState(0);

  // 🎧 Escuchar eventos del socket
  useEffect(() => {
    const onConnect = () => {
      setSocketOk(true);
      console.log("✅ Socket conectado:", socket.id);
    };
    const onError = (err: any) => {
      setSocketOk(false);
      console.error("❌ Error socket:", err?.message || err);
    };
    const onDisconnect = () => {
      setSocketOk(false);
      console.warn("⚠️ Socket desconectado");
    };
    const onTrafico = (data: any) => {
      if (data?.promedio) {
        setTrafico(`${Number(data.promedio).toFixed(2)} Gbps`);
      } else if (data?.inGbps && data?.outGbps) {
        const avg = (Number(data.inGbps) + Number(data.outGbps)) / 2;
        setTrafico(`${avg.toFixed(2)} Gbps`);
      }
      setLastUpdated(Date.now());
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onError);
    socket.on("error", onError);
    socket.on("disconnect", onDisconnect);
    socket.on("trafico", onTrafico);

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onError);
      socket.off("error", onError);
      socket.off("disconnect", onDisconnect);
      socket.off("trafico", onTrafico);
      socket.close();
    };
  }, [socket]);

  // 🧠 Simulación si no hay conexión real al backend
  useEffect(() => {
    if (socketOk) return;
    const id = setInterval(() => {
      const inGbps = 1 + Math.random() * 0.5;
      const outGbps = 1 + Math.random() * 0.5;
      const avg = (inGbps + outGbps) / 2;
      setTrafico(`${avg.toFixed(2)} Gbps`);
      setLastUpdated(Date.now());
    }, 3000);
    return () => clearInterval(id);
  }, [socketOk]);

  // 🕒 Re-render cada 30s para refrescar el tiempo relativo
  useEffect(() => {
    const id = setInterval(() => setNowTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // 🔗 Navegación
  const handleXtream = () => window.open("http://192.168.99.253:25500/login.php", "_blank");
  const handleAstra = () => window.open("http://192.168.99.254:8000/#/", "_blank");
  const handleMikrotik = () => window.open("http://192.168.0.1", "_blank");
  const handleFact = () => window.open("https://conectatayd.fac.gt/signin", "_blank");
  const handleOLTs = () => navigate("/dashboard");
  const handleLogout = () => navigate("/login");
  const goToClientesActivos = () => navigate("/clientes-activos");

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100 text-gray-800 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white/90 backdrop-blur-xl shadow-xl flex flex-col p-5 md:p-6 rounded-b-3xl md:rounded-none md:rounded-r-3xl">
        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-700 to-sky-500 bg-clip-text text-transparent mb-5 text-center">
          AleSmart<span className="text-sky-400">.</span>
        </h1>

        {/* Perfil */}
        <div className="flex flex-col items-center mb-4">
          <img
            src={userPhoto}
            alt="Perfil"
            className="w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-blue-400 shadow-md hover:scale-105 transition-all duration-300"
          />
          <h2 className="font-semibold text-base md:text-lg mt-2 text-gray-800 text-center">
            Alejandro Calel
          </h2>
          <p className="text-[11px] md:text-xs text-blue-600 font-medium">
            Administrador de Red
          </p>
        </div>

        {/* Navegación */}
        <nav className="flex flex-col gap-2 mt-2">
          <button onClick={() => navigate("/home")} className="nav-btn">🏠 Inicio</button>
          <button onClick={handleXtream} className="nav-btn">📺 Xtream IPTV</button>
          <button onClick={handleAstra} className="nav-btn">🚀 Astra</button>
          <button onClick={handleMikrotik} className="nav-btn">🌐 Mikrotik SD-WAN</button>
          <button onClick={handleFact} className="nav-btn">💰 Facturación</button>
          <button onClick={handleOLTs} className="nav-btn">🛰️ OLTs</button>
          <button onClick={handleLogout} className="nav-btn">🔒 Cerrar sesión</button>
        </nav>

        <div className="mt-auto text-[10px] md:text-xs text-center text-gray-500 pt-4 md:pt-6">
          v2.5.0 | © 2025 AleSmart
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-6 md:p-10 space-y-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-gray-800 text-center sm:text-left">
            Estado de la <span className="text-blue-600">Red</span>
          </h1>
          <div className="text-xs md:text-sm text-gray-500 text-center sm:text-right">
            Última actualización:{" "}
            <span className="text-blue-600 font-medium">
              {lastUpdated ? relativeTime(lastUpdated) : "—"}
            </span>
          </div>
        </div>

        {/* Tarjetas */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {[
            {
              title: "Clientes Activos",
              value: "1,245",
              color: "from-blue-500 to-sky-400",
              icon: "👥",
              onClick: goToClientesActivos,
            },
            {
              title: "Tráfico Promedio",
              value: trafico,
              color: "from-green-400 to-emerald-500",
              icon: "📶",
              onClick: () => navigate("/trafico"),
            },
            {
              title: "Alarmas",
              value: "3",
              color: "from-rose-400 to-pink-500",
              icon: "🚨",
              onClick: () => navigate("/alarmas"),
            },
          ].map((stat, i) => (
            <div
              key={i}
              onClick={stat.onClick}
              className={`rounded-2xl bg-white/80 border border-gray-200 shadow-md p-6 transition-all duration-300 ${
                stat.onClick
                  ? "cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:ring-2 hover:ring-blue-300"
                  : ""
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <p className="uppercase text-xs font-semibold text-gray-500">
                  {stat.title}
                </p>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <h2
                className={`text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}
              >
                {stat.value}
              </h2>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-blue-700 uppercase tracking-wide">
            Dispositivos Monitoreados
          </h2>
          <div className="overflow-x-auto rounded-2xl bg-white/90 border border-gray-200 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-blue-600 to-sky-400 text-white text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">IP</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Último Ping</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    name: "OLT ZTE C300",
                    ip: "192.168.99.253",
                    status: "Online",
                    ping: "24ms",
                  },
                  {
                    name: "Router Mikrotik",
                    ip: "192.168.0.1",
                    status: "Online",
                    ping: "15ms",
                  },
                  {
                    name: "Xtream IPTV Server",
                    ip: "192.168.99.254",
                    status: "Online",
                    ping: "10ms",
                  },
                ].map((dev, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 hover:bg-sky-50 transition-all duration-150"
                  >
                    <td className="px-6 py-3 font-semibold text-gray-700">
                      {dev.name}
                    </td>
                    <td className="px-6 py-3">{dev.ip}</td>
                    <td
                      className={`px-6 py-3 font-bold ${
                        dev.status === "Online"
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {dev.status}
                    </td>
                    <td className="px-6 py-3 text-gray-600">{dev.ping}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StatusPage;
