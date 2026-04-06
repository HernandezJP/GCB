import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import {
    getBancos,
    createBanco,
    updateBanco,
    deleteBanco,
    reactivarBanco
} from '../../services/bancoService';

import BancoTable   from './BancoTable';
import BancoModal   from './BancoModal';
import BancoDetalle from './BancoDetalle';
import './Bancos.css';


export const getId    = (b) => b?.BAN_Banco        ?? b?.baN_Banco        ?? b?.ban_banco;
export const getEstado= (b) => b?.BAN_Estado       ?? b?.baN_Estado       ?? b?.ban_estado ?? 'I';
export const getNombre= (b) => b?.BAN_Nombre       ?? b?.baN_Nombre       ?? b?.ban_nombre ?? '';
export const getSwift = (b) => b?.BAN_Codigo_Swift ?? b?.baN_Codigo_Swift ?? b?.ban_codigo_Swift ?? '';
export const getFecha = (b) => b?.BAN_Fecha_Creacion ?? b?.baN_Fecha_Creacion ?? b?.ban_fecha_creacion ?? null;
export const isActivo = (b) => getEstado(b) === 'A';

const BancoPage = () => {
    const [bancos,         setBancos]         = useState([]);
    const [filteredBancos, setFilteredBancos] = useState([]);
    const [searchTerm,     setSearchTerm]     = useState('');
    const [loading,        setLoading]        = useState(true);
    const [error,          setError]          = useState(null);
    const [isModalOpen,    setIsModalOpen]    = useState(false);
    const [bancoToEdit,    setBancoToEdit]    = useState(null);
    const [bancoDetail,    setBancoDetail]    = useState(null);

    /* ── fetch ────────────────────────────────────────────────── */
    const fetchBancos = async () => {
        try {
            setLoading(true);
            const data = await getBancos();
  
            if (data?.length > 0) {
                console.group('🏦 Banco API');
                console.log('Objeto:', data[0]);
                console.log('Claves:', Object.keys(data[0]));
                console.log('ID detectado:', getId(data[0]));
                console.log('Estado detectado:', getEstado(data[0]));
                console.groupEnd();
            }
            setBancos(data);
            setFilteredBancos(data);
            setError(null);
        } catch (err) {
            console.error('Error al obtener bancos:', err);
            setError('No se pudieron cargar los bancos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBancos(); }, []);

    /* ── búsqueda debounce ────────────────────────────────────── */
    useEffect(() => {
        const t = setTimeout(() => {
            if (!searchTerm.trim()) { setFilteredBancos(bancos); return; }
            const q = searchTerm.toLowerCase();
            setFilteredBancos(
                bancos.filter(b =>
                    getNombre(b).toLowerCase().includes(q) ||
                    getSwift(b).toLowerCase().includes(q)
                )
            );
        }, 300);
        return () => clearTimeout(t);
    }, [searchTerm, bancos]);

    /* ── handlers ─────────────────────────────────────────────── */
    const handleAddNew = () => { setBancoToEdit(null); setIsModalOpen(true); };
    const handleEdit   = (b) => { setBancoToEdit(b);   setIsModalOpen(true); };
    const handleView   = (b) => setBancoDetail(b);

    const handleToggleStatus = async (id, nuevoActivo) => {
        if (id === undefined || id === null) {
            alert('Error interno: ID no detectado. Revisa la consola (F12).');
            return;
        }

        const accion = nuevoActivo ? 'activar' : 'desactivar';
        if (!window.confirm(`¿Deseas ${accion} este banco?`)) return;

        try {
            if (nuevoActivo) {
                // PATCH /api/bancos/{id}/reactivar  → BAN_Estado = 'A'
                await reactivarBanco(id);
            } else {
                // DELETE /api/bancos/{id}           → BAN_Estado = 'I'
                await deleteBanco(id);
            }
            await fetchBancos();
        } catch (err) {
            console.error(`Error al ${accion} banco:`, err);
            const msg = err.response?.data?.title || err.response?.data || 'Error al procesar.';
            alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    const handleSaveModal = async (formData) => {
        try {
            if (bancoToEdit) {
                const id = getId(bancoToEdit);
                if (id === undefined || id === null) {
                    alert('Error: ID del banco no detectado.');
                    return;
                }
                await updateBanco(id, {
                    BAN_Nombre:       formData.BAN_Nombre,
                    BAN_Codigo_Swift: formData.BAN_Codigo_Swift,
                });
            } else {
                await createBanco({
                    BAN_Nombre:       formData.BAN_Nombre,
                    BAN_Codigo_Swift: formData.BAN_Codigo_Swift,
                });
            }
            setIsModalOpen(false);
            await fetchBancos();
        } catch (err) {
            console.error('Error al guardar banco:', err);
            const msg = err.response?.data?.title || err.response?.data || 'Error al guardar.';
            alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    /* ── render ───────────────────────────────────────────────── */
    if (bancoDetail) {
        return (
            <div className="bancos-container">
                <BancoDetalle banco={bancoDetail} onBack={() => setBancoDetail(null)} />
            </div>
        );
    }

    return (
        <div className="bancos-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Bancos</h1>
                    <span className="record-count">{filteredBancos.length} registros</span>
                </div>
                <button className="btn-primary" onClick={handleAddNew}>
                    <Plus size={18} />
                    Nuevo Banco
                </button>
            </div>

            <div className="toolbar">
                <div className="search-bar">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o SWIFT..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loading
                ? <div className="loading-state">Cargando bancos...</div>
                : <BancoTable
                    bancos={filteredBancos}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onView={handleView}
                  />
            }

            <BancoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveModal}
                bancoToEdit={bancoToEdit}
            />
        </div>
    );
};

export default BancoPage;