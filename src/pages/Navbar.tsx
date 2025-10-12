import React from "react";
import "./navbar.css"; // aquí pondremos el estilo del fondo

const Navbar = () => {
  return (
    <div className="custom-navbar text-white d-flex align-items-center justify-content-between px-4">
      <h3 className="fw-bold">Ale<span className="text-primary">OLT</span></h3>
      
      <div className="d-flex align-items-center">
        <span className="me-3">Bienvenido, Admin</span>
        <button className="btn btn-outline-light btn-sm">Cerrar sesión</button>
      </div>
    </div>
  );
};

export default Navbar;
