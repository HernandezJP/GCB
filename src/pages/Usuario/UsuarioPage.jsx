import React, { useEffect, useState } from "react";
import { Plus, Search, CheckCircle, Users } from "lucide-react";

import {
    getUsuarios,
    createUsuario,
    updateUsuario,
    cambiarPasswordUsuario,
    deleteUsuario,
    reactivarUsuario,
} from "../../services/UsuarioService";

import { getRoles } from "../../services/RolService";

import UsuarioTable from "./UsuarioTable";
import UsuarioModal from "./UsuarioModal";
import UsuarioDetalle from "./UsuarioDetalle";

import "./Usuario.css";

export const getId = (u) =>
    u?.usU_USUARIO ?? u?.uSU_USUARIO ?? u?.USU_USUARIO ?? 0;

export const getRolId = (u) =>
    u?.roL_ROL ?? u?.rOL_ROL ?? u?.ROL_ROL ?? 0;

export const getRolNombre = (u) =>
    u?.roL_NOMBRE ?? u?.rOL_NOMBRE ?? u?.ROL_NOMBRE ?? "";

export const getPrimerNombre = (u) =>
    u?.usU_PRIMER_NOMBRE ?? u?.uSU_PRIMER_NOMBRE ?? u?.USU_PRIMER_NOMBRE ?? "";

export const getSegundoNombre = (u) =>
    u?.usU_SEGUNDO_NOMBRE ?? u?.uSU_SEGUNDO_NOMBRE ?? u?.USU_SEGUNDO_NOMBRE ?? "";

export const getPrimerApellido = (u) =>
    u?.usU_PRIMER_APELLIDO ?? u?.uSU_PRIMER_APELLIDO ?? u?.USU_PRIMER_APELLIDO ?? "";

export const getSegundoApellido = (u) =>
    u?.usU_SEGUNDO_APELLIDO ?? u?.uSU_SEGUNDO_APELLIDO ?? u?.USU_SEGUNDO_APELLIDO ?? "";

export const getNombreCompleto = (u) => {
    const apiNombre =
        u?.nombreCompleto ??
        u?.NombreCompleto ??
        u?.NOMBRECOMPLETO ??
        "";

    if (String(apiNombre).trim()) {
        return String(apiNombre).trim();
    }

    return [
        getPrimerNombre(u),
        getSegundoNombre(u),
        getPrimerApellido(u),
        getSegundoApellido(u),
    ]
        .filter(Boolean)
        .join(" ")
        .trim();
};

export const getEmail = (u) =>
    u?.usU_EMAIL ?? u?.uSU_EMAIL ?? u?.USU_EMAIL ?? "";

export const getEstado = (u) =>
    u?.usU_ESTADO ?? u?.uSU_ESTADO ?? u?.USU_ESTADO ?? "A";

export const getFechaCreacion = (u) =>
    u?.usU_FECHA_CREACION ?? u?.uSU_FECHA_CREACION ?? u?.USU_FECHA_CREACION ?? "";

export const getUltimoAcceso = (u) =>
    u?.usU_ULTIMO_ACCESO ?? u?.uSU_ULTIMO_ACCESO ?? u?.USU_ULTIMO_ACCESO ?? "";

export const isActivo = (u) => getEstado(u) === "A";

export default function UsuarioPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [roles, setRoles] = useState([]);

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [usuarioEdit, setUsuarioEdit] = useState(null);
    const [usuarioDetalle, setUsuarioDetalle] = useState(null);

    useEffect(() => {
        fetchUsuarios();
        fetchRoles();
    }, []);

    const fetchUsuarios = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getUsuarios();
            const lista = Array.isArray(data) ? data : [];

            setUsuarios(lista);
            setFiltered(lista);
        } catch {
            setError("No se pudieron cargar los usuarios.");
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const data = await getRoles();
            setRoles(Array.isArray(data) ? data : []);
        } catch {
            setRoles([]);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            const q = search.trim().toLowerCase();

            if (!q) {
                setFiltered(usuarios);
                return;
            }

            setFiltered(
                usuarios.filter((u) =>
                    getNombreCompleto(u).toLowerCase().includes(q) ||
                    getEmail(u).toLowerCase().includes(q) ||
                    getRolNombre(u).toLowerCase().includes(q) ||
                    (isActivo(u) ? "activo" : "inactivo").includes(q)
                )
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search, usuarios]);

    const showSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(""), 3000);
    };

    const handleSave = async (form) => {
        try {
            if (usuarioEdit) {
                await updateUsuario(getId(usuarioEdit), {
                    ROL_ROL: Number(form.ROL_ROL),
                    USU_PRIMER_NOMBRE: form.USU_PRIMER_NOMBRE,
                    USU_SEGUNDO_NOMBRE: form.USU_SEGUNDO_NOMBRE,
                    USU_PRIMER_APELLIDO: form.USU_PRIMER_APELLIDO,
                    USU_SEGUNDO_APELLIDO: form.USU_SEGUNDO_APELLIDO,
                    USU_EMAIL: form.USU_EMAIL,
                });

                if (form.USU_PASSWORD?.trim()) {
                    await cambiarPasswordUsuario(getId(usuarioEdit), {
                        nuevaPassword: form.USU_PASSWORD,
                        NuevaPassword: form.USU_PASSWORD,
                    });
                }

                showSuccess("Usuario actualizado correctamente.");
            } else {
                await createUsuario({
                    ROL_ROL: Number(form.ROL_ROL),
                    USU_PRIMER_NOMBRE: form.USU_PRIMER_NOMBRE,
                    USU_SEGUNDO_NOMBRE: form.USU_SEGUNDO_NOMBRE,
                    USU_PRIMER_APELLIDO: form.USU_PRIMER_APELLIDO,
                    USU_SEGUNDO_APELLIDO: form.USU_SEGUNDO_APELLIDO,
                    USU_EMAIL: form.USU_EMAIL,
                    USU_PASSWORD: form.USU_PASSWORD,
                });

                showSuccess("Usuario creado correctamente.");
            }

            setModalOpen(false);
            setUsuarioEdit(null);
            await fetchUsuarios();
        } catch (err) {
            alert(err?.response?.data?.mensaje || "Error al guardar el usuario.");
        }
    };

    const handleToggle = async (usuario) => {
        const activo = isActivo(usuario);
        const id = getId(usuario);

        if (!window.confirm(`¿Deseas ${activo ? "desactivar" : "reactivar"} este usuario?`)) {
            return;
        }

        try {
            if (activo) await deleteUsuario(id);
            else await reactivarUsuario(id);

            showSuccess(`Usuario ${activo ? "desactivado" : "reactivado"} correctamente.`);
            await fetchUsuarios();
        } catch (err) {
            alert(err?.response?.data?.mensaje || "Error al cambiar el estado.");
        }
    };

    const activos = usuarios.filter(isActivo).length;
    const inactivos = usuarios.length - activos;
    const conAcceso = usuarios.filter((u) => Boolean(getUltimoAcceso(u))).length;

    if (usuarioDetalle) {
        return (
            <div className="usuario-container">
                <UsuarioDetalle
                    usuario={usuarioDetalle}
                    onBack={() => setUsuarioDetalle(null)}
                />
            </div>
        );
    }

    return (
        <div className="usuario-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Usuarios</h1>
                    <span className="record-count">{filtered.length} registros</span>
                </div>

                <button
                    className="btn-primary"
                    onClick={() => {
                        setUsuarioEdit(null);
                        setModalOpen(true);
                    }}
                >
                    <Plus size={18} />
                    Nuevo usuario
                </button>
            </div>

            <div className="kpi-grid">
                {[
                    {
                        label: "Usuarios activos",
                        val: activos,
                        color: "#0284c7",
                        bg: "#e0f2fe",
                    },
                    {
                        label: "Usuarios inactivos",
                        val: inactivos,
                        color: "#dc2626",
                        bg: "#fee2e2",
                    },
                    {
                        label: "Con acceso",
                        val: conAcceso,
                        color: "#15803d",
                        bg: "#dcfce7",
                    },
                    {
                        label: "Total usuarios",
                        val: usuarios.length,
                        color: "#64748b",
                        bg: "#f1f5f9",
                    },
                ].map((kpi, idx) => (
                    <div
                        key={idx}
                        className="kpi-card"
                        style={{ borderLeft: `4px solid ${kpi.color}` }}
                    >
                        <div>
                            <div className="kpi-label">{kpi.label}</div>
                            <div className="kpi-value" style={{ color: kpi.color }}>
                                {kpi.val}
                            </div>
                        </div>

                        <div className="kpi-icon" style={{ background: kpi.bg }}>
                            <Users size={20} color={kpi.color} />
                        </div>
                    </div>
                ))}
            </div>

            {success && (
                <div className="success-banner">
                    <CheckCircle size={16} />
                    {success}
                </div>
            )}

            {error && <div className="error-banner">{error}</div>}

            <div className="toolbar">
                <div className="search-bar">
                    <Search size={15} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar usuarios..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Cargando usuarios...</div>
            ) : filtered.length === 0 ? (
                <div className="table-container empty-report-card">
                    <div className="empty-state">No se encontraron usuarios.</div>
                </div>
            ) : (
                <UsuarioTable
                    usuarios={filtered}
                    onView={setUsuarioDetalle}
                    onEdit={(u) => {
                        setUsuarioEdit(u);
                        setModalOpen(true);
                    }}
                    onToggle={handleToggle}
                />
            )}

            <UsuarioModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setUsuarioEdit(null);
                }}
                onSave={handleSave}
                usuarioToEdit={usuarioEdit}
                roles={roles}
            />
        </div>
    );
}