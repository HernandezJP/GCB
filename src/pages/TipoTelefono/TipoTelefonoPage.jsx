import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import {
    getTiposTelefono,
    createTipoTelefono,
    updateTipoTelefono,
    deleteTipoTelefono
} from '../../services/TipoTelefonoService';

import TipoTelefonoTable from './TipoTelefonoTable';
import TipoTelefonoModal from './TipoTelefonoModal';
import TipoTelefonoDetalle from './TipoTelefonoDetalle';
import './TipoTelefono.css';

// Helpers según el casing real que devuelve .NET
export const getId = (t) => t?.tiT_Tipo_Telefono ?? t?.TIT_Tipo_Telefono;
export const getDescripcion = (t) => t?.tiT_Descripcion ?? t?.TIT_Descripcion ?? '';
export const getEstado = (t) => t?.tiT_Estado ?? t?.TIT_Estado ?? 'I';
export const getFechaCreacion = (t) => t?.tiT_Fecha_Creacion ?? t?.TIT_Fecha_Creacion ?? '';
export const isActivo = (t) => getEstado(t) === 'A';

const TipoTelefonoPage = () => {
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
            const data = await getTiposTelefono();

            if (data?.length > 0) {
                console.group('☎ TipoTelefono API');
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
            console.error('Error al obtener tipos de teléfono:', err);
            setError('No se pudieron cargar los tipos de teléfono.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTipos();
    }, []);

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

    const handleView = (t) => {
        setTipoDetail(t);
    };

    const handleToggleStatus = async (id, nuevoActivo) => {
        if (id === undefined || id === null) {
            alert('Error interno: ID no detectado.');
            return;
        }

        if (nuevoActivo) {
            alert('La reactivación aún no está implementada en el backend.');
            return;
        }

        if (!window.confirm('¿Deseas desactivar este tipo de teléfono?')) return;

        try {
            await deleteTipoTelefono(id);
            await fetchTipos();
        } catch (err) {
            console.error('Error al desactivar tipo de teléfono:', err);
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

                await updateTipoTelefono(id, {
                    TIT_Tipo_Telefono: id,
                    TIT_Descripcion: formData.TIT_Descripcion,
                    TIT_Estado: formData.TIT_Estado
                });
            } else {
                await createTipoTelefono({
                    TIT_Descripcion: formData.TIT_Descripcion,
                    TIT_Estado: formData.TIT_Estado
                });
            }

            setIsModalOpen(false);
            setTipoToEdit(null);
            await fetchTipos();
        } catch (err) {
            console.error('Error al guardar tipo de teléfono:', err);
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
            <div className="tipotel-container">
                <TipoTelefonoDetalle
                    tipo={tipoDetail}
                    onBack={() => setTipoDetail(null)}
                />
            </div>
        );
    }

    return (
        <div className="tipotel-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Gestión de Tipos de Teléfono</h1>
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
                <div className="loading-state">Cargando tipos de teléfono...</div>
            ) : (
                <TipoTelefonoTable
                    tipos={filteredTipos}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onView={handleView}
                />
            )}

            <TipoTelefonoModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setTipoToEdit(null);
                }}
                onSave={handleSaveModal}
                tipoToEdit={tipoToEdit}
            />
        </div>
    );
};

export default TipoTelefonoPage;