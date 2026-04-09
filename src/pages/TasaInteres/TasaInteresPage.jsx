import React, { useState, useEffect } from 'react';
import { Plus, Search, Percent } from 'lucide-react';
import {
    getTasasInteres,
    createTasaInteres,
    updateTasaInteres,
    deleteTasaInteres,
    reactivarTasaInteres
} from '../../services/TasaInteresService';

import TasaInteresTable from './TasaInteresTable';
import TasaInteresModal from './TasaInteresModal';
import TasaInteresDetalle from './TasaInteresDetalle';
import './TasaInteres.css';

export const getId = (t) => t?.tiN_Tasa_Interes ?? t?.TIN_Tasa_Interes;
export const getCuentaId = (t) => t?.cuB_Cuenta ?? t?.CUB_Cuenta;
export const getNumeroCuenta = (t) => t?.cuB_Numero_Cuenta ?? t?.CUB_Numero_Cuenta ?? '';
export const getBancoNombre = (t) => t?.baN_Nombre ?? t?.BAN_Nombre ?? '';
export const getTipoCuenta = (t) => t?.tcU_Descripcion ?? t?.TCU_Descripcion ?? '';
export const getFrecuenciaId = (t) => t?.inF_Frecuencia ?? t?.INF_Frecuencia;
export const getFrecuenciaDescripcion = (t) => t?.inF_Descripcion ?? t?.INF_Descripcion ?? '';
export const getPorcentaje = (t) => t?.tiN_Porcentaje ?? t?.TIN_Porcentaje ?? 0;
export const getEstado = (t) => t?.tiN_Estado ?? t?.TIN_Estado ?? 'I';
export const getFechaCreacion = (t) => t?.tiN_Fecha_Creacion ?? t?.TIN_Fecha_Creacion ?? '';
export const isActivo = (t) => getEstado(t) === 'A';

export const formatearPorcentaje = (valor) => {
    const numero = Number(valor);
    if (Number.isNaN(numero)) return '0.00%';
    return `${numero.toFixed(2)}%`;
};

const TasaInteresPage = () => {
    const [tasas, setTasas] = useState([]);
    const [filteredTasas, setFilteredTasas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tasaToEdit, setTasaToEdit] = useState(null);
    const [tasaDetail, setTasaDetail] = useState(null);

    const fetchTasas = async () => {
        try {
            setLoading(true);
            const data = await getTasasInteres();

            if (data?.length > 0) {
                console.group('💰 TasaInteres API');
                console.log('Objeto:', data[0]);
                console.log('Claves:', Object.keys(data[0]));
                console.log('ID detectado:', getId(data[0]));
                console.groupEnd();
            }

            setTasas(data || []);
            setFilteredTasas(data || []);
            setError(null);
        } catch (err) {
            console.error('Error al obtener tasas de interés:', err);
            setError('No se pudieron cargar las tasas de interés.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasas();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!searchTerm.trim()) {
                setFilteredTasas(tasas);
                return;
            }

            const q = searchTerm.toLowerCase();

            setFilteredTasas(
                tasas.filter(t =>
                    String(getId(t)).toLowerCase().includes(q) ||
                    String(getCuentaId(t)).toLowerCase().includes(q) ||
                    getNumeroCuenta(t).toLowerCase().includes(q) ||
                    getBancoNombre(t).toLowerCase().includes(q) ||
                    getTipoCuenta(t).toLowerCase().includes(q) ||
                    getFrecuenciaDescripcion(t).toLowerCase().includes(q) ||
                    String(getPorcentaje(t)).toLowerCase().includes(q)
                )
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchTerm, tasas]);

    const handleAddNew = () => {
        setTasaToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (tasa) => {
        setTasaToEdit(tasa);
        setIsModalOpen(true);
    };

    const handleView = (tasa) => {
        setTasaDetail(tasa);
    };

    const handleToggleStatus = async (id, nuevoActivo) => {
        if (id === undefined || id === null) {
            alert('Error interno: ID no detectado.');
            return;
        }

        try {
            if (nuevoActivo) {
                if (!window.confirm('¿Deseas reactivar esta tasa de interés?')) return;
                await reactivarTasaInteres(id);
            } else {
                if (!window.confirm('¿Deseas desactivar esta tasa de interés?')) return;
                await deleteTasaInteres(id);
            }

            await fetchTasas();
        } catch (err) {
            console.error('Error al cambiar estado de tasa de interés:', err);
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
            if (tasaToEdit) {
                const id = getId(tasaToEdit);

                if (id === undefined || id === null) {
                    alert('Error: ID no detectado.');
                    return;
                }

                await updateTasaInteres(id, {
                    INF_Frecuencia: Number(formData.INF_Frecuencia),
                    TIN_Porcentaje: Number(formData.TIN_Porcentaje)
                });
            } else {
                await createTasaInteres({
                    CUB_Cuenta: Number(formData.CUB_Cuenta),
                    INF_Frecuencia: Number(formData.INF_Frecuencia),
                    TIN_Porcentaje: Number(formData.TIN_Porcentaje)
                });
            }

            setIsModalOpen(false);
            setTasaToEdit(null);
            await fetchTasas();
        } catch (err) {
            console.error('Error al guardar tasa de interés:', err);
            const msg =
                err.response?.data?.mensaje ||
                err.response?.data?.message ||
                err.response?.data?.title ||
                err.response?.data ||
                'Error al guardar.';
            alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    if (tasaDetail) {
        return (
            <div className="tiposc-container">
                <TasaInteresDetalle
                    tasa={tasaDetail}
                    onBack={() => setTasaDetail(null)}
                />
            </div>
        );
    }

    return (
        <div className="tiposc-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Tasas de Interés</h1>
                    <span className="record-count">{filteredTasas.length} registros</span>
                </div>

                <button className="btn-primary" onClick={handleAddNew}>
                    <Plus size={18} />
                    Nueva Tasa
                </button>
            </div>

            <div className="toolbar">
                <div className="search-bar">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por cuenta, banco, tipo, frecuencia o porcentaje..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loading ? (
                <div className="loading-state">
                    <Percent size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Cargando tasas de interés...
                </div>
            ) : (
                <TasaInteresTable
                    tasas={filteredTasas}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onView={handleView}
                />
            )}

            <TasaInteresModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setTasaToEdit(null);
                }}
                onSave={handleSaveModal}
                tasaToEdit={tasaToEdit}
            />
        </div>
    );
};

export default TasaInteresPage;