import React, { useEffect, useState } from "react";

type ONU = {
  id: number;
  name: string;
  sn: string;
  onu: string;
  zone: string;
  signal: string;
  vlan: string;
  type: string;
  authDate: string;
};

type ONUDetails = {
  sn: string;
  name: string;
  onu_type_name: string;
  olt_name: string;
  board: string;
  port: string;
  onu: string;
  signal_1310?: string;
  signal_1490?: string;
  vlan?: string;
  mode?: string;
  wan_mode?: string;
  status?: string;
  authorization_date?: string;
};

const OnlineONUs: React.FC = () => {
  const [onus, setOnus] = useState<ONU[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOnu, setSelectedOnu] = useState<ONUDetails | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // 🟢 Cargar lista principal de ONUs
  useEffect(() => {
    const loadOnus = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/onus");
        const data = await res.json();

        const mapped = (data.response || []).map((onu: any, idx: number) => ({
          id: idx + 1,
          name: onu.name || "-",
          sn: onu.sn,
          onu: `Board ${onu.board} / Port ${onu.port} / ONU ${onu.onu}`,
          zone: `Zone ${onu.zone_id || "-"}`,
          signal: onu.status || "Offline",
          vlan: onu.vlan || "Sin VLAN",
          type: onu.type || "-",
          authDate: onu.last_status_change || "-",
        }));

        setOnus(mapped);
      } catch (err) {
        console.error("❌ Error cargando ONUs:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOnus();
  }, []);

  // ⚙️ Cargar detalles de una ONU individual
  const handleView = async (sn: string) => {
    try {
      setModalOpen(true);
      setModalLoading(true);
      const res = await fetch(`http://localhost:4000/api/onus/by-sn/${sn}`);
      const data = await res.json();

      const o = data.response || data; // en algunos endpoints SmartOLT usa .response
      const info: ONUDetails = {
        sn: o.sn,
        name: o.name || "-",
        onu_type_name: o.onu_type_name || "-",
        olt_name: o.olt_name || "-",
        board: o.board || "-",
        port: o.port || "-",
        onu: o.onu || "-",
        signal_1310: o.signal_1310 || "-",
        signal_1490: o.signal_1490 || "-",
        vlan: o.service_ports?.[0]?.vlan || "-",
        mode: o.mode || "-",
        wan_mode: o.wan_mode || "-",
        status: o.status || "-",
        authorization_date: o.authorization_date || "-",
      };

      setSelectedOnu(info);
    } catch (err) {
      console.error("❌ Error cargando detalles de ONU:", err);
    } finally {
      setModalLoading(false);
    }
  };

  // 🎨 Modal de Detalles
  const Modal = () => {
    if (!selectedOnu) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 relative">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            onClick={() => setModalOpen(false)}
          >
            ✖
          </button>
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            ONU Details – {selectedOnu.sn}
          </h3>

          {modalLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><strong>Name:</strong> {selectedOnu.name}</div>
              <div><strong>Type:</strong> {selectedOnu.onu_type_name}</div>
              <div><strong>OLT:</strong> {selectedOnu.olt_name}</div>
              <div><strong>Board:</strong> {selectedOnu.board}</div>
              <div><strong>Port:</strong> {selectedOnu.port}</div>
              <div><strong>ONU:</strong> {selectedOnu.onu}</div>
              <div><strong>Status:</strong> {selectedOnu.status}</div>
              <div><strong>VLAN:</strong> {selectedOnu.vlan}</div>
              <div><strong>Mode:</strong> {selectedOnu.mode}</div>
              <div><strong>WAN Mode:</strong> {selectedOnu.wan_mode}</div>
              <div><strong>Signal 1310:</strong> {selectedOnu.signal_1310} dBm</div>
              <div><strong>Signal 1490:</strong> {selectedOnu.signal_1490} dBm</div>
              <div className="col-span-2">
                <strong>Authorization:</strong> {selectedOnu.authorization_date}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 🧱 Tabla principal
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">ONUs Online</h2>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-700 border-b">
              <tr>
                {[
                  "Status",
                  "View",
                  "Name",
                  "SN / MAC",
                  "ONU",
                  "Zone",
                  "Signal",
                  "VLAN",
                  "Type",
                  "Auth Date",
                ].map((header) => (
                  <th key={header} className="px-4 py-3 text-left font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {onus.map((onu, i) => (
                <tr
                  key={onu.id}
                  className={`border-b hover:bg-gray-50 transition ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block h-3 w-3 rounded-full ${
                        onu.signal.toLowerCase() === "online"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleView(onu.sn)}
                      className="bg-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded-md shadow hover:bg-blue-700 transition"
                    >
                      View
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {onu.name}
                  </td>
                  <td className="px-4 py-3 font-mono">{onu.sn}</td>
                  <td className="px-4 py-3">{onu.onu}</td>
                  <td className="px-4 py-3">{onu.zone}</td>
                  <td className="px-4 py-3 text-green-600">{onu.signal}</td>
                  <td className="px-4 py-3">{onu.vlan}</td>
                  <td className="px-4 py-3">{onu.type}</td>
                  <td className="px-4 py-3 text-gray-600">{onu.authDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && <Modal />}
    </div>
  );
};

export default OnlineONUs;
