import React from "react";
import { useNavigate } from "react-router-dom";
import userPhoto from "../assets/spyese.jpg"; // 👈 Tu logo o imagen

const StatusPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aquí podrías limpiar sesiones o tokens si tuvieras autenticación real
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100 text-gray-800 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white/90 backdrop-blur-xl shadow-xl flex flex-col p-5 md:p-6 rounded-b-3xl md:rounded-none md:rounded-r-3xl">
        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-700 to-sky-500 bg-clip-text text-transparent mb-4 md:mb-6 tracking-wide text-center">
          AleSmart<span className="text-sky-400">.</span>
        </h1>

        {/* Perfil */}
        <div className="flex flex-col items-center mb-4 md:mb-6">
          <img
            src={userPhoto}
            alt="Perfil"
            className="w-16 h-16 md:w-24 md:h-24 rounded-full border-3 border-blue-400 shadow-md hover:scale-105 transition-all duration-300"
          />
          <h2 className="font-semibold text-base md:text-lg mt-2 text-gray-800 text-center">
            Alejandro Calel
          </h2>
          <p className="text-[11px] md:text-xs text-blue-600 font-medium">
            Administrador de Red
          </p>
        </div>

        {/* Navegación */}
        <nav className="flex flex-col gap-1 md:gap-2 mt-2">
          {[
            { label: "Inicio", icon: "🏠" },
            { label: "Mikrotik SD-WAN", icon: "🌐" },
            { label: "Facturación", icon: "💰" },
            { label: "OLTs", icon: "🛰️" },
            { label: "Configuración", icon: "⚙️" },
          ].map((item, idx) => (
            <a
              key={idx}
              href="#"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-sky-400 hover:text-white transition-all text-sm md:text-base"
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="mt-auto text-[10px] md:text-xs text-center text-gray-500 pt-4 md:pt-6">
          v2.5.0 | © 2025 AleSmart
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-5 md:p-10 space-y-8 md:space-y-10">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-gray-800 text-center sm:text-left">
            Estado de la <span className="text-blue-600">Red</span>
          </h1>

          {/* Sección derecha: actualización + botón */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs md:text-sm text-gray-500 text-center sm:text-right">
            <p>
              Última actualización:{" "}
              <span className="text-blue-600 font-medium">hace 3 min</span>
            </p>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-blue-600 to-sky-400 text-white px-4 py-1.5 rounded-lg shadow-md hover:shadow-lg hover:opacity-90 active:scale-95 transition-all duration-300 text-xs md:text-sm font-medium"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Tarjetas */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[
            {
              title: "Clientes Activos",
              value: "1,245",
              color: "from-blue-500 to-sky-400",
              icon: "👥",
            },
            {
              title: "Tráfico Promedio",
              value: "210 Mbps",
              color: "from-green-400 to-emerald-500",
              icon: "📶",
            },
            {
              title: "Alarmas",
              value: "5",
              color: "from-rose-400 to-pink-500",
              icon: "🚨",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-xl bg-white/80 border border-gray-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-5 text-center sm:text-left"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs md:text-sm text-gray-500 font-semibold uppercase tracking-wide">
                  {stat.title}
                </p>
                <span className="text-lg md:text-xl">{stat.icon}</span>
              </div>
              <h2
                className={`text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}
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
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-gradient-to-r from-blue-600 to-sky-400 text-white text-[10px] md:text-xs uppercase">
                <tr>
                  <th className="px-4 md:px-6 py-3">Nombre</th>
                  <th className="px-4 md:px-6 py-3">IP</th>
                  <th className="px-4 md:px-6 py-3">Estado</th>
                  <th className="px-4 md:px-6 py-3">Último Ping</th>
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
                    status: "Offline",
                    ping: "--",
                  },
                ].map((dev, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 hover:bg-sky-50 transition-all duration-150"
                  >
                    <td className="px-4 md:px-6 py-3 font-semibold text-gray-700">
                      {dev.name}
                    </td>
                    <td className="px-4 md:px-6 py-3 text-gray-600">
                      {dev.ip}
                    </td>
                    <td
                      className={`px-4 md:px-6 py-3 font-semibold ${
                        dev.status === "Online"
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {dev.status}
                    </td>
                    <td className="px-4 md:px-6 py-3 text-gray-600">
                      {dev.ping}
                    </td>
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
