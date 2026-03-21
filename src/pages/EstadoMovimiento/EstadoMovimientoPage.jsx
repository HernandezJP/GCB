import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import {
    getEstadosMovimiento,
    createEstadoMovimiento,
    updateEstadoMovimiento,
    deleteEstadoMovimiento,
    reactivarEstadoMovimiento
} from '../../services/EstadoMovimientoService';

import EstadoMovimientoTable   from './EstadoMovimientoTable';
import EstadoMovimientoModal   from './EstadoMovimientoModal';
import EstadoMovimientoDetalle from './EstadoMovimientoDetalle';
import './EstadoMovimiento.css';

// ── Helpers: ajustar casing según lo que devuelva la API
// Al cargar revisa consola: 💠 EstadoMovimiento API → Claves
export const getId          = (t) => t?.ESM_Estado_Movimiento ?? t?.eSM_Estado_Movimiento ?? t?.esM_Estado_Movimiento;
export const getDescripcion = (t) => t?.ESM_Descripcion       ?? t?.eSM_Descripcion       ?? t?.esM_Descripcion       ?? '';
export const getEstado      = (t) => t?.ESM_Estado            ?? t?.eSM_Estado            ?? t?.esM_Estado            ?? 'I';
export const getFecha       = (t) => t?.ESM_Fecha_Creacion    ?? t?.eSM_Fecha_Creacion    ?? null;
export const isActivo       = (t) => getEstado(t) === 'A';

const EstadoMovimientoPage = () => {
    const [estados,         setEstados]         = useState([]);
    const [filteredEstados, setFilteredEstados] = useState([]);
    const [searchTerm,      setSearchTerm]      = useState('');
    const [loading,         setLoading]         = useState(true);
    const [error,           setError]           = useState(null);
    const [isModalOpen,     setIsModalOpen]     = useState(false);
    const [estadoToEdit,    setEstadoToEdit]    = useState(null);
    const [estadoDetail,    setEstadoDetail]    = useState(null);

    /* ── fetch ────────────────────────────────────────────────── */
    const fetchEstados = async () => {
        try {
            setLoading(true);
            const data = await getEstadosMovimiento();

            // Log de diagnóstico
            if (data?.length > 0) {
                console.group('💠 EstadoMovimiento API');
                console.log('Objeto:', data[0]);
                console.log('Claves:', Object.keys(data[0]));
                console.log('ID detectado:', getId(data[0]));
                console.log('Estado detectado:', getEstado(data[0]));
                console.groupEnd();
            }

            setEstados(data || []);
            setFilteredEstados(data || []);
            setError(null);
        } catch (err) {
            console.error('Error al obtener estados de movimiento:', err);
            setError('No se pudieron cargar los estados de movimiento.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEstados(); }, []);

    /* ── búsqueda debounce ────────────────────────────────────── */
    useEffect(() => {
        const t = setTimeout(() => {
            if (!searchTerm.trim()) { setFilteredEstados(estados); return; }
            const q = searchTerm.toLowerCase();
            setFilteredEstados(
                estados.filter(e => getDescripcion(e).toLowerCase().includes(q))
            );
        }, 300);
        return () => clearTimeout(t);
    }, [searchTerm, estados]);

    /* ── handlers ─────────────────────────────────────────────── */
    const handleAddNew = () => { setEstadoToEdit(null); setIsModalOpen(true); };
    const handleEdit   = (e) => { setEstadoToEdit(e);   setIsModalOpen(true); };
    const handleView   = (e) => setEstadoDetail(e);

    // Toggle bidireccional: desactivar → DELETE, activar → PATCH reactivar
    const handleToggleStatus = async (id, nuevoActivo) => {
        if (id === undefined || id === null) {
            alert('Error interno: ID no detectado. Revisa la consola (F12).');
            return;
        }
        const accion = nuevoActivo ? 'activar' : 'desactivar';
        if (!window.confirm(`¿Deseas ${accion} este estado de movimiento?`)) return;

        try {
            if (nuevoActivo) {
                await reactivarEstadoMovimiento(id);
            } else {
                await deleteEstadoMovimiento(id);
            }
            await fetchEstados();
        } catch (err) {
            console.error(`Error al ${accion} estado de movimiento:`, err);
            const msg = err.response?.data?.title || err.response?.data || 'Error al procesar.';
            alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    const handleSaveModal = async (formData) => {
        try {
            if (estadoToEdit) {
                const id = getId(estadoToEdit);
                if (id === undefined || id === null) {
                    alert('Error: ID no detectado.');
                    return;
                }
                await updateEstadoMovimiento(id, {
                    ESM_Descripcion: formData.ESM_Descripcion,
                });
            } else {
                await createEstadoMovimiento({
                    ESM_Descripcion: formData.ESM_Descripcion,
                });
            }
            setIsModalOpen(false);
            await fetchEstados();
        } catch (err) {
            console.error('Error al guardar estado de movimiento:', err);
            const msg = err.response?.data?.title || err.response?.data || 'Error al guardar.';
            alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    /* ── render ───────────────────────────────────────────────── */
    if (estadoDetail) {
        return (
            <div className="estadomovimiento-container">
                <EstadoMovimientoDetalle
                    estado={estadoDetail}
                    onBack={() => setEstadoDetail(null)}
                />
            </div>
        );
    }

    return (
        <div className="estadomovimiento-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Gestión de Estados de Movimiento</h1>
                    <span className="record-count">{filteredEstados.length} registros</span>
                </div>
                <button className="btn-primary" onClick={handleAddNew}>
                    <Plus size={18} />
                    Nuevo Estado
                </button>
            </div>

            <div className="toolbar">
                <div className="search-bar">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loading
                ? <div className="loading-state">Cargando estados de movimiento...</div>
                : <EstadoMovimientoTable
                    estados={filteredEstados}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onView={handleView}
                  />
            }

            <EstadoMovimientoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveModal}
                estadoToEdit={estadoToEdit}
            />
        </div>
    );
};

export default EstadoMovimientoPage;