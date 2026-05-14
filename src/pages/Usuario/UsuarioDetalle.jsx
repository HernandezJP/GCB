import React from "react";
import { ArrowLeft, Users } from "lucide-react";

import {
    getId,
    getNombreCompleto,
    getEmail,
    getRolNombre,
    getEstado,
    getFechaCreacion,
    getUltimoAcceso,
    isActivo,
} from "./UsuarioPage";

const formatDate = (fecha) => {
    if (!fecha) return "—";

    const date = new Date(fecha);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("es-GT", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default function UsuarioDetalle({ usuario, onBack }) {
    const activo = isActivo(usuario);

    return (
        <div>
            <button
                className="btn-secondary"
                style={{ marginBottom: 16 }}
                onClick={onBack}
            >
                <ArrowLeft size={15} />
                Volver a usuarios
            </button>

            <div className="detalle-card">
                <div className="detalle-header">
                    <div className="detalle-icon">
                        <Users size={26} />
                    </div>

                    <div>
                        <h2>{getNombreCompleto(usuario) || "Usuario"}</h2>

                        <p className="detalle-subtitle">
                            Código de usuario:{" "}
                            <code className="usuario-code">
                                {getId(usuario)}
                            </code>
                            {" · "}
                            {getEmail(usuario)}
                        </p>
                    </div>

                    <div className="detalle-status">
                        <span className={`status-pill ${activo ? "pill-green" : "pill-red"}`}>
                            {activo ? "Activo" : "Inactivo"}
                        </span>
                    </div>
                </div>

                <div className="detalle-stats">
                    {[
                        {
                            label: "Rol",
                            val: getRolNombre(usuario) || "—",
                        },
                        {
                            label: "Estado",
                            val: getEstado(usuario) === "A" ? "Activo" : "Inactivo",
                            color: activo ? "#15803d" : "#dc2626",
                        },
                        {
                            label: "Fecha creación",
                            val: formatDate(getFechaCreacion(usuario)),
                        },
                        {
                            label: "Último acceso",
                            val: formatDate(getUltimoAcceso(usuario)),
                        },
                    ].map((s, i) => (
                        <div key={i} className="detalle-stat">
                            <div className="detalle-stat-label">{s.label}</div>
                            <div
                                className="detalle-stat-value"
                                style={{ color: s.color || "#0f172a" }}
                            >
                                {s.val}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="usuario-detail-section">
                    <h3>Información de contacto</h3>
                    <p>
                        <strong>Email:</strong> {getEmail(usuario) || "Sin correo registrado."}
                    </p>
                </div>
            </div>
        </div>
    );
}