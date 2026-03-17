import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import {
    getTiposCuenta,
    createTipoCuenta,
    updateTipoCuenta,
    deleteTipoCuenta,
    reactivarTipoCuenta
} from '../../services/TipoCuentaService';

import TipoCuentaTable from './TipoCuentaTable';
import TipoCuentaModal from './TipoCuentaModal';
import TipoCuentaDetalle from './TipoCuentaDetalle';
import './TipoCuenta.css';

// ── Helpers: detectan el casing real que devuelve .NET en runtime ──
export const getId = (t) => t?.tcU_Tipo_Cuenta;
export const getDescripcion = (t) => t?.tcU_Descripcion ?? '';
export const getEstado = (t) => t?.tcU_Estado ?? 'I';
export const isActivo = (t) => getEstado(t) === 'A';

const TipoCuentaPage = () => {
    const [tipos, setTipos] = useState([]);
    const [filteredTipos, setFilteredTipos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tipoToEdit, setTipoToEdit] = useState(null);
    const [tipoDetail, setTipoDetail] = useState(null);

    /* ── fetch ────────────────────────────────────────────────── */
    const fetchTipos = async () => {
        try {
            setLoading(true);
            const data = await getTiposCuenta();

            // Log de diagnóstico
            if (data?.length > 0) {
                console.group('💳 TipoCuenta API');
                console.log('Objeto:', data[0]);
                console.log('Claves:', Object.keys(data[0]));
                console.log('ID detectado:', getId(data[0]));
                console.log('Estado detectado:', getEstado(data[0]));
                console.groupEnd();
            }

            setTipos(data);
            setFilteredTipos(data);
            setError(null);
        } catch (err) {
            console.error('Error al obtener tipos de cuenta:', err);
            setError('No se pudieron cargar los tipos de cuenta.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTipos(); }, []);

    /* ── búsqueda debounce ────────────────────────────────────── */
    useEffect(() => {
        const t = setTimeout(() => {
            if (!searchTerm.trim()) { setFilteredTipos(tipos); return; }
            const q = searchTerm.toLowerCase();
            setFilteredTipos(
                tipos.filter(t => getDescripcion(t).toLowerCase().includes(q))
            );
        }, 300);
        return () => clearTimeout(t);
    }, [searchTerm, tipos]);

    /* ── handlers ─────────────────────────────────────────────── */
    const handleAddNew = () => { setTipoToEdit(null); setIsModalOpen(true); };
    const handleEdit = (t) => { setTipoToEdit(t); setIsModalOpen(true); };
    const handleView = (t) => setTipoDetail(t);

    const handleToggleStatus = async (id, nuevoActivo) => {
        if (id === undefined || id === null) {
            alert('Error interno: ID no detectado. Revisa la consola (F12).');
            return;
        }
        const accion = nuevoActivo ? 'activar' : 'desactivar';
        if (!window.confirm(`¿Deseas ${accion} este tipo de cuenta?`)) return;

        try {
            if (nuevoActivo) {
                await reactivarTipoCuenta(id);
            } else {
                await deleteTipoCuenta(id);
            }
            await fetchTipos();
        } catch (err) {
            console.error(`Error al ${accion} tipo de cuenta:`, err);
            const msg = err.response?.data?.title || err.response?.data || 'Error al procesar.';
            alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    const handleSaveModal = async (formData) => {
        try {
            if (tipoToEdit) {
                const id = getId(tipoToEdit);
                if (id === undefined || id === null) {
                    alert('Error: ID no detectado.');
                    return;
                }
                await updateTipoCuenta(id, { TCU_Descripcion: formData.TCU_Descripcion });
            } else {
                await createTipoCuenta({ TCU_Descripcion: formData.TCU_Descripcion });
            }
            setIsModalOpen(false);
            await fetchTipos();
        } catch (err) {
            console.error('Error al guardar tipo de cuenta:', err);
            const msg = err.response?.data?.title || err.response?.data || 'Error al guardar.';
            alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    /* ── render ───────────────────────────────────────────────── */
    if (tipoDetail) {
        return (
            <div className="tiposc-container">
                <TipoCuentaDetalle tipo={tipoDetail} onBack={() => setTipoDetail(null)} />
            </div>
        );
    }

    return (
        <div className="tiposc-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Gestión de Tipos de Cuenta</h1>
                    <span className="record-count">{filteredTipos.length} registros</span>
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
                ? <div className="loading-state">Cargando tipos de cuenta...</div>
                : <TipoCuentaTable
                    tipos={filteredTipos}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onView={handleView}
                />
            }

            <TipoCuentaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveModal}
                tipoToEdit={tipoToEdit}
            />
        </div>
    );
};

export default TipoCuentaPage;