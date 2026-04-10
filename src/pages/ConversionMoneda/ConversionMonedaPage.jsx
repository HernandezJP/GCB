import React, { useEffect, useState } from 'react';
import { Plus, Search, RefreshCw } from 'lucide-react';
import {
    getConversionesMoneda,
    createConversionMoneda,
    updateConversionMoneda,
    deleteConversionMoneda,
    reactivarConversionMoneda,
    getTasaDesdeApi
} from '../../services/ConversionMonedaService';

import ConversionMonedaTable from './ConversionMonedaTable';
import ConversionMonedaModal from './ConversionMonedaModal';
import ConversionMonedaDetalle from './ConversionMonedaDetalle';
import './ConversionMoneda.css';

export const getId = (c) => c?.coM_Conversion_Moneda ?? c?.COM_Conversion_Moneda;
export const getMonedaOrigenId = (c) => c?.tmO_Tipo_Moneda ?? c?.TMO_Tipo_Moneda;
export const getMonedaDestinoId = (c) => c?.tmO_Tipo_Moneda_Destino ?? c?.TMO_Tipo_Moneda_Destino;

export const getSimboloOrigen = (c) => c?.tmO_Simbolo_Origen ?? c?.TMO_Simbolo_Origen ?? '';
export const getDescripcionOrigen = (c) => c?.tmO_Descripcion_Origen ?? c?.TMO_Descripcion_Origen ?? '';
export const getIsoOrigen = (c) => c?.tmO_Codigo_ISO_Origen ?? c?.TMO_Codigo_ISO_Origen ?? '';

export const getSimboloDestino = (c) => c?.tmO_Simbolo_Destino ?? c?.TMO_Simbolo_Destino ?? '';
export const getDescripcionDestino = (c) => c?.tmO_Descripcion_Destino ?? c?.TMO_Descripcion_Destino ?? '';
export const getIsoDestino = (c) => c?.tmO_Codigo_ISO_Destino ?? c?.TMO_Codigo_ISO_Destino ?? '';

export const getTasaCambio = (c) => c?.coM_Tasa_Cambio ?? c?.COM_Tasa_Cambio ?? 0;
export const getFechaVigencia = (c) => c?.coM_Fecha_Vigencia ?? c?.COM_Fecha_Vigencia ?? '';
export const getFuente = (c) => c?.coM_Fuente ?? c?.COM_Fuente ?? '';
export const getEstado = (c) => c?.coM_Estado ?? c?.COM_Estado ?? 'I';
export const getFechaCreacion = (c) => c?.coM_Fecha_Creacion ?? c?.COM_Fecha_Creacion ?? '';
export const isActivo = (c) => getEstado(c) === 'A';

export const formatearTasa = (valor) => {
    const numero = Number(valor);
    if (Number.isNaN(numero)) return '0.0000';
    return numero.toFixed(4);
};

const ConversionMonedaPage = () => {
    const [conversiones, setConversiones] = useState([]);
    const [filteredConversiones, setFilteredConversiones] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [conversionToEdit, setConversionToEdit] = useState(null);
    const [conversionDetail, setConversionDetail] = useState(null);

    const fetchConversiones = async () => {
        try {
            setLoading(true);
            const data = await getConversionesMoneda();
            setConversiones(data || []);
            setFilteredConversiones(data || []);
            setError(null);
        } catch (err) {
            console.error('Error al obtener conversiones:', err);
            setError('No se pudieron cargar las conversiones de moneda.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversiones();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!searchTerm.trim()) {
                setFilteredConversiones(conversiones);
                return;
            }

            const q = searchTerm.toLowerCase();

            setFilteredConversiones(
                conversiones.filter(c =>
                    String(getId(c) ?? '').toLowerCase().includes(q) ||
                    getDescripcionOrigen(c).toLowerCase().includes(q) ||
                    getIsoOrigen(c).toLowerCase().includes(q) ||
                    getDescripcionDestino(c).toLowerCase().includes(q) ||
                    getIsoDestino(c).toLowerCase().includes(q) ||
                    getFuente(c).toLowerCase().includes(q) ||
                    String(getTasaCambio(c) ?? '').toLowerCase().includes(q)
                )
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchTerm, conversiones]);

    const handleAddNew = () => {
        setConversionToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (conversion) => {
        setConversionToEdit(conversion);
        setIsModalOpen(true);
    };

    const handleView = (conversion) => {
        setConversionDetail(conversion);
    };

    const handleToggleStatus = async (id, nuevoActivo) => {
        if (id === undefined || id === null) {
            alert('Error interno: ID no detectado.');
            return;
        }

        try {
            if (nuevoActivo) {
                if (!window.confirm('¿Deseas reactivar esta conversión de moneda?')) return;
                await reactivarConversionMoneda(id);
            } else {
                if (!window.confirm('¿Deseas desactivar esta conversión de moneda?')) return;
                await deleteConversionMoneda(id);
            }

            await fetchConversiones();
        } catch (err) {
            console.error('Error al cambiar estado de conversión:', err);
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
            if (conversionToEdit) {
                const id = getId(conversionToEdit);

                if (id === undefined || id === null) {
                    alert('Error: ID no detectado.');
                    return;
                }

                await updateConversionMoneda(id, {
                    COM_Tasa_Cambio: Number(formData.COM_Tasa_Cambio),
                    COM_Fecha_Vigencia: formData.COM_Fecha_Vigencia
                });
            } else {
                await createConversionMoneda({
                    TMO_Tipo_Moneda: Number(formData.TMO_Tipo_Moneda),
                    TMO_Tipo_Moneda_Destino: Number(formData.TMO_Tipo_Moneda_Destino),
                    COM_Tasa_Cambio: Number(formData.COM_Tasa_Cambio),
                    COM_Fecha_Vigencia: formData.COM_Fecha_Vigencia,
                    COM_Fuente: formData.COM_Fuente
                });
            }

            setIsModalOpen(false);
            setConversionToEdit(null);
            await fetchConversiones();
        } catch (err) {
            console.error('Error al guardar conversión:', err);
            const msg =
                err.response?.data?.mensaje ||
                err.response?.data?.message ||
                err.response?.data?.title ||
                err.response?.data ||
                'Error al guardar.';
            alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    const handleObtenerDesdeApi = async (monedaOrigenId, monedaDestinoId) => {
        try {
            const tasa = await getTasaDesdeApi(monedaOrigenId, monedaDestinoId);
            await fetchConversiones();
            return tasa;
        } catch (err) {
            console.error('Error al obtener tasa desde API:', err);
            const msg =
                err.response?.data?.mensaje ||
                err.response?.data?.message ||
                err.response?.data?.title ||
                err.response?.data ||
                'No se pudo obtener la tasa desde la API.';
            throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
        }
    };

    if (conversionDetail) {
        return (
            <div className="tiposc-container">
                <ConversionMonedaDetalle
                    conversion={conversionDetail}
                    onBack={() => setConversionDetail(null)}
                />
            </div>
        );
    }

    return (
        <div className="tiposc-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Conversión de Moneda</h1>
                    <span className="record-count">{filteredConversiones.length} registros</span>
                </div>

                <button className="btn-primary" onClick={handleAddNew}>
                    <Plus size={18} />
                    Nueva Conversión
                </button>
            </div>

            <div className="toolbar">
                <div className="search-bar">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por moneda origen, destino, ISO, tasa o fuente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loading ? (
                <div className="loading-state">
                    <RefreshCw size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Cargando conversiones de moneda...
                </div>
            ) : (
                <ConversionMonedaTable
                    conversiones={filteredConversiones}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onView={handleView}
                />
            )}

            <ConversionMonedaModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setConversionToEdit(null);
                }}
                onSave={handleSaveModal}
                onFetchApiRate={handleObtenerDesdeApi}
                conversionToEdit={conversionToEdit}
            />
        </div>
    );
};

export default ConversionMonedaPage;