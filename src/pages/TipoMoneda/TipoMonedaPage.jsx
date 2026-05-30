import React, { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";

import {
    getTiposMoneda,
    createTipoMoneda,
    updateTipoMoneda,
    deleteTipoMoneda,
    reactivarTipoMoneda,
} from "../../services/TipoMonedaService";

import TipoMonedaTable from "./TipoMonedaTable";
import TipoMonedaModal from "./TipoMonedaModal";
import TipoMonedaDetalle from "./TipoMonedaDetalle";
import "./TipoMoneda.css";

export const getId = (t) =>
    t?.tmO_Tipo_Moneda ??
    t?.tMO_Tipo_Moneda ??
    t?.TMO_Tipo_Moneda ??
    t?.tmo_tipo_moneda;

export const getDescripcion = (t) =>
    t?.tmO_Descripcion ??
    t?.tMO_Descripcion ??
    t?.TMO_Descripcion ??
    t?.tmo_descripcion ??
    "";

export const getCodigoIso = (t) =>
    t?.tmO_Codigo_ISO ??
    t?.tMO_Codigo_ISO ??
    t?.TMO_Codigo_ISO ??
    t?.tmo_codigo_iso ??
    "";

export const getSimbolo = (t) =>
    t?.tmO_Simbolo ??
    t?.tMO_Simbolo ??
    t?.TMO_Simbolo ??
    t?.tmo_simbolo ??
    "";

export const getEstado = (t) =>
    t?.tmO_Estado ??
    t?.tMO_Estado ??
    t?.TMO_Estado ??
    t?.tmo_estado ??
    "I";

export const getFecha = (t) =>
    t?.tmO_Fecha_Creacion ??
    t?.tMO_Fecha_Creacion ??
    t?.TMO_Fecha_Creacion ??
    t?.tmo_fecha_creacion;

export const isActivo = (t) => getEstado(t) === "A";

const TipoMonedaPage = () => {
    const [monedas, setMonedas] = useState([]);
    const [filteredMonedas, setFilteredMonedas] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [monedaToEdit, setMonedaToEdit] = useState(null);
    const [monedaDetail, setMonedaDetail] = useState(null);

    const fetchMonedas = async () => {
        try {
            setLoading(true);

            const data = await getTiposMoneda();
            const lista = Array.isArray(data) ? data : [];

            setMonedas(lista);
            setFilteredMonedas(lista);
            setError(null);
        } catch (err) {
            console.error("Error al obtener tipos de moneda:", err);
            setError("No se pudieron cargar los tipos de moneda.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMonedas();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!searchTerm.trim()) {
                setFilteredMonedas(monedas);
                return;
            }

            const q = searchTerm.toLowerCase();

            setFilteredMonedas(
                monedas.filter(
                    (m) =>
                        getDescripcion(m).toLowerCase().includes(q) ||
                        getCodigoIso(m).toLowerCase().includes(q) ||
                        getSimbolo(m).toLowerCase().includes(q)
                )
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, monedas]);

    const handleAddNew = () => {
        setMonedaToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (moneda) => {
        setMonedaToEdit(moneda);
        setIsModalOpen(true);
    };

    const handleView = (moneda) => {
        setMonedaDetail(moneda);
    };

    const handleToggleStatus = async (id, nuevoActivo) => {
        if (id === undefined || id === null) {
            alert("Error interno: ID no detectado.");
            return;
        }

        const accion = nuevoActivo ? "activar" : "desactivar";

        if (!window.confirm(`¿Deseas ${accion} este tipo de moneda?`)) {
            return;
        }

        try {
            if (nuevoActivo) await reactivarTipoMoneda(id);
            else await deleteTipoMoneda(id);

            await fetchMonedas();
        } catch (err) {
            console.error(`Error al ${accion} tipo de moneda:`, err);
            const msg =
                err.response?.data?.mensaje ||
                err.response?.data?.title ||
                "Error al procesar.";

            alert(msg);
        }
    };

    const handleSaveModal = async (formData) => {
        try {
            const dto = {
                TMO_Descripcion: formData.TMO_Descripcion.trim(),
                TMO_Codigo_ISO: formData.TMO_Codigo_ISO.trim().toUpperCase(),
                TMO_Simbolo: formData.TMO_Simbolo.trim(),
            };

            if (monedaToEdit) {
                const id = getId(monedaToEdit);

                if (id === undefined || id === null) {
                    alert("Error: ID no detectado.");
                    return;
                }

                await updateTipoMoneda(id, dto);
            } else {
                await createTipoMoneda(dto);
            }

            setIsModalOpen(false);
            setMonedaToEdit(null);
            await fetchMonedas();
        } catch (err) {
            console.error("Error al guardar tipo de moneda:", err);

            const msg =
                err.response?.data?.mensaje ||
                err.response?.data?.title ||
                "Error al guardar.";

            alert(msg);
        }
    };

    if (monedaDetail) {
        return (
            <div className="tipomoneda-container">
                <TipoMonedaDetalle
                    moneda={monedaDetail}
                    onBack={() => setMonedaDetail(null)}
                />
            </div>
        );
    }

    return (
        <div className="tipomoneda-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Tipos de Moneda</h1>
                    <span className="record-count">
                        {filteredMonedas.length} registros
                    </span>
                </div>

                <button className="btn-primary" onClick={handleAddNew}>
                    <Plus size={18} />
                    Nueva moneda
                </button>
            </div>

            <div className="toolbar">
                <div className="search-bar">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por descripción, código ISO o símbolo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loading ? (
                <div className="loading-state">
                    Cargando tipos de moneda...
                </div>
            ) : (
                <TipoMonedaTable
                    monedas={filteredMonedas}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onView={handleView}
                />
            )}

            <TipoMonedaModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setMonedaToEdit(null);
                }}
                onSave={handleSaveModal}
                monedaToEdit={monedaToEdit}
            />
        </div>
    );
};

export default TipoMonedaPage;