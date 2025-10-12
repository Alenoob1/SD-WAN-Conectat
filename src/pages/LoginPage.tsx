import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/esacosa.png"; // tu logo

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/home");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-2">
      {/* Tarjeta un poco más ancha */}
      <div className="w-full max-w-[340px] sm:max-w-[360px] bg-white border border-gray-200 rounded-xl shadow-lg p-6 sm:p-7">
        
        {/* Logo más cerca del formulario */}
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
            type="text"
            required
            placeholder="Usuario o correo"
            className="mb-3 border border-gray-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition"
          />
          <input
            type="password"
            required
            placeholder="Contraseña"
            className="border border-gray-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition"
          />

          <button
            type="submit"
            className="mt-5 w-full bg-gradient-to-r from-gray-800 to-gray-600 text-white py-2 rounded-md font-semibold hover:opacity-90 active:scale-[0.98] transition"
          >
            Iniciar sesión
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
