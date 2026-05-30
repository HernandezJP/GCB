import React from "react";
import { Eye, Edit2, ToggleRight, ToggleLeft } from "lucide-react";

import {
    getId,
    getNombre,
    getDescripcion,
    isActivo,
} from "./RolPage";

export default function RolTable({ roles, onView, onEdit, onToggle }) {
    return (
        <div className="table-container">
            <div className="table-scroll">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Rol</th>
                            <th>Descripción</th>
                            <th>Estado</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {roles.map((rol, idx) => {
                            const activo = isActivo(rol);

                            return (
                                <tr
                                    key={getId(rol)}
                                    className={activo ? "row-active" : "row-inactive"}
                                    onClick={() => onView && onView(rol)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <td className="col-id">{idx + 1}</td>

                                    <td className="font-semibold">
                                        {getNombre(rol)}
                                    </td>

                                    <td>{getDescripcion(rol) || "—"}</td>

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
                                                onClick={() => onView && onView(rol)}
                                            >
                                                <Eye size={16} />
                                            </button>

                                            <button
                                                className="icon-btn edit"
                                                title="Editar"
                                                onClick={() => onEdit && onEdit(rol)}
                                            >
                                                <Edit2 size={16} />
                                            </button>

                                            <button
                                                className={`icon-btn ${activo ? "toggle-on" : "toggle-off"}`}
                                                title={activo ? "Desactivar" : "Reactivar"}
                                                onClick={() => onToggle && onToggle(rol)}
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