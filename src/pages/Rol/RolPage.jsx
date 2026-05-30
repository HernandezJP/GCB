import React, { useEffect, useState } from "react";
import { Plus, Search, CheckCircle, Shield } from "lucide-react";

import {
    getRoles,
    createRol,
    updateRol,
    deleteRol,
    reactivarRol,
} from "../../services/RolService";

import RolTable from "./RolTable";
import RolModal from "./RolModal";
import RolDetalle from "./RolDetalle";

import "./Rol.css";

export const getId = (r) =>
    r?.roL_ROL ?? r?.rOL_ROL ?? r?.ROL_ROL ?? 0;

export const getNombre = (r) =>
    r?.roL_NOMBRE ?? r?.rOL_NOMBRE ?? r?.ROL_NOMBRE ?? "";

export const getDescripcion = (r) =>
    r?.roL_DESCRIPCION ?? r?.rOL_DESCRIPCION ?? r?.ROL_DESCRIPCION ?? "";

export const getEstado = (r) =>
    r?.roL_ESTADO ?? r?.rOL_ESTADO ?? r?.ROL_ESTADO ?? "A";

export const getFechaCreacion = (r) =>
    r?.roL_FECHA_CREACION ?? r?.rOL_FECHA_CREACION ?? r?.ROL_FECHA_CREACION ?? "";

export const isActivo = (r) => getEstado(r) === "A";

export default function RolPage() {
    const [roles, setRoles] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [rolEdit, setRolEdit] = useState(null);
    const [rolDetalle, setRolDetalle] = useState(null);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getRoles();
            const lista = Array.isArray(data) ? data : [];

            setRoles(lista);
            setFiltered(lista);
        } catch {
            setError("No se pudieron cargar los roles.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            const q = search.trim().toLowerCase();

            if (!q) {
                setFiltered(roles);
                return;
            }

            setFiltered(
                roles.filter((r) =>
                    getNombre(r).toLowerCase().includes(q) ||
                    getDescripcion(r).toLowerCase().includes(q) ||
                    (isActivo(r) ? "activo" : "inactivo").includes(q)
                )
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search, roles]);

    const showSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(""), 3000);
    };

    const handleSave = async (form) => {
        try {
            if (rolEdit) {
                await updateRol(getId(rolEdit), form);
                showSuccess("Rol actualizado correctamente.");
            } else {
                await createRol(form);
                showSuccess("Rol creado correctamente.");
            }

            setModalOpen(false);
            setRolEdit(null);
            await fetchRoles();
        } catch (err) {
            alert(err?.response?.data?.mensaje || "Error al guardar el rol.");
        }
    };

    const handleToggle = async (rol) => {
        const activo = isActivo(rol);
        const id = getId(rol);

        if (!window.confirm(`¿Deseas ${activo ? "desactivar" : "reactivar"} este rol?`)) {
            return;
        }

        try {
            if (activo) await deleteRol(id);
            else await reactivarRol(id);

            showSuccess(`Rol ${activo ? "desactivado" : "reactivado"} correctamente.`);
            await fetchRoles();
        } catch (err) {
            alert(err?.response?.data?.mensaje || "Error al cambiar el estado.");
        }
    };

    const activos = roles.filter(isActivo).length;
    const inactivos = roles.length - activos;

    if (rolDetalle) {
        return (
            <div className="rol-container">
                <RolDetalle
                    rol={rolDetalle}
                    onBack={() => setRolDetalle(null)}
                />
            </div>
        );
    }

    return (
        <div className="rol-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Roles</h1>
                    <span className="record-count">{filtered.length} registros</span>
                </div>

                <button
                    className="btn-primary"
                    onClick={() => {
                        setRolEdit(null);
                        setModalOpen(true);
                    }}
                >
                    <Plus size={18} />
                    Nuevo rol
                </button>
            </div>

            <div className="kpi-grid">
                {[
                    {
                        label: "Roles activos",
                        val: activos,
                        color: "#0284c7",
                        bg: "#e0f2fe",
                    },
                    {
                        label: "Roles inactivos",
                        val: inactivos,
                        color: "#dc2626",
                        bg: "#fee2e2",
                    },
                    {
                        label: "Total roles",
                        val: roles.length,
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
                            <Shield size={20} color={kpi.color} />
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
                        placeholder="Buscar roles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Cargando roles...</div>
            ) : filtered.length === 0 ? (
                <div className="table-container empty-report-card">
                    <div className="empty-state">No se encontraron roles.</div>
                </div>
            ) : (
                <RolTable
                    roles={filtered}
                    onView={setRolDetalle}
                    onEdit={(r) => {
                        setRolEdit(r);
                        setModalOpen(true);
                    }}
                    onToggle={handleToggle}
                />
            )}

            <RolModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setRolEdit(null);
                }}
                onSave={handleSave}
                rolToEdit={rolEdit}
            />
        </div>
    );
}