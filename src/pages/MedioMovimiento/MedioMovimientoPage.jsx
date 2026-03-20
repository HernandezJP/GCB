import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import {
    getMediosMovimiento,
    createMedioMovimiento,
    updateMedioMovimiento,
    deleteMedioMovimiento,
    reactivarMedioMovimiento
} from '../../services/MedioMovimientoService';

import MedioMovimientoTable   from './MedioMovimientoTable';
import MedioMovimientoModal   from './MedioMovimientoModal';
import MedioMovimientoDetalle from './MedioMovimientoDetalle';
import './MedioMovimiento.css';


export const getId = (t) => t?.MEM_Medio_Movimiento ?? t?.mEM_Medio_Movimiento ?? t?.meM_Medio_Movimiento;
export const getDescripcion = (t) => t?.MEM_Descripcion      ?? t?.mEM_Descripcion      ?? t?.meM_Descripcion      ?? '';
export const getEstado = (t) => t?.MEM_Estado           ?? t?.mEM_Estado           ?? t?.meM_Estado           ?? 'I';
export const getFecha = (t) => t?.MEM_Fecha_Creacion   ?? t?.mEM_Fecha_Creacion   ?? t?.meM_Fecha_Creacion   ?? null;
export const isActivo = (t) => getEstado(t) === 'A';

const MedioMovimientoPage = () => {
    const [medios,         setMedios]         = useState([]);
    const [filteredMedios, setFilteredMedios] = useState([]);
    const [searchTerm,     setSearchTerm]     = useState('');
    const [loading,        setLoading]        = useState(true);
    const [error,          setError]          = useState(null);
    const [isModalOpen,    setIsModalOpen]    = useState(false);
    const [medioToEdit,    setMedioToEdit]    = useState(null);
    const [medioDetail,    setMedioDetail]    = useState(null);

    /* ── fetch ────────────────────────────────────────────────── */
    const fetchMedios = async () => {
        try {
            setLoading(true);
            const data = await getMediosMovimiento();

            // Log de diagnóstico
            if (data?.length > 0) {
                console.group('🔄 MedioMovimiento API');
                console.log('Objeto:', data[0]);
                console.log('Claves:', Object.keys(data[0]));
                console.log('ID detectado:', getId(data[0]));
                console.log('Estado detectado:', getEstado(data[0]));
                console.groupEnd();
            }

            setMedios(data || []);
            setFilteredMedios(data || []);
            setError(null);
        } catch (err) {
            console.error('Error al obtener medios de movimiento:', err);
            setError('No se pudieron cargar los medios de movimiento.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMedios(); }, []);

    /* ── búsqueda debounce ────────────────────────────────────── */
    useEffect(() => {
        const t = setTimeout(() => {
            if (!searchTerm.trim()) { setFilteredMedios(medios); return; }
            const q = searchTerm.toLowerCase();
            setFilteredMedios(
                medios.filter(m => getDescripcion(m).toLowerCase().includes(q))
            );
        }, 300);
        return () => clearTimeout(t);
    }, [searchTerm, medios]);

    /* ── handlers ─────────────────────────────────────────────── */
    const handleAddNew = () => { setMedioToEdit(null); setIsModalOpen(true); };
    const handleEdit   = (m) => { setMedioToEdit(m);   setIsModalOpen(true); };
    const handleView   = (m) => setMedioDetail(m);

    // Toggle bidireccional: desactivar → DELETE, activar → PATCH reactivar
    const handleToggleStatus = async (id, nuevoActivo) => {
        if (id === undefined || id === null) {
            alert('Error interno: ID no detectado. Revisa la consola (F12).');
            return;
        }
        const accion = nuevoActivo ? 'activar' : 'desactivar';
        if (!window.confirm(`¿Deseas ${accion} este medio de movimiento?`)) return;

        try {
            if (nuevoActivo) {
                await reactivarMedioMovimiento(id);
            } else {
                await deleteMedioMovimiento(id);
            }
            await fetchMedios();
        } catch (err) {
            console.error(`Error al ${accion} medio de movimiento:`, err);
            const msg = err.response?.data?.title || err.response?.data || 'Error al procesar.';
            alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    const handleSaveModal = async (formData) => {
        try {
            if (medioToEdit) {
                const id = getId(medioToEdit);
                if (id === undefined || id === null) {
                    alert('Error: ID no detectado.');
                    return;
                }
                await updateMedioMovimiento(id, {
                    MEM_Descripcion: formData.MEM_Descripcion,
                    MEM_Estado:      getEstado(medioToEdit) || 'A',
                });
            } else {
                await createMedioMovimiento({
                    MEM_Descripcion: formData.MEM_Descripcion,
                });
            }
            setIsModalOpen(false);
            await fetchMedios();
        } catch (err) {
            console.error('Error al guardar medio de movimiento:', err);
            const msg = err.response?.data?.title || err.response?.data || 'Error al guardar.';
            alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    /* ── render ───────────────────────────────────────────────── */
    if (medioDetail) {
        return (
            <div className="mediomovimiento-container">
                <MedioMovimientoDetalle
                    medio={medioDetail}
                    onBack={() => setMedioDetail(null)}
                />
            </div>
        );
    }

    return (
        <div className="mediomovimiento-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Gestión de Medios de Movimiento</h1>
                    <span className="record-count">{filteredMedios.length} registros</span>
                </div>
                <button className="btn-primary" onClick={handleAddNew}>
                    <Plus size={18} />
                    Nuevo Medio
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
                ? <div className="loading-state">Cargando medios de movimiento...</div>
                : <MedioMovimientoTable
                    medios={filteredMedios}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onView={handleView}
                  />
            }

            <MedioMovimientoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveModal}
                medioToEdit={medioToEdit}
            />
        </div>
    );
};

export default MedioMovimientoPage;