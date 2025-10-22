import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import logo from "../assets/esacosa.png";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 🧠 Autenticación con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("❌ Credenciales incorrectas o usuario inactivo");
      setLoading(false);
      return;
    }

    // 🔍 Buscar el rol del usuario
    const { data: userInfo, error: userError } = await supabase
      .from("usuarios")
      .select("rol")
      .eq("id", data.user.id)
      .single();

    if (userError || !userInfo) {
      setError("⚠️ No se pudo obtener el rol del usuario.");
      setLoading(false);
      return;
    }

    const rol = userInfo.rol;

    // 🚀 Redirigir según rol
    if (rol === "admin") navigate("/dashboard");
    else if (rol === "tecnico") navigate("/clientes-activos");
    else navigate("/home");

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-2">
      <div className="w-full max-w-[340px] sm:max-w-[360px] bg-white border border-gray-200 rounded-xl shadow-lg p-6 sm:p-7">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img
            className="w-50 sm:w-20 h-auto drop-shadow-md hover:scale-110 transition-transform duration-500"
            src={logo}
            alt="AleSmart Logo"
          />
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="flex flex-col text-sm">
          <input
            type="email"
            required
            placeholder="Usuario o correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-3 border border-gray-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition"
          />
          <input
            type="password"
            required
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition"
          />

          {error && (
            <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full bg-gradient-to-r from-gray-800 to-gray-600 text-white py-2 rounded-md font-semibold hover:opacity-90 active:scale-[0.98] transition"
          >
            {loading ? "Iniciando..." : "Iniciar sesión"}
          </button>
        </form>

        {/* Links */}
        <div className="mt-4 flex justify-between text-xs text-gray-600">
          <a href="#" className="hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
          <a href="#" className="hover:underline font-medium">
            Crear cuenta
          </a>
        </div>

        {/* Divider */}
        <div className="mt-4 text-center text-xs text-gray-400">
          <p>o iniciar sesión con</p>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-[10px] text-gray-400 leading-tight">
          <p>
            <a href="#" className="underline">
              Políticas de Privacidad
            </a>{" "}
            y{" "}
            <a href="#" className="underline">
              Términos del Servicio
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
