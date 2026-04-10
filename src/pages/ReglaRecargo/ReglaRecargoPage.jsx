import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Zap, Landmark } from 'lucide-react';
import {
    getReglasRecargoPorCuenta,
    createReglaRecargo,
    updateReglaRecargo,
    deleteReglaRecargo
} from '../../services/ReglaRecargoService';
import { getCuentas } from '../../services/CuentaBancariaService';

import ReglaRecargoTable from './ReglaRecargoTable';
import ReglaRecargoModal from './ReglaRecargoModal';
import ReglaRecargoDetalle from './ReglaRecargoDetalle';
import './ReglaRecargo.css';

export const getId = (r) => r?.rcA_Regla_Recargo ?? r?.RCA_Regla_Recargo;
export const getCuentaId = (r) => r?.cuB_Cuenta ?? r?.CUB_Cuenta;
export const getNumeroCuenta = (r) => r?.cuB_Numero_Cuenta ?? r?.CUB_Numero_Cuenta ?? '';
export const getBancoNombre = (r) => r?.baN_Nombre ?? r?.BAN_Nombre ?? '';
export const getDescripcion = (r) => r?.rcA_Descripcion ?? r?.RCA_Descripcion ?? '';
export const getOrigen = (r) => r?.rcA_Origen ?? r?.RCA_Origen ?? '';
export const getMonto = (r) => r?.rcA_Monto ?? r?.RCA_Monto ?? 0;
export const getFrecuencia = (r) => r?.rcA_Frecuencia ?? r?.RCA_Frecuencia ?? '';
export const getDiaCobro = (r) => r?.rcA_Dia_Cobro ?? r?.RCA_Dia_Cobro;
export const getEstado = (r) => r?.rcA_Estado ?? r?.RCA_Estado ?? 'I';
export const getFechaCreacion = (r) => r?.rcA_Fecha_Creacion ?? r?.RCA_Fecha_Creacion ?? '';
export const isActivo = (r) => getEstado(r) === 'A';

export const getOrigenLabel = (codigo) => {
    switch (codigo) {
        case 'C':
            return 'Cobro por cuenta';
        case 'Q':
            return 'Cheque';
        case 'T':
            return 'Transferencia';
        case 'S':
            return 'Servicio';
        default:
            return codigo || 'No definido';
    }
};

export const getFrecuenciaLabel = (codigo) => {
    switch (codigo) {
        case 'M':
            return 'Mensual';
        case 'U':
            return 'Única';
        case 'O':
            return 'Por operación';
        default:
            return codigo || 'No definida';
    }
};

export const formatearMonto = (valor) => {
    const numero = Number(valor);
    if (Number.isNaN(numero)) return 'Q 0.00';
    return `Q ${numero.toFixed(2)}`;
};

const getCuentaEstado = (c) => c?.cuB_Estado ?? c?.CUB_Estado ?? 'I';
const getCuentaIdValue = (c) => c?.cuB_Cuenta ?? c?.CUB_Cuenta;
const getCuentaNumeroValue = (c) => c?.cuB_Numero_Cuenta ?? c?.CUB_Numero_Cuenta ?? '';
const getCuentaBancoValue = (c) => c?.baN_Nombre ?? c?.BAN_Nombre ?? '';

const ReglaRecargoPage = () => {
    const [cuentas, setCuentas] = useState([]);
    const [selectedCuentaId, setSelectedCuentaId] = useState('');
    const [reglas, setReglas] = useState([]);
    const [filteredReglas, setFilteredReglas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingCuentas, setLoadingCuentas] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reglaToEdit, setReglaToEdit] = useState(null);
    const [reglaDetail, setReglaDetail] = useState(null);

    const cuentaSeleccionada = useMemo(
        () => cuentas.find(c => String(getCuentaIdValue(c)) === String(selectedCuentaId)) || null,
        [cuentas, selectedCuentaId]
    );

    const fetchCuentas = async () => {
        try {
            setLoadingCuentas(true);
            const data = await getCuentas();
            const activas = (data || []).filter(c => getCuentaEstado(c) === 'A');
            setCuentas(activas);

            if (activas.length > 0) {
                setSelectedCuentaId(prev => prev || String(getCuentaIdValue(activas[0])));
            }
        } catch (err) {
            console.error('Error al obtener cuentas bancarias:', err);
            setError('No se pudieron cargar las cuentas bancarias.');
        } finally {
            setLoadingCuentas(false);
        }
    };

    const fetchReglas = async (cuentaId) => {
        if (!cuentaId) {
            setReglas([]);
            setFilteredReglas([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await getReglasRecargoPorCuenta(cuentaId);
            setReglas(data || []);
            setFilteredReglas(data || []);
            setError(null);
        } catch (err) {
            console.error('Error al obtener reglas de recargo:', err);
            setError('No se pudieron cargar las reglas de recargo.');
            setReglas([]);
            setFilteredReglas([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCuentas();
    }, []);

    useEffect(() => {
        if (selectedCuentaId) {
            fetchReglas(selectedCuentaId);
        }
    }, [selectedCuentaId]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!searchTerm.trim()) {
                setFilteredReglas(reglas);
                return;
            }

            const q = searchTerm.toLowerCase();

            setFilteredReglas(
                reglas.filter(r =>
                    String(getId(r) ?? '').toLowerCase().includes(q) ||
                    getDescripcion(r).toLowerCase().includes(q) ||
                    getBancoNombre(r).toLowerCase().includes(q) ||
                    getNumeroCuenta(r).toLowerCase().includes(q) ||
                    getOrigenLabel(getOrigen(r)).toLowerCase().includes(q) ||
                    getFrecuenciaLabel(getFrecuencia(r)).toLowerCase().includes(q) ||
                    String(getMonto(r) ?? '').toLowerCase().includes(q)
                )
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchTerm, reglas]);

    const handleAddNew = () => {
        if (!selectedCuentaId) {
            alert('Primero selecciona una cuenta bancaria.');
            return;
        }

        setReglaToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (regla) => {
        setReglaToEdit(regla);
        setIsModalOpen(true);
    };

    const handleView = (regla) => {
        setReglaDetail(regla);
    };

    const handleDelete = async (id) => {
        if (id === undefined || id === null) {
            alert('Error interno: ID no detectado.');
            return;
        }

        if (!window.confirm('¿Deseas desactivar esta regla de recargo?')) return;

        try {
            await deleteReglaRecargo(id);
            await fetchReglas(selectedCuentaId);
        } catch (err) {
            console.error('Error al desactivar regla de recargo:', err);
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
            if (reglaToEdit) {
                const id = getId(reglaToEdit);

                if (id === undefined || id === null) {
                    alert('Error: ID no detectado.');
                    return;
                }

                await updateReglaRecargo(id, {
                    RCA_Descripcion: formData.RCA_Descripcion.trim(),
                    RCA_Origen: formData.RCA_Origen,
                    RCA_Monto: Number(formData.RCA_Monto),
                    RCA_Frecuencia: formData.RCA_Frecuencia,
                    RCA_Dia_Cobro:
                        formData.RCA_Frecuencia === 'M' && formData.RCA_Dia_Cobro !== ''
                            ? Number(formData.RCA_Dia_Cobro)
                            : null
                });
            } else {
                await createReglaRecargo({
                    CUB_Cuenta: Number(selectedCuentaId),
                    RCA_Descripcion: formData.RCA_Descripcion.trim(),
                    RCA_Origen: formData.RCA_Origen,
                    RCA_Monto: Number(formData.RCA_Monto),
                    RCA_Frecuencia: formData.RCA_Frecuencia,
                    RCA_Dia_Cobro:
                        formData.RCA_Frecuencia === 'M' && formData.RCA_Dia_Cobro !== ''
                            ? Number(formData.RCA_Dia_Cobro)
                            : null
                });
            }

            setIsModalOpen(false);
            setReglaToEdit(null);
            await fetchReglas(selectedCuentaId);
        } catch (err) {
            console.error('Error al guardar regla de recargo:', err);
            const msg =
                err.response?.data?.mensaje ||
                err.response?.data?.message ||
                err.response?.data?.title ||
                err.response?.data ||
                'Error al guardar.';
            alert(`Error: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    if (reglaDetail) {
        return (
            <div className="tiposc-container">
                <ReglaRecargoDetalle
                    regla={reglaDetail}
                    onBack={() => setReglaDetail(null)}
                />
            </div>
        );
    }

    return (
        <div className="tiposc-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Reglas de Recargo</h1>
                    <span className="record-count">{filteredReglas.length} registros</span>
                </div>

                <button className="btn-primary" onClick={handleAddNew} disabled={!selectedCuentaId}>
                    <Plus size={18} />
                    Nueva Regla
                </button>
            </div>

            <div className="toolbar toolbar-grid">
                <div className="input-group account-filter">
                    <label htmlFor="cuenta-select">
                        <Landmark size={14} />
                        Cuenta Bancaria
                    </label>
                    <select
                        id="cuenta-select"
                        value={selectedCuentaId}
                        onChange={(e) => setSelectedCuentaId(e.target.value)}
                        disabled={loadingCuentas}
                    >
                        {loadingCuentas ? (
                            <option value="">Cargando cuentas...</option>
                        ) : cuentas.length === 0 ? (
                            <option value="">No hay cuentas activas</option>
                        ) : (
                            cuentas.map((cuenta) => (
                                <option key={getCuentaIdValue(cuenta)} value={getCuentaIdValue(cuenta)}>
                                    {getCuentaNumeroValue(cuenta)} - {getCuentaBancoValue(cuenta)}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                <div className="search-bar">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por descripción, origen, frecuencia o monto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={!selectedCuentaId}
                    />
                </div>
            </div>

            {cuentaSeleccionada && (
                <div className="selected-account-banner">
                    <Zap size={16} />
                    Trabajando con la cuenta:
                    <strong>{getCuentaNumeroValue(cuentaSeleccionada)}</strong>
                    <span>{getCuentaBancoValue(cuentaSeleccionada)}</span>
                </div>
            )}

            {error && <div className="error-banner">{error}</div>}

            {!selectedCuentaId ? (
                <div className="empty-state">
                    Selecciona una cuenta bancaria para ver sus reglas de recargo.
                </div>
            ) : loading ? (
                <div className="loading-state">
                    <Zap size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Cargando reglas de recargo...
                </div>
            ) : (
                <ReglaRecargoTable
                    reglas={filteredReglas}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                />
            )}

            <ReglaRecargoModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setReglaToEdit(null);
                }}
                onSave={handleSaveModal}
                reglaToEdit={reglaToEdit}
                cuentaSeleccionada={cuentaSeleccionada}
            />
        </div>
    );
};

export default ReglaRecargoPage;