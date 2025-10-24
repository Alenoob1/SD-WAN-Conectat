import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type ONU = {
  unique_external_id: string;
  sn: string;
  name: string;
  olt_name: string;
  board: string;
  port: string;
  onu: string;
  onu_type_name: string;
  status: string;
  signal_1310: string;
  signal_1490: string;
};

const ONUDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [onu, setOnu] = useState<ONU | null>(null);
  const [newName, setNewName] = useState("");
  const [bandwidth, setBandwidth] = useState("20 Mbps");
  const [loading, setLoading] = useState(true);
  const [appliedIP, setAppliedIP] = useState<string | null>(null);
  const [wanData, setWanData] = useState({
    ipv4_address: "",
    subnet_mask: "",
    gateway: "",
    dns1: "8.8.8.8",
    dns2: "8.8.4.4",
  });

  // 🌐 Variable global para entorno
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

  // 🟢 Cargar datos de la ONU específica
  useEffect(() => {
    const fetchOnuDetails = async () => {
      try {
        const res = await fetch(`${API_BASE}/onus/details`);
        const data = await res.json();

        const allOnus = data?.response?.onus || data?.onus || data?.data || [];
        const found =
          allOnus.find(
            (o: any) =>
              o.sn?.toUpperCase() === id?.toUpperCase() ||
              o.unique_external_id?.toUpperCase() === id?.toUpperCase()
          ) || null;

        if (found) {
          setOnu(found);
          setNewName(found.name);
        } else {
          toast.warning("No se encontró información de la ONU seleccionada ⚠️");
        }
      } catch (err) {
        console.error("Error al cargar ONU:", err);
        toast.error("Error al cargar detalles de la ONU ❌");
      } finally {
        setLoading(false);
      }
    };

    fetchOnuDetails();
  }, [id, API_BASE]);

  // ✏️ Actualizar nombre (simulado)
  const handleUpdateName = async () => {
    toast.info("Actualizando nombre...");
    setTimeout(() => {
      toast.success(`Nombre actualizado a "${newName}" ✅`);
    }, 1000);
  };

  // 🔄 Reiniciar ONU (simulado)
  const handleReboot = async () => {
    toast.info("Reiniciando ONU...");
    setTimeout(() => toast.success("ONU reiniciada correctamente 🔁"), 1500);
  };

  // 🚫 Deshabilitar ONU (simulado)
  const handleDisable = async () => {
    toast.warn("Deshabilitando ONU temporalmente...");
    setTimeout(() => toast.success("ONU deshabilitada temporalmente ⚙️"), 1200);
  };

  // 🗑️ Eliminar ONU (real)
  const handleDelete = async () => {
    if (!onu || !window.confirm("¿Seguro que deseas eliminar esta ONU?")) return;

    try {
      toast.info("Eliminando ONU...");
      const res = await fetch(`${API_BASE}/onus/delete/${onu.unique_external_id}`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok && data.response?.status) {
        toast.success("ONU eliminada correctamente 🗑️");
        setTimeout(() => navigate("/online-onus"), 2000);
      } else {
        toast.error(data.message || "No se pudo eliminar la ONU ❌");
      }
    } catch (err) {
      console.error("Error al eliminar ONU:", err);
      toast.error("Error al conectar con el servidor ❌");
    }
  };

  // ⚙️ Aplicar IP Estática WAN
  const handleSetWAN = async () => {
    if (!onu) return;

    try {
      toast.info("Aplicando configuración WAN...");
      const res = await fetch(`${API_BASE}/onus/${onu.unique_external_id}/set-wan-static`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wanData),
      });

      const data = await res.json();
      if (data.status) {
        toast.success("Configuración WAN aplicada correctamente 🚀");
        setAppliedIP(wanData.ipv4_address);
      } else {
        toast.warning(data.message || "SmartOLT rechazó la configuración ⚠️");
      }
    } catch (err) {
      console.error("Error WAN:", err);
      toast.error("Error al aplicar la configuración WAN ❌");
    }
  };

  // 🕓 Cargando
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles de la ONU...</p>
        </div>
      </div>
    );

  // ⚠️ Si no hay datos
  if (!onu)
    return (
      <div className="text-center p-10">
        <p className="text-gray-600">No se encontró la información de la ONU.</p>
        <button
          onClick={() => navigate("/online-onus")}
          className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Volver
        </button>
      </div>
    );

  // 🧩 Vista principal
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="bg-white p-6 rounded-2xl shadow-md max-w-3xl mx-auto border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
          Detalle de ONU — {onu.name || "Sin nombre"}
        </h2>

        {/* Información general */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-gray-700">
          <p><strong>SN:</strong> {onu.sn}</p>
          <p><strong>OLT:</strong> {onu.olt_name}</p>
          <p><strong>Ubicación:</strong> Board {onu.board} / Port {onu.port} / ONU {onu.onu}</p>
          <p><strong>Tipo:</strong> {onu.onu_type_name}</p>
          <p>
            <strong>Estado:</strong>{" "}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                onu.status?.toLowerCase() === "online"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {onu.status}
            </span>
          </p>
          <p><strong>RX (1310nm):</strong> {onu.signal_1310} dBm</p>
          <p><strong>TX (1490nm):</strong> {onu.signal_1490} dBm</p>
        </div>

        <hr className="my-4" />

        {/* Cambiar nombre */}
        <div className="mb-6">
          <label className="font-semibold text-gray-700">Cambiar nombre del cliente:</label>
          <div className="flex mt-2 gap-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Juan Pérez / Casa principal"
            />
            <button
              onClick={handleUpdateName}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Guardar
            </button>
          </div>
        </div>

        {/* Ancho de banda */}
        <div className="mb-6">
          <label className="font-semibold text-gray-700">Ancho de banda:</label>
          <select
            value={bandwidth}
            onChange={(e) => setBandwidth(e.target.value)}
            className="mt-2 border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
          >
            <option>10 Mbps</option>
            <option>20 Mbps</option>
            <option>50 Mbps</option>
            <option>100 Mbps</option>
            <option>200 Mbps</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            (Este selector administra ancho de banda simetricamente)
          </p>
        </div>

        {/* Configuración WAN */}
        <div className="mb-6">
          <label className="font-semibold text-gray-700">
            Configuración IP Estática (WAN):
          </label>

          <div className="grid grid-cols-2 gap-3 mt-2">
            {Object.entries(wanData).map(([key, value]) => (
              <input
                key={key}
                placeholder={key.replace("_", " ")}
                value={value}
                onChange={(e) => setWanData({ ...wanData, [key]: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ))}
          </div>

          <div className="flex justify-end mt-3">
            <button
              onClick={handleSetWAN}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Aplicar IP Estática
            </button>
          </div>

          {appliedIP && (
            <div className="mt-4 text-center">
              <p className="text-green-600 font-medium mb-2">
                Última IP configurada:
              </p>
              <button
                onClick={() => window.open(`http://${appliedIP}`, "_blank")}
                className="px-5 py-2 bg-green-100 text-green-700 font-semibold rounded-lg border border-green-300 hover:bg-green-200 transition"
              >
                🌐 Abrir {appliedIP}
              </button>
            </div>
          )}
        </div>

        <hr className="my-4" />

        {/* Acciones */}
        <div className="flex flex-wrap justify-between gap-3 mt-5">
          <button
            onClick={handleReboot}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
          >
            Reiniciar
          </button>
          <button
            onClick={handleDisable}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Deshabilitar
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Eliminar
          </button>
          <button
            onClick={() => navigate("/online-onus")}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default ONUDetails;
