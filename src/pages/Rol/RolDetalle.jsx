import React from "react";
import { ArrowLeft, Shield } from "lucide-react";

import {
    getId,
    getNombre,
    getDescripcion,
    getEstado,
    getFechaCreacion,
    isActivo,
} from "./RolPage";

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

export default function RolDetalle({ rol, onBack }) {
    const activo = isActivo(rol);

    return (
        <div>
            <button
                className="btn-secondary"
                style={{ marginBottom: 16 }}
                onClick={onBack}
            >
                <ArrowLeft size={15} />
                Volver a roles
            </button>

            <div className="detalle-card">
                <div className="detalle-header">
                    <div className="detalle-icon">
                        <Shield size={26} />
                    </div>

                    <div>
                        <h2>{getNombre(rol)}</h2>

                        <p className="detalle-subtitle">
                            Código de rol:{" "}
                            <code className="rol-code">
                                {getId(rol)}
                            </code>
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
                            label: "Nombre del rol",
                            val: getNombre(rol) || "—",
                        },
                        {
                            label: "Estado",
                            val: getEstado(rol) === "A" ? "Activo" : "Inactivo",
                            color: activo ? "#15803d" : "#dc2626",
                        },
                        {
                            label: "Fecha creación",
                            val: formatDate(getFechaCreacion(rol)),
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

                <div className="rol-detail-section">
                    <h3>Descripción</h3>
                    <p>{getDescripcion(rol) || "Sin descripción registrada."}</p>
                </div>
            </div>
        </div>
    );
}