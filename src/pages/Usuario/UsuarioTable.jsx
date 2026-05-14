import React from "react";
import { Eye, Edit2, ToggleRight, ToggleLeft } from "lucide-react";

import {
    getId,
    getNombreCompleto,
    getEmail,
    getRolNombre,
    isActivo,
    getUltimoAcceso,
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

export default function UsuarioTable({
    usuarios,
    onView,
    onEdit,
    onToggle,
}) {
    return (
        <div className="table-container">
            <div className="table-scroll">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Usuario</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Último acceso</th>
                            <th>Estado</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {usuarios.map((usuario, idx) => {
                            const activo = isActivo(usuario);

                            return (
                                <tr
                                    key={getId(usuario)}
                                    className={activo ? "row-active" : "row-inactive"}
                                    onClick={() => onView && onView(usuario)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <td className="col-id">{idx + 1}</td>

                                    <td className="font-semibold">
                                        {getNombreCompleto(usuario) || "—"}
                                    </td>

                                    <td>
                                        <span className="usuario-email">
                                            {getEmail(usuario) || "—"}
                                        </span>
                                    </td>

                                    <td>
                                        <span className="rol-badge">
                                            {getRolNombre(usuario) || "—"}
                                        </span>
                                    </td>

                                    <td>{formatDate(getUltimoAcceso(usuario))}</td>

                                    <td>
                                        <span className={`status-pill ${activo ? "pill-green" : "pill-red"}`}>
                                            {activo ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>

                                    <td onClick={(e) => e.stopPropagation()}>
                                        <div className="action-buttons">
                                            <button
                                                className="icon-btn view"
                                                title="Ver detalle"
                                                onClick={() => onView && onView(usuario)}
                                            >
                                                <Eye size={16} />
                                            </button>

                                            <button
                                                className="icon-btn edit"
                                                title="Editar"
                                                onClick={() => onEdit && onEdit(usuario)}
                                            >
                                                <Edit2 size={16} />
                                            </button>

                                            <button
                                                className={`icon-btn ${activo ? "toggle-on" : "toggle-off"}`}
                                                title={activo ? "Desactivar" : "Reactivar"}
                                                onClick={() => onToggle && onToggle(usuario)}
                                            >
                                                {activo ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}