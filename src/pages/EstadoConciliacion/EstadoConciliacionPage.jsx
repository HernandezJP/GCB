import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import {
    getEstadosConciliacion,
    createEstadoConciliacion,
    updateEstadoConciliacion,
    deleteEstadoConciliacion,
    reactivarEstadoConciliacion
} from '../../services/EstadoConciliacionService';

import EstadoConciliacionTable   from './EstadoConciliacionTable';
import EstadoConciliacionModal   from './EstadoConciliacionModal';
import EstadoConciliacionDetalle from './EstadoConciliacionDetalle';
import './EstadoConciliacion.css';

// ── Helpers: .NET serializa "ESC_Estado_Cuenta" → "esC_Estado_Cuenta" ──
// Se confirma al cargar: revisar consola para ajustar si difiere
export const getId          = (e) => e?.ecO_Estado_Conciliacion  ?? e?.eCO_Estado_Conciliacion  ?? e?.eco_estado_conciliacion;
export const getDescripcion = (e) => e?.ecO_Descripcion    ?? e?.eCO_Descripcion    ?? e?.eco_descripcion   ?? '';
export const getEstado      = (e) => e?.ecO_Estado         ?? e?.eCO_Estado         ?? e?.eco_estado        ?? 'I';
export const getFecha       = (e) => e?.ecO_Fecha_Creacion ?? e?.eCO_Fecha_Creacion ?? null;
export const isActivo       = (e) => getEstado(e) === 'A';

const EstadoConciliacionPage = () => {
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
            const data = await getEstadosConciliacion();

            // Log de diagnóstico — confirma el casing real de la API
            if (data?.length > 0) {
                console.group('📋 EstadoConciliacion API');
                console.log('Objeto:', data[0]);
                console.log('Claves:', Object.keys(data[0]));
                console.log('ID detectado:', getId(data[0]));
                console.log('Estado detectado:', getEstado(data[0]));
                console.groupEnd();
            }

            setEstados(data);
            setFilteredEstados(data);
            setError(null);
        } catch (err) {
            console.error('Error al obtener estados de conciliacion:', err);
            setError('No se pudieron cargar los estados de conciliacion.');
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

    const handleToggleStatus = async (id, nuevoActivo) => {
        if (id === undefined || id === null) {
            alert('Error interno: ID no detectado. Revisa la consola (F12).');
            return;
        }
        const accion = nuevoActivo ? 'activar' : 'desactivar';
        if (!window.confirm(`¿Deseas ${accion} este estado de conciliacion?`)) return;

        try {
            if (nuevoActivo) {
                await reactivarEstadoConciliacion(id);
            } else {
                await deleteEstadoConciliacion(id);
            }
            await fetchEstados();
        } catch (err) {
            console.error(`Error al ${accion} estado de conciliacion:`, err);
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
                await updateEstadoConciliacion(id, { ECO_Descripcion: formData.ECO_Descripcion });
            } else {
                await createEstadoConciliacion({ ECO_Descripcion: formData.ECO_Descripcion });
            }
            setIsModalOpen(false);
            await fetchEstados();
        } catch (err) {
            console.error('Error al guardar estado de conciliacion:', err);
            const msg = err.response?.data?.title || err.response?.data || 'Error al guardar.';
            alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    /* ── render ───────────────────────────────────────────────── */
    if (estadoDetail) {
        return (
            <div className="estadosc-container">
                <EstadoConciliacionDetalle estado={estadoDetail} onBack={() => setEstadoDetail(null)} />
            </div>
        );
    }

    return (
        <div className="estadosc-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Gestión de Estados de Conciliacion</h1>
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
                ? <div className="loading-state">Cargando estados de conciliacion...</div>
                : <EstadoConciliacionTable
                    estados={filteredEstados}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onView={handleView}
                  />
            }

            <EstadoConciliacionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveModal}
                estadoToEdit={estadoToEdit}
            />
        </div>
    );
};

export default EstadoConciliacionPage;