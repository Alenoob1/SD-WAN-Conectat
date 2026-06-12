import React, { useState, useEffect, useRef } from "react";
import {
  FaRobot,
  FaPaperPlane,
  FaTrash,
  FaTimes,
  FaTerminal,
  FaCopy,
  FaCheck,
  FaChevronDown,
  FaNetworkWired,
} from "react-icons/fa";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export const NetworkChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🔌 Cargar historial de chat al iniciar
  useEffect(() => {
    const savedHistory = localStorage.getItem("alesmart_chat_history");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        const messagesWithDates = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        setMessages(messagesWithDates);
      } catch (e) {
        console.error("Error al cargar historial de chat:", e);
      }
    } else {
      setMessages([
        {
          id: "welcome",
          sender: "bot",
          text: "¡Hola! Soy **NetBot**, tu consultor experto en redes y telecomunicaciones. 🌐⚙️\n\nPuedo ayudarte con:\n* Configuración de **OLTs** (ZTE C300/C320, Huawei, GPON/EPON).\n* Comandos de **Mikrotik RouterOS** (Firewall, NAT, Colas QoS, Rutas BGP).\n* Diagnóstico de **fibra óptica** (niveles de señal de ONUs, atenuación).\n* Diseño de subredes e direccionamiento IP.\n\nEscribe tu duda o selecciona una de las sugerencias de abajo.",
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  // 💾 Guardar historial cuando cambie
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("alesmart_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  // 📜 Auto-scroll al final del chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleClearHistory = () => {
    if (window.confirm("¿Seguro que deseas borrar el historial de chat?")) {
      const initial = [
        {
          id: "welcome-" + Date.now(),
          sender: "bot",
          text: "Historial de conversación reiniciado. ¿En qué puedo ayudarte en esta sesión, administrador?",
          timestamp: new Date(),
        },
      ];
      setMessages(initial);
      localStorage.setItem("alesmart_chat_history", JSON.stringify(initial));
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: "user-" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const apiKey = (import.meta.env.VITE_OPENAI_API_KEY || "").trim();
      if (!apiKey) {
        throw new Error(
          "La variable de entorno `VITE_OPENAI_API_KEY` no está definida o está vacía en tu archivo `.env`. Por favor agrégala y reinicia el servidor de desarrollo."
        );
      }

      const systemPrompt = `Actúa como un Ingeniero de Redes y Telecomunicaciones altamente capacitado con amplia experiencia en ISP (Proveedores de Servicios de Internet), configuraciones de OLTs (ZTE, Huawei, etc.), ONUs, fibra óptica (GPON/EPON), enrutamiento (Mikrotik RouterOS, Cisco IOS, Juniper), direccionamiento IP (IPv4, IPv6), subredes, configuración de cortafuegos (Firewall/NAT), calidad de servicio (QoS), y monitoreo de red.
Sé profesional, conciso y técnico. Responde en español de forma amigable y sumamente útil.
Cuando te pregunten sobre comandos de red, proporciona la sintaxis exacta encerrada en bloques de código markdown con el lenguaje correspondiente (ej. \`\`\`routeros ... \`\`\` o \`\`\`cisco ... \`\`\`) y agrega explicaciones paso a paso de lo que hace cada comando.
Apoya al administrador de red de la empresa 'AleSmart' para realizar diagnósticos efectivos.`;

      const contextMessages = messages
        .slice(-10)
        .map((m) => ({
          role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
          content: m.text,
        }));

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...contextMessages,
            { role: "user", content: textToSend },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${response.status}`);
      }

      const resData = await response.json();
      const botReply = resData?.choices?.[0]?.message?.content || "No recibí respuesta.";

      const botMsg: Message = {
        id: "bot-" + Date.now(),
        sender: "bot",
        text: botReply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error: any) {
      console.error("Error al consultar OpenAI:", error);
      const errMsg: Message = {
        id: "err-" + Date.now(),
        sender: "bot",
        text: `❌ **Error de Conexión/API**: ${error?.message || "Ocurrió un error inesperado al conectar con OpenAI."}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, blockId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(blockId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatMessage = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const rawContent = part.slice(3, -3);
        const firstNewLine = rawContent.indexOf("\n");
        let lang = "cmd";
        let code = rawContent;

        if (firstNewLine !== -1) {
          lang = rawContent.substring(0, firstNewLine).trim() || "cmd";
          code = rawContent.substring(firstNewLine + 1);
        }

        const blockId = `code-${index}`;

        return (
          <div key={index} className="my-3 border border-slate-800 rounded-lg overflow-hidden shadow-md">
            <div className="bg-slate-950 px-3 py-1.5 flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-800">
              <span className="uppercase text-cyan-400 font-semibold flex items-center gap-1.5">
                <FaTerminal size={10} /> {lang}
              </span>
              <button
                onClick={() => copyToClipboard(code, blockId)}
                className="text-slate-400 hover:text-white transition flex items-center gap-1 bg-slate-900/50 hover:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800"
              >
                {copiedId === blockId ? (
                  <>
                    <FaCheck size={10} className="text-green-500" /> Copiado
                  </>
                ) : (
                  <>
                    <FaCopy size={10} /> Copiar
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-950/80 p-3 overflow-x-auto text-[11.5px] font-mono text-sky-300 whitespace-pre">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      const inlineParts = part.split(/(\*\*.*?\*\*|`.*?`|\n)/g);
      return (
        <span key={index}>
          {inlineParts.map((subPart, subIdx) => {
            if (subPart.startsWith("**") && subPart.endsWith("**")) {
              return <strong key={subIdx} className="font-extrabold text-white">{subPart.slice(2, -2)}</strong>;
            }
            if (subPart.startsWith("`") && subPart.endsWith("`")) {
              return (
                <code key={subIdx} className="bg-slate-950 text-cyan-400 px-1 py-0.5 rounded font-mono text-xs border border-slate-800">
                  {subPart.slice(1, -1)}
                </code>
              );
            }
            if (subPart === "\n") {
              return <br key={subIdx} />;
            }
            if (subPart.trim().startsWith("* ")) {
              return (
                <span key={subIdx} className="block pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-cyan-400 font-medium">
                  {subPart.replace(/^\*\s+/, "")}
                </span>
              );
            }
            return subPart;
          })}
        </span>
      );
    });
  };

  const suggestions = [
    "¿Cómo autorizar una ONU ZTE C300?",
    "Comando Mikrotik para limitar ancho de banda",
    "Explicación de niveles de señal de fibra GPON",
    "Configurar DHCP server en RouterOS",
  ];

  return (
    <>
      {/* 🔴 BOTÓN FLOTANTE */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[999] w-14 h-14 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:shadow-[0_4px_25px_rgba(6,182,212,0.6)] border border-sky-400/20 active:scale-95 hover:scale-105 transition-all duration-300"
        title="Consola de Soporte NetBot"
      >
        {isOpen ? (
          <FaChevronDown size={22} className="animate-bounce-slow" />
        ) : (
          <div className="relative">
            <FaRobot size={24} />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-slate-900"></span>
            </span>
          </div>
        )}
      </button>

      {/* 🔮 PANEL DE CHAT EXPANDIDO */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[999] w-[400px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-8rem)] bg-slate-900/95 border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-sans backdrop-blur-md transition-all duration-300 animate-fade-in-up">
          {/* Cabecera del terminal */}
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex justify-between items-center relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-blue-500 after:via-cyan-400 after:to-emerald-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white border border-sky-400/20 shadow-md">
                <FaNetworkWired size={16} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
                    NetBot OS
                  </h4>
                  <span className="text-[9px] bg-slate-800 text-cyan-400 px-1.5 py-0.2 rounded border border-cyan-500/20 font-mono">
                    v1.5
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  Ing. Redes Online
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleClearHistory}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded hover:bg-slate-800 transition"
                title="Limpiar Conversación"
              >
                <FaTrash size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                title="Minimizar"
              >
                <FaTimes size={14} />
              </button>
            </div>
          </div>

          {/* CUERPO DEL CHAT */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900/40 relative">
            {/* Mensajes del chat */}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`px-3.5 py-2.5 rounded-2xl max-w-[85%] text-[12.5px] leading-relaxed shadow ${
                    m.sender === "user"
                      ? "bg-gradient-to-br from-blue-600 to-sky-600 text-white rounded-tr-none"
                      : "bg-slate-950 border border-slate-800/80 text-slate-200 rounded-tl-none"
                  }`}
                >
                  {m.sender === "bot" ? formatMessage(m.text) : m.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1 font-mono">
                  {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}

            {/* Indicador de Escritura */}
            {loading && (
              <div className="flex flex-col items-start">
                <div className="bg-slate-950 border border-slate-800/80 px-4 py-3.5 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* SUGERENCIAS RÁPIDAS */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 bg-slate-950/30 border-t border-slate-800/50 flex flex-wrap gap-1.5 max-h-36 overflow-y-auto font-sans">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider w-full mb-1">
                Consultas sugeridas:
              </span>
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  className="text-[10px] text-slate-300 bg-slate-950 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 rounded-full px-2.5 py-1 text-left transition duration-200"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* AREA DE ENTRADA */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu consulta de telecom..."
              disabled={loading}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <FaPaperPlane size={12} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
