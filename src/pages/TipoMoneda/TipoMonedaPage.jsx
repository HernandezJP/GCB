import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import {
    getTiposMoneda,
    createTipoMoneda,
    updateTipoMoneda,
    deleteTipoMoneda,
    reactivarTipoMoneda
} from '../../services/TipoMonedaService';

import TipoMonedaTable   from './TipoMonedaTable';
import TipoMonedaModal   from './TipoMonedaModal';
import TipoMonedaDetalle from './TipoMonedaDetalle';
import './TipoMoneda.css';


export const getId          = (t) => t?.tMO_Tipo_Moneda    ?? t?.tmO_Tipo_Moneda   ?? t?.tmo_tipo_moneda;
export const getDescripcion = (t) => t?.tMO_Descripcion    ?? t?.tmO_Descripcion   ?? t?.tmo_descripcion  ?? '';
export const getSimbolo     = (t) => t?.tMO_Simbolo        ?? t?.tmO_Simbolo       ?? t?.tmo_simbolo      ?? '';
export const getEstado      = (t) => t?.tMO_Estado         ?? t?.tmO_Estado        ?? t?.tmo_estado       ?? 'I';
export const getFecha       = (t) => t?.tMO_Fecha_Creacion ?? t?.tmO_Fecha_Creacion ?? t?.tmo_Fecha_Creacion;
export const isActivo       = (t) => getEstado(t) === 'A';

const TipoMonedaPage = () => {
    const [monedas,         setMonedas]         = useState([]);
    const [filteredMonedas, setFilteredMonedas] = useState([]);
    const [searchTerm,      setSearchTerm]      = useState('');
    const [loading,         setLoading]         = useState(true);
    const [error,           setError]           = useState(null);
    const [isModalOpen,     setIsModalOpen]     = useState(false);
    const [monedaToEdit,    setMonedaToEdit]    = useState(null);
    const [monedaDetail,    setMonedaDetail]    = useState(null);

    const fetchMonedas = async () => {
        try {
            setLoading(true);
            const data = await getTiposMoneda();

            if (data?.length > 0) {
                console.group('💱 TipoMoneda API');
                console.log('Objeto:', data[0]);
                console.log('Claves:', Object.keys(data[0]));
                console.log('ID detectado:', getId(data[0]));
                console.log('Símbolo detectado:', getSimbolo(data[0]));
                console.groupEnd();
            }

            setMonedas(data);
            setFilteredMonedas(data);
            setError(null);
        } catch (err) {
            console.error('Error al obtener tipos de moneda:', err);
            setError('No se pudieron cargar los tipos de moneda.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMonedas(); }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            if (!searchTerm.trim()) { setFilteredMonedas(monedas); return; }
            const q = searchTerm.toLowerCase();
            setFilteredMonedas(
                monedas.filter(m =>
                    getDescripcion(m).toLowerCase().includes(q) ||
                    getSimbolo(m).toLowerCase().includes(q)
                )
            );
        }, 300);
        return () => clearTimeout(t);
    }, [searchTerm, monedas]);

    const handleAddNew = () => { setMonedaToEdit(null); setIsModalOpen(true); };
    const handleEdit   = (m) => { setMonedaToEdit(m);   setIsModalOpen(true); };
    const handleView   = (m) => setMonedaDetail(m);

    const handleToggleStatus = async (id, nuevoActivo) => {
        if (id === undefined || id === null) {
            alert('Error interno: ID no detectado. Revisa la consola (F12).');
            return;
        }
        const accion = nuevoActivo ? 'activar' : 'desactivar';
        if (!window.confirm(`¿Deseas ${accion} este tipo de moneda?`)) return;

        try {
            if (nuevoActivo) {
                await reactivarTipoMoneda(id);
            } else {
                await deleteTipoMoneda(id);
            }
            await fetchMonedas();
        } catch (err) {
            console.error(`Error al ${accion} tipo de moneda:`, err);
            const msg = err.response?.data?.title || err.response?.data || 'Error al procesar.';
            alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    const handleSaveModal = async (formData) => {
        try {
            if (monedaToEdit) {
                const id = getId(monedaToEdit);
                if (id === undefined || id === null) { alert('Error: ID no detectado.'); return; }
                await updateTipoMoneda(id, {
                    TMO_Descripcion: formData.TMO_Descripcion,
                    TMO_Simbolo:     formData.TMO_Simbolo,
                });
            } else {
                await createTipoMoneda({
                    TMO_Descripcion: formData.TMO_Descripcion,
                    TMO_Simbolo:     formData.TMO_Simbolo,
                });
            }
            setIsModalOpen(false);
            await fetchMonedas();
        } catch (err) {
            console.error('Error al guardar tipo de moneda:', err);
            const msg = err.response?.data?.title || err.response?.data || 'Error al guardar.';
            alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    if (monedaDetail) {
        return (
            <div className="tipomoneda-container">
                <TipoMonedaDetalle moneda={monedaDetail} onBack={() => setMonedaDetail(null)} />
            </div>
        );
    }

    return (
        <div className="tipomoneda-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Tipos de Moneda</h1>
                    <span className="record-count">{filteredMonedas.length} registros</span>
                </div>
                <button className="btn-primary" onClick={handleAddNew}>
                    <Plus size={18} />
                    Nueva Moneda
                </button>
            </div>

            <div className="toolbar">
                <div className="search-bar">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por descripción o símbolo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loading
                ? <div className="loading-state">Cargando tipos de moneda...</div>
                : <TipoMonedaTable
                    monedas={filteredMonedas}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onView={handleView}
                  />
            }

            <TipoMonedaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveModal}
                monedaToEdit={monedaToEdit}
            />
        </div>
    );
};

export default TipoMonedaPage;