import React from "react";
import { useNavigate } from "react-router-dom";

type ONU = {
  pon_type: string;
  board: number | string;
  port: number | string;
  sn: string;
};

const UnauthOnus: React.FC = () => {
  const navigate = useNavigate();

  // 📦 Ejemplo temporal de datos (reemplaza por tus datos reales)
  const onus: ONU[] = [
    { pon_type: "gpon", board: 6, port: 13, sn: "GPON00228D6" },
    { pon_type: "gpon", board: 6, port: 6, sn: "HWTC0F8317A" },
    { pon_type: "gpon", board: 6, port: 7, sn: "HWTC55A1BEA" },
    { pon_type: "gpon", board: 4, port: 6, sn: "HWTC0E3CFCA" },
    { pon_type: "gpon", board: 6, port: 8, sn: "GPON001F7D0" },
    { pon_type: "gpon", board: 6, port: 12, sn: "ZTEG222942E" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-3 py-6 font-[Inter]">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-700 mb-6 text-center">
          ONUs <span className="text-sky-600">sin autorizar</span>
        </h1>

        {/* 🔹 Filtros */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          <select className="border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-400">
            <option>Todos los OLTs</option>
            <option>POAQUIL</option>
            <option>COMALAPA</option>
          </select>

          <select className="border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-400">
            <option>Any PON</option>
            <option>PON1</option>
            <option>PON2</option>
          </select>

          <button className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-5 py-2 rounded-lg font-semibold text-sm shadow hover:from-sky-600 hover:to-blue-700 transition-all">
            🔄 Actualizar
          </button>
        </div>

        {/* 🧾 Tabla para escritorio */}
        <div className="hidden sm:block overflow-x-auto w-full rounded-xl shadow-sm border border-slate-200">
          <table className="min-w-full text-sm text-slate-700">
            <thead className="bg-sky-600 text-white text-left">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">PON TYPE</th>
                <th className="px-4 py-2">BOARD</th>
                <th className="px-4 py-2">PORT</th>
                <th className="px-4 py-2">SN / MAC</th>
                <th className="px-4 py-2 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {onus.map((onu, i) => (
                <tr
                  key={onu.sn}
                  className="hover:bg-sky-50 transition-colors border-b border-slate-100"
                >
                  <td className="px-4 py-2 font-medium text-slate-600">{i + 1}</td>
                  <td className="px-4 py-2">{onu.pon_type}</td>
                  <td className="px-4 py-2">{onu.board}</td>
                  <td className="px-4 py-2">{onu.port}</td>
                  <td className="px-4 py-2 font-mono text-blue-700">{onu.sn}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => navigate(`/authorize/${onu.sn}`, { state: onu })}
                      className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg text-xs font-semibold hover:from-sky-600 hover:to-blue-700 transition-all"
                    >
                      Autorizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 📱 Tarjetas para móvil */}
        <div className="grid grid-cols-1 sm:hidden gap-3 mt-4">
          {onus.map((onu, i) => (
            <div
              key={onu.sn}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-sky-600">
                  #{i + 1} • {onu.pon_type.toUpperCase()}
                </span>
                <span className="text-xs text-slate-500">
                  Board {onu.board} / Port {onu.port}
                </span>
              </div>
              <p className="font-mono text-blue-700 break-all">{onu.sn}</p>
              <button
                onClick={() => navigate(`/authorize/${onu.sn}`, { state: onu })}
                className="mt-3 w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-md py-2 text-sm font-semibold hover:from-sky-600 hover:to-blue-700 transition-all"
              >
                Autorizar
              </button>
            </div>
          ))}
        </div>

        {/* ➕ Agregar ONU manualmente */}
        <div className="mt-8 flex justify-center">
          <button className="bg-sky-50 border border-sky-300 text-sky-700 font-semibold px-6 py-2 rounded-lg hover:bg-sky-100 transition-all">
            + Agregar ONU manualmente
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthOnus;
