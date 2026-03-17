import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import {
    getTiposPersona,
    createTipoPersona,
    updateTipoPersona,
    deleteTipoPersona,
} from '../../services/TipoPersonaService';

import TipoPersonaTable from './TipoPersonaTable';
import TipoPersonaModal from './TipoPersonaModal';
import TipoPersonaDetalle from './TipoPersonaDetalle';
import './TipoPersona.css';

export const getId = (t) => t?.tiP_Tipo_Persona ?? t?.TIP_Tipo_Persona;
export const getDescripcion = (t) => t?.tiP_Descripcion ?? t?.TIP_Descripcion ?? '';
export const getEstado = (t) => t?.tiP_Estado ?? t?.TIP_Estado ?? 'I';
export const getFechaCreacion = (t) => t?.tiP_Fecha_Creacion ?? t?.TIP_Fecha_Creacion ?? '';
export const isActivo = (t) => getEstado(t) === 'A';

const TipoPersonaPage = () => {
    const [tipos, setTipos] = useState([]);
    const [filteredTipos, setFilteredTipos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tipoToEdit, setTipoToEdit] = useState(null);
    const [tipoDetail, setTipoDetail] = useState(null);

    const fetchTipos = async () => {
        try {
            setLoading(true);
            const data = await getTiposPersona();

            if (data?.length > 0) {
                console.group('👤 TipoPersona API');
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
            console.error('Error al obtener tipos de persona:', err);
            setError('No se pudieron cargar los tipos de persona.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTipos(); }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            if (!searchTerm.trim()) {
                setFilteredTipos(tipos);
                return;
            }

            const q = searchTerm.toLowerCase();
            setFilteredTipos(
                tipos.filter(t => getDescripcion(t).toLowerCase().includes(q))
            );
        }, 300);

        return () => clearTimeout(t);
    }, [searchTerm, tipos]);

    const handleAddNew = () => {
        setTipoToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (t) => {
        setTipoToEdit(t);
        setIsModalOpen(true);
    };

    const handleView = (t) => setTipoDetail(t);

    const handleToggleStatus = async (id, nuevoActivo) => {
if (id === undefined || id === null) {
        alert('Error interno: ID no detectado.');
        return;
    }

    if (nuevoActivo) {
        alert('La reactivación aún no está implementada en el backend.');
        return;
    }

    if (!window.confirm('¿Deseas desactivar este tipo de persona?')) return;

    try {
        await deleteTipoPersona(id);
        await fetchTipos();
    } catch (err) {
        console.error('Error al desactivar tipo de persona:', err);
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

            await updateTipoPersona(id, {
                TIP_Tipo_Persona: id,
                TIP_Descripcion: formData.TIP_Descripcion,
                TIP_Estado: formData.TIP_Estado
            });
        } else {
            await createTipoPersona({
                TIP_Descripcion: formData.TIP_Descripcion,
                TIP_Estado: formData.TIP_Estado
            });
        }

        setIsModalOpen(false);
        setTipoToEdit(null);
        await fetchTipos();
    } catch (err) {
        console.error('Error al guardar tipo de persona:', err);
        const msg =
            err.response?.data?.title ||
            err.response?.data?.message ||
            err.response?.data ||
            'Error al guardar.';
        alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
    }
    };

    if (tipoDetail) {
        return (
            <div className="tiposc-container">
                <TipoPersonaDetalle tipo={tipoDetail} onBack={() => setTipoDetail(null)} />
            </div>
        );
    }

    return (
        <div className="tiposc-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Gestión de Tipos de Persona</h1>
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

            {loading ? (
                <div className="loading-state">Cargando tipos de persona...</div>
            ) : (
                <TipoPersonaTable
                    tipos={filteredTipos}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onView={handleView}
                />
            )}

            <TipoPersonaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveModal}
                tipoToEdit={tipoToEdit}
            />
        </div>
    );
};

export default TipoPersonaPage;