import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type FormState = {
  olt: string;
  pon_type: string;
  board: number | string;
  port: number | string;
  sn: string;
  onu_type: string;
  onu_mode: "Routing" | "Bridge";
  vlan_id: number | string;
  svlan: number | string;
  zone: string;
  odb_splitter: string;
  odb_port: string;
  download_speed: string;
  upload_speed: string;
  name: string;
  address: string;
  onu_external_id: string;
};

const AuthorizeOnu: React.FC = () => {
  const navigate = useNavigate();
  const { state: prefill } = useLocation() as { state?: any };
  const { sn: snParam } = useParams();

  // ✅ API base (Render o localhost)
  const API_BASE = import.meta.env.VITE_API_BASE || "https://backend-sd-wan-1.onrender.com/api";

  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err" | "info"; text: string } | null>(null);
  const [selectedOlt, setSelectedOlt] = useState("POAQUIL");

  const [form, setForm] = useState<FormState>({
    olt: prefill?.olt || "POAQUIL",
    pon_type: (prefill?.ponType || "gpon").toLowerCase(),
    board: prefill?.board ?? "",
    port: prefill?.port ?? "",
    sn: prefill?.sn || snParam || "",
    onu_type: "CGG-F784CW",
    onu_mode: "Routing",
    vlan_id: "100",
    svlan: "100",
    zone: "City Centre",
    odb_splitter: "None",
    odb_port: "None",
    download_speed: "1G",
    upload_speed: "1G",
    name: "",
    address: "",
    onu_external_id: prefill?.sn || "",
  });

  const handleOltFilter = (olt: string) => {
    setSelectedOlt(olt);
    setForm((prev) => ({ ...prev, olt }));
    setMessage({ type: "info", text: `✅ Mostrando datos de la OLT ${olt}` });
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // 🟢 Autorizar ONU
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/onu/authorize_onu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          board: Number(form.board),
          port: Number(form.port),
          vlan_id: Number(form.vlan_id),
          svlan: Number(form.svlan),
        }),
      });

      const data = await res.json();

      if (res.ok && (data.status === true || data.success === true)) {
        toast.success("✅ ONU autorizada correctamente", { autoClose: 1500 });
        setMessage({ type: "ok", text: "✅ ONU autorizada correctamente." });
        setTimeout(() => navigate("/online-onus"), 1600);
      } else {
        const msg = data?.error || data?.message || "Error desconocido en autorización";
        toast.error(`❌ ${msg}`, { autoClose: 2000 });
        setMessage({ type: "err", text: `❌ ${msg}` });
      }
    } catch (err: any) {
      toast.error(`❌ Error de red: ${err?.message || err}`, { autoClose: 2000 });
      setMessage({ type: "err", text: `❌ Error de red: ${err?.message || err}` });
    } finally {
      setSubmitting(false);
    }
  };

  // 🔄 Refrescar datos SNMP
  const handleSnmpRefresh = async () => {
    setMessage(null);
    setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE}/onus/force-refresh`, { method: "POST" });
      const data = await res.json();
      if (data.status === true) {
        toast.success("🔄 Caché actualizado correctamente");
        setMessage({
          type: "ok",
          text: `✅ Caché actualizado. ONUs recargadas (${data.total || "sin conteo"})`,
        });
      } else {
        toast.warn("⚠️ SmartOLT sin respuesta");
        setMessage({
          type: "err",
          text: `⚠️ ${data.message || "SmartOLT aún sin respuesta."}`,
        });
      }
    } catch (err: any) {
      toast.error(`❌ Error al refrescar: ${err?.message || err}`);
      setMessage({
        type: "err",
        text: `❌ Error al intentar refrescar datos: ${err?.message || err}`,
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-6 font-[Inter] overflow-y-auto flex justify-center">
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-lg p-4 sm:p-8 md:p-10">
        <h2 className="text-xl sm:text-2xl font-semibold text-[#334155] mb-4 sm:mb-6 flex items-center gap-2">
          <span className="w-2 h-7 bg-[#38bdf8] rounded-sm"></span>
          Autorizar ONU – <span className="text-[#1e293b] ml-1 font-bold">{form.sn}</span>
        </h2>

        {/* 🔘 Filtro de OLT */}
        <div className="flex flex-wrap gap-3 mb-6">
          {["POAQUIL", "COMALAPA"].map((olt) => (
            <button
              key={olt}
              type="button"
              onClick={() => handleOltFilter(olt)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                selectedOlt === olt
                  ? "bg-sky-600 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {olt}
            </button>
          ))}
        </div>

        {/* Mensaje de estado */}
        {message && (
          <div
            className={`mb-6 rounded-lg px-4 py-3 text-sm ${
              message.type === "ok"
                ? "bg-green-50 text-green-700 border border-green-300"
                : message.type === "info"
                ? "bg-blue-50 text-blue-700 border border-blue-300"
                : "bg-red-50 text-red-700 border border-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 🔄 Botón SNMP */}
        <div className="flex justify-end mb-5">
          <button
            type="button"
            onClick={handleSnmpRefresh}
            disabled={refreshing}
            className={`px-4 py-2 rounded-lg font-semibold text-white text-sm transition-all ${
              refreshing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow"
            }`}
          >
            {refreshing ? "Actualizando..." : "🔄 Actualizar SNMP"}
          </button>
        </div>

        {/* 📋 Formulario */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {[{ label: "OLT", value: form.olt }, { label: "PON Type", value: form.pon_type }, { label: "Board", value: form.board }, { label: "Port", value: form.port }, { label: "SN / MAC", value: form.sn }].map((f, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-gray-700">{f.label}</label>
              <input
                value={f.value}
                readOnly
                className="bg-gray-100 text-[#1e293b] border border-[#e2e8f0] rounded-lg p-2.5 w-full font-mono text-sm sm:text-base cursor-not-allowed"
              />
            </div>
          ))}

          {/* Campos editables */}
          <div>
            <label className="block text-sm font-medium text-gray-700">ONU Type</label>
            <select
              name="onu_type"
              value={form.onu_type}
              onChange={onChange}
              className="bg-white border border-gray-300 rounded-lg p-2.5 w-full text-sm sm:text-base"
            >
              <option>CGG-F784CW</option>
              <option>ZTE-F660V6.0</option>
              <option>ZTE-F601</option>
              <option>ZTE-F680</option>
              <option>HUAWEI-HG8145V5</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">User VLAN-ID</label>
            <input name="vlan_id" type="number" value={form.vlan_id} onChange={onChange} className="bg-white border border-gray-300 rounded-lg p-2.5 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Service VLAN (SVLAN-ID)</label>
            <input name="svlan" type="number" value={form.svlan} onChange={onChange} className="bg-white border border-gray-300 rounded-lg p-2.5 w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Zone</label>
            <select name="zone" value={form.zone} onChange={onChange} className="bg-white border border-gray-300 rounded-lg p-2.5 w-full">
              <option>City Centre</option>
              <option>Downtown</option>
              <option>Village</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Splitter</label>
            <select name="odb_splitter" value={form.odb_splitter} onChange={onChange} className="bg-white border border-gray-300 rounded-lg p-2.5 w-full">
              <option>None</option>
              <option>Splitter 1</option>
              <option>Splitter 2</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Download Speed</label>
            <select name="download_speed" value={form.download_speed} onChange={onChange} className="bg-white border border-gray-300 rounded-lg p-2.5 w-full">
              <option>1G</option>
              <option>500M</option>
              <option>100M</option>
              <option>10M</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Speed</label>
            <select name="upload_speed" value={form.upload_speed} onChange={onChange} className="bg-white border border-gray-300 rounded-lg p-2.5 w-full">
              <option>1G</option>
              <option>500M</option>
              <option>100M</option>
              <option>10M</option>
            </select>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Cliente</label>
            <input name="name" type="text" placeholder="Nombre del cliente" value={form.name} onChange={onChange} className="bg-white border border-gray-300 rounded-lg p-2.5 w-full" />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Dirección o comentario</label>
            <input name="address" type="text" placeholder="Ej: Avenida 9, Zona 1" value={form.address} onChange={onChange} className="bg-white border border-gray-300 rounded-lg p-2.5 w-full" />
          </div>

          <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-[#334155] hover:bg-gray-100 transition-all w-full sm:w-auto"
              disabled={submitting || refreshing}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#1e293b] text-white hover:bg-[#0f172a] transition-all disabled:opacity-60 w-full sm:w-auto"
              disabled={submitting || refreshing}
            >
              {submitting ? "Autorizando..." : "Autorizar ONU"}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="bottom-right" theme="colored" />
    </div>
  );
};

export default AuthorizeOnu;
