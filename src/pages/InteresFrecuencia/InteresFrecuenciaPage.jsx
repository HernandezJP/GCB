import React, { useState, useEffect } from 'react';
import { Plus, Search, Repeat } from 'lucide-react';
import {
    getInteresFrecuencias,
    createInteresFrecuencia,
    updateInteresFrecuencia,
    deleteInteresFrecuencia,
    reactivarInteresFrecuencia
} from '../../services/InteresFrecuenciaService';

import InteresFrecuenciaTable from './InteresFrecuenciaTable';
import InteresFrecuenciaModal from './InteresFrecuenciaModal';
import InteresFrecuenciaDetalle from './InteresFrecuenciaDetalle';
import './InteresFrecuencia.css';

export const getId = (f) => f?.inF_Interes_Frecuencia ?? f?.INF_Interes_Frecuencia;
export const getDescripcion = (f) => f?.inF_Descripcion ?? f?.INF_Descripcion ?? '';
export const getEstado = (f) => f?.inF_Estado ?? f?.INF_Estado ?? 'I';
export const getFechaCreacion = (f) => f?.inF_Fecha_Creacion ?? f?.INF_Fecha_Creacion ?? '';
export const isActivo = (f) => getEstado(f) === 'A';

const InteresFrecuenciaPage = () => {
    const [frecuencias, setFrecuencias] = useState([]);
    const [filteredFrecuencias, setFilteredFrecuencias] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [frecuenciaToEdit, setFrecuenciaToEdit] = useState(null);
    const [frecuenciaDetail, setFrecuenciaDetail] = useState(null);

    const fetchFrecuencias = async () => {
        try {
            setLoading(true);
            const data = await getInteresFrecuencias();

            setFrecuencias(data || []);
            setFilteredFrecuencias(data || []);
            setError(null);
        } catch (err) {
            console.error('Error al obtener frecuencias de interés:', err);
            setError('No se pudieron cargar las frecuencias de interés.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFrecuencias();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!searchTerm.trim()) {
                setFilteredFrecuencias(frecuencias);
                return;
            }

            const q = searchTerm.toLowerCase();

            setFilteredFrecuencias(
                frecuencias.filter(f =>
                    String(getId(f) ?? '').toLowerCase().includes(q) ||
                    getDescripcion(f).toLowerCase().includes(q)
                )
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchTerm, frecuencias]);

    const handleAddNew = () => {
        setFrecuenciaToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (frecuencia) => {
        setFrecuenciaToEdit(frecuencia);
        setIsModalOpen(true);
    };

    const handleView = (frecuencia) => {
        setFrecuenciaDetail(frecuencia);
    };

    const handleToggleStatus = async (id, nuevoActivo) => {
        if (id === undefined || id === null) {
            alert('Error interno: ID no detectado.');
            return;
        }

        try {
            if (nuevoActivo) {
                if (!window.confirm('¿Deseas reactivar esta frecuencia de interés?')) return;
                await reactivarInteresFrecuencia(id);
            } else {
                if (!window.confirm('¿Deseas desactivar esta frecuencia de interés?')) return;
                await deleteInteresFrecuencia(id);
            }

            await fetchFrecuencias();
        } catch (err) {
            console.error('Error al cambiar estado de frecuencia de interés:', err);
            const msg =
                err.response?.data?.mensaje ||
                err.response?.data?.message ||
                err.response?.data?.title ||
                err.response?.data ||
                'Error al procesar la solicitud.';
            alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    const handleSaveModal = async (formData) => {
        try {
            if (frecuenciaToEdit) {
                const id = getId(frecuenciaToEdit);

                if (id === undefined || id === null) {
                    alert('Error: ID no detectado.');
                    return;
                }

                await updateInteresFrecuencia(id, {
                    INF_Descripcion: formData.INF_Descripcion.trim()
                });
            } else {
                await createInteresFrecuencia({
                    INF_Descripcion: formData.INF_Descripcion.trim()
                });
            }

            setIsModalOpen(false);
            setFrecuenciaToEdit(null);
            await fetchFrecuencias();
        } catch (err) {
            console.error('Error al guardar frecuencia de interés:', err);
            const msg =
                err.response?.data?.mensaje ||
                err.response?.data?.message ||
                err.response?.data?.title ||
                err.response?.data ||
                'Error al guardar.';
            alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    if (frecuenciaDetail) {
        return (
            <div className="tiposc-container">
                <InteresFrecuenciaDetalle
                    frecuencia={frecuenciaDetail}
                    onBack={() => setFrecuenciaDetail(null)}
                />
            </div>
        );
    }

    return (
        <div className="tiposc-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Frecuencia de Interés</h1>
                    <span className="record-count">{filteredFrecuencias.length} registros</span>
                </div>

                <button className="btn-primary" onClick={handleAddNew}>
                    <Plus size={18} />
                    Nueva Frecuencia
                </button>
            </div>

            <div className="toolbar">
                <div className="search-bar">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por id o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loading ? (
                <div className="loading-state">
                    <Repeat size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Cargando frecuencias de interés...
                </div>
            ) : (
                <InteresFrecuenciaTable
                    frecuencias={filteredFrecuencias}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onView={handleView}
                />
            )}

            <InteresFrecuenciaModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setFrecuenciaToEdit(null);
                }}
                onSave={handleSaveModal}
                frecuenciaToEdit={frecuenciaToEdit}
            />
        </div>
    );
};

export default InteresFrecuenciaPage;