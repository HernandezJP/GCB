import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import {
    getEstadosCuenta,
    createEstadoCuenta,
    updateEstadoCuenta,
    deleteEstadoCuenta,
    reactivarEstadoCuenta
} from '../../services/EstadoCuentaService';

import EstadoCuentaTable   from './EstadoCuentaTable';
import EstadoCuentaModal   from './EstadoCuentaModal';
import EstadoCuentaDetalle from './EstadoCuentaDetalle';
import './EstadoCuenta.css';

// ── Helpers: .NET serializa "ESC_Estado_Cuenta" → "esC_Estado_Cuenta" ──
// Se confirma al cargar: revisar consola para ajustar si difiere
export const getId          = (e) => e?.esC_Estado_Cuenta  ?? e?.eSC_Estado_Cuenta  ?? e?.esc_estado_cuenta;
export const getDescripcion = (e) => e?.esC_Descripcion    ?? e?.eSC_Descripcion    ?? e?.esc_descripcion   ?? '';
export const getEstado      = (e) => e?.esC_Estado         ?? e?.eSC_Estado         ?? e?.esc_estado        ?? 'I';
export const getFecha       = (e) => e?.esC_Fecha_Creacion ?? e?.eSC_Fecha_Creacion ?? null;
export const isActivo       = (e) => getEstado(e) === 'A';

const EstadoCuentaPage = () => {
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
            const data = await getEstadosCuenta();

            // Log de diagnóstico — confirma el casing real de la API
            if (data?.length > 0) {
                console.group('📋 EstadoCuenta API');
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
            console.error('Error al obtener estados de cuenta:', err);
            setError('No se pudieron cargar los estados de cuenta.');
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
        if (!window.confirm(`¿Deseas ${accion} este estado de cuenta?`)) return;

        try {
            if (nuevoActivo) {
                await reactivarEstadoCuenta(id);
            } else {
                await deleteEstadoCuenta(id);
            }
            await fetchEstados();
        } catch (err) {
            console.error(`Error al ${accion} estado de cuenta:`, err);
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
                await updateEstadoCuenta(id, { ESC_Descripcion: formData.ESC_Descripcion });
            } else {
                await createEstadoCuenta({ ESC_Descripcion: formData.ESC_Descripcion });
            }
            setIsModalOpen(false);
            await fetchEstados();
        } catch (err) {
            console.error('Error al guardar estado de cuenta:', err);
            const msg = err.response?.data?.title || err.response?.data || 'Error al guardar.';
            alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    /* ── render ───────────────────────────────────────────────── */
    if (estadoDetail) {
        return (
            <div className="estadosc-container">
                <EstadoCuentaDetalle estado={estadoDetail} onBack={() => setEstadoDetail(null)} />
            </div>
        );
    }

    return (
        <div className="estadosc-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Gestión de Estados de Cuenta</h1>
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
                ? <div className="loading-state">Cargando estados de cuenta...</div>
                : <EstadoCuentaTable
                    estados={filteredEstados}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onView={handleView}
                  />
            }

            <EstadoCuentaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveModal}
                estadoToEdit={estadoToEdit}
            />
        </div>
    );
};

export default EstadoCuentaPage;