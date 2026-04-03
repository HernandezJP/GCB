import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import {
    getTiposMovimiento,
    createTipoMovimiento,
    updateTipoMovimiento,
    deleteTipoMovimiento,
    reactivarTipoMovimiento
} from '../../services/TipoMovimientoService';

import TipoMovimientoTable   from './TipoMovimientoTable';
import TipoMovimientoModal   from './TipoMovimientoModal';
import TipoMovimientoDetalle from './TipoMovimientoDetalle';
import './TipoMovimiento.css';

// ── Helpers: ajustar casing según lo que devuelva la API
// Al cargar revisa consola: 🔀 TipoMovimiento API → Claves
export const getId          = (t) => t?.TIM_Tipo_Movimiento ?? t?.tIM_Tipo_Movimiento ?? t?.tiM_Tipo_Movimiento;
export const getDescripcion = (t) => t?.TIM_Descripcion     ?? t?.tIM_Descripcion     ?? t?.tiM_Descripcion     ?? '';
export const getEstado      = (t) => t?.TIM_Estado          ?? t?.tIM_Estado          ?? t?.tiM_Estado          ?? 'I';
export const getFecha       = (t) => t?.TIM_Fecha_Creacion  ?? t?.tIM_Fecha_Creacion  ?? t?.tiM_Fecha_Creacion  ?? null;
export const isActivo       = (t) => getEstado(t) === 'A';

const TipoMovimientoPage = () => {
    const [movimientos,         setMovimientos]         = useState([]);
    const [filteredMovimientos, setFilteredMovimientos] = useState([]);
    const [searchTerm,          setSearchTerm]          = useState('');
    const [loading,             setLoading]             = useState(true);
    const [error,               setError]               = useState(null);
    const [isModalOpen,         setIsModalOpen]         = useState(false);
    const [movimientoToEdit,    setMovimientoToEdit]    = useState(null);
    const [movimientoDetail,    setMovimientoDetail]    = useState(null);

    /* ── fetch ────────────────────────────────────────────────── */
    const fetchMovimientos = async () => {
        try {
            setLoading(true);
            const data = await getTiposMovimiento();

            if (data?.length > 0) {
                console.group('🔀 TipoMovimiento API');
                console.log('Objeto:', data[0]);
                console.log('Claves:', Object.keys(data[0]));
                console.log('ID detectado:', getId(data[0]));
                console.log('Estado detectado:', getEstado(data[0]));
                console.groupEnd();
            }

            setMovimientos(data || []);
            setFilteredMovimientos(data || []);
            setError(null);
        } catch (err) {
            console.error('Error al obtener tipos de movimiento:', err);
            setError('No se pudieron cargar los tipos de movimiento.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMovimientos(); }, []);

    /* ── búsqueda debounce ────────────────────────────────────── */
    useEffect(() => {
        const t = setTimeout(() => {
            if (!searchTerm.trim()) { setFilteredMovimientos(movimientos); return; }
            const q = searchTerm.toLowerCase();
            setFilteredMovimientos(
                movimientos.filter(m => getDescripcion(m).toLowerCase().includes(q))
            );
        }, 300);
        return () => clearTimeout(t);
    }, [searchTerm, movimientos]);

    /* ── handlers ─────────────────────────────────────────────── */
    const handleAddNew = () => { setMovimientoToEdit(null); setIsModalOpen(true); };
    const handleEdit   = (m) => { setMovimientoToEdit(m);   setIsModalOpen(true); };
    const handleView   = (m) => setMovimientoDetail(m);

    const handleToggleStatus = async (id, nuevoActivo) => {
        if (id === undefined || id === null) {
            alert('Error interno: ID no detectado. Revisa la consola (F12).');
            return;
        }
        const accion = nuevoActivo ? 'activar' : 'desactivar';
        if (!window.confirm(`¿Deseas ${accion} este tipo de movimiento?`)) return;

        try {
            if (nuevoActivo) {
                await reactivarTipoMovimiento(id);
            } else {
                await deleteTipoMovimiento(id);
            }
            await fetchMovimientos();
        } catch (err) {
            console.error(`Error al ${accion} tipo de movimiento:`, err);
            const msg = err.response?.data?.title || err.response?.data || 'Error al procesar.';
            alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    const handleSaveModal = async (formData) => {
        try {
            if (movimientoToEdit) {
                const id = getId(movimientoToEdit);
                if (id === undefined || id === null) { alert('Error: ID no detectado.'); return; }
                await updateTipoMovimiento(id, {
                    TIM_Descripcion: formData.TIM_Descripcion,
                    TIM_Estado:      getEstado(movimientoToEdit) || 'A',
                });
            } else {
                await createTipoMovimiento({ TIM_Descripcion: formData.TIM_Descripcion });
            }
            setIsModalOpen(false);
            await fetchMovimientos();
        } catch (err) {
            console.error('Error al guardar tipo de movimiento:', err);
            const msg = err.response?.data?.title || err.response?.data || 'Error al guardar.';
            alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    /* ── render ───────────────────────────────────────────────── */
    if (movimientoDetail) {
        return (
            <div className="tipomovimiento-container">
                <TipoMovimientoDetalle
                    movimiento={movimientoDetail}
                    onBack={() => setMovimientoDetail(null)}
                />
            </div>
        );
    }

    return (
        <div className="tipomovimiento-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Tipos de Movimiento</h1>
                    <span className="record-count">{filteredMovimientos.length} registros</span>
                </div>
                <button className="btn-primary" onClick={handleAddNew}>
                    <Plus size={18} />
                    Nuevo Tipo
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
                ? <div className="loading-state">Cargando tipos de movimiento...</div>
                : <TipoMovimientoTable
                    movimientos={filteredMovimientos}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onView={handleView}
                  />
            }

            <TipoMovimientoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveModal}
                movimientoToEdit={movimientoToEdit}
            />
        </div>
    );
};

export default TipoMovimientoPage;