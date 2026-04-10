import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, RefreshCw, CalendarDays, BadgeDollarSign, Landmark, Wand2 } from 'lucide-react';
import {
    getMonedaOrigenId,
    getMonedaDestinoId,
    getTasaCambio,
    getFechaVigencia
} from './ConversionMonedaPage';
import { getTiposMoneda } from '../../services/TipoMonedaService';

const INITIAL = {
    TMO_Tipo_Moneda: '',
    TMO_Tipo_Moneda_Destino: '',
    COM_Tasa_Cambio: '',
    COM_Fecha_Vigencia: '',
    COM_Fuente: 'M'
};

const getTipoMonedaId = (m) => m?.tmO_Tipo_Moneda ?? m?.TMO_Tipo_Moneda;
const getTipoMonedaDescripcion = (m) => m?.tmO_Descripcion ?? m?.TMO_Descripcion ?? '';
const getTipoMonedaSimbolo = (m) => m?.tmO_Simbolo ?? m?.TMO_Simbolo ?? '';
const getTipoMonedaISO = (m) => m?.tmO_Codigo_ISO ?? m?.TMO_Codigo_ISO ?? '';
const getTipoMonedaEstado = (m) => m?.tmO_Estado ?? m?.TMO_Estado ?? 'I';

const toDateInputValue = (value) => {
    if (!value) return '';
    try {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    } catch {
        return '';
    }
};

const ConversionMonedaModal = ({ isOpen, onClose, onSave, onFetchApiRate, conversionToEdit }) => {
    const [formData, setFormData] = useState(INITIAL);
    const [saving, setSaving] = useState(false);
    const [loadingMonedas, setLoadingMonedas] = useState(false);
    const [tiposMoneda, setTiposMoneda] = useState([]);
    const [fetchingApiRate, setFetchingApiRate] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const cargarMonedas = async () => {
            try {
                setLoadingMonedas(true);
                const data = await getTiposMoneda();
                const activas = (data || []).filter(m => getTipoMonedaEstado(m) === 'A');
                setTiposMoneda(activas);
            } catch (error) {
                console.error('Error al cargar tipos de moneda:', error);
                alert('No se pudieron cargar los tipos de moneda.');
            } finally {
                setLoadingMonedas(false);
            }
        };

        cargarMonedas();
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setFormData(
                conversionToEdit
                    ? {
                        TMO_Tipo_Moneda: getMonedaOrigenId(conversionToEdit) ?? '',
                        TMO_Tipo_Moneda_Destino: getMonedaDestinoId(conversionToEdit) ?? '',
                        COM_Tasa_Cambio: getTasaCambio(conversionToEdit) ?? '',
                        COM_Fecha_Vigencia: toDateInputValue(getFechaVigencia(conversionToEdit)),
                        COM_Fuente: 'M'
                    }
                    : {
                        ...INITIAL,
                        COM_Fecha_Vigencia: new Date().toISOString().split('T')[0]
                    }
            );
        }
    }, [conversionToEdit, isOpen]);

    const monedasDisponiblesDestino = useMemo(() => {
        if (!formData.TMO_Tipo_Moneda) return tiposMoneda;
        return tiposMoneda.filter(m => String(getTipoMonedaId(m)) !== String(formData.TMO_Tipo_Moneda));
    }, [tiposMoneda, formData.TMO_Tipo_Moneda]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!conversionToEdit) {
            if (!formData.TMO_Tipo_Moneda) {
                alert('Debes seleccionar la moneda origen.');
                return;
            }

            if (!formData.TMO_Tipo_Moneda_Destino) {
                alert('Debes seleccionar la moneda destino.');
                return;
            }

            if (String(formData.TMO_Tipo_Moneda) === String(formData.TMO_Tipo_Moneda_Destino)) {
                alert('La moneda origen y destino no pueden ser iguales.');
                return;
            }
        }

        if (formData.COM_Tasa_Cambio === '' || Number(formData.COM_Tasa_Cambio) <= 0) {
            alert('Debes ingresar una tasa de cambio válida.');
            return;
        }

        if (!formData.COM_Fecha_Vigencia) {
            alert('Debes ingresar una fecha de vigencia.');
            return;
        }

        setSaving(true);
        try {
            await onSave(formData);
        } finally {
            setSaving(false);
        }
    };

    const handleBuscarDesdeApi = async () => {
        if (!formData.TMO_Tipo_Moneda || !formData.TMO_Tipo_Moneda_Destino) {
            alert('Primero selecciona la moneda origen y la moneda destino.');
            return;
        }

        if (String(formData.TMO_Tipo_Moneda) === String(formData.TMO_Tipo_Moneda_Destino)) {
            alert('La moneda origen y destino no pueden ser iguales.');
            return;
        }

        try {
            setFetchingApiRate(true);
            const tasa = await onFetchApiRate(
                Number(formData.TMO_Tipo_Moneda),
                Number(formData.TMO_Tipo_Moneda_Destino)
            );

            setFormData(prev => ({
                ...prev,
                COM_Tasa_Cambio: tasa?.coM_Tasa_Cambio ?? tasa?.COM_Tasa_Cambio ?? prev.COM_Tasa_Cambio,
                COM_Fecha_Vigencia: toDateInputValue(tasa?.coM_Fecha_Vigencia ?? tasa?.COM_Fecha_Vigencia) || prev.COM_Fecha_Vigencia,
                COM_Fuente: tasa?.coM_Fuente ?? tasa?.COM_Fuente ?? 'API'
            }));

            alert('Tasa obtenida correctamente desde la API.');
        } catch (error) {
            alert(error.message || 'No se pudo obtener la tasa desde la API.');
        } finally {
            setFetchingApiRate(false);
        }
    };

    return createPortal(
        <div className="modal-backdrop">
            <div className="modal-card modal-card-lg">
                <div className="modal-header">
                    <div className="modal-title-group">
                        <div className="modal-icon">
                            <RefreshCw size={20} />
                        </div>
                        <h2>{conversionToEdit ? 'Editar Conversión de Moneda' : 'Nueva Conversión de Moneda'}</h2>
                    </div>

                    <button onClick={onClose} className="close-btn" disabled={saving || fetchingApiRate}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {!conversionToEdit && (
                            <>
                                <div className="input-group">
                                    <label htmlFor="tmo-origen">
                                        <Landmark size={13} />
                                        Moneda Origen
                                    </label>
                                    <select
                                        id="tmo-origen"
                                        required
                                        value={formData.TMO_Tipo_Moneda}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                TMO_Tipo_Moneda: e.target.value,
                                                TMO_Tipo_Moneda_Destino:
                                                    e.target.value === formData.TMO_Tipo_Moneda_Destino ? '' : formData.TMO_Tipo_Moneda_Destino
                                            })
                                        }
                                        disabled={saving || loadingMonedas || fetchingApiRate}
                                    >
                                        <option value="">
                                            {loadingMonedas ? 'Cargando monedas...' : 'Seleccione moneda origen'}
                                        </option>
                                        {tiposMoneda.map((m) => (
                                            <option key={getTipoMonedaId(m)} value={getTipoMonedaId(m)}>
                                                {getTipoMonedaSimbolo(m)} - {getTipoMonedaDescripcion(m)} ({getTipoMonedaISO(m)})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="tmo-destino">
                                        <Landmark size={13} />
                                        Moneda Destino
                                    </label>
                                    <select
                                        id="tmo-destino"
                                        required
                                        value={formData.TMO_Tipo_Moneda_Destino}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                TMO_Tipo_Moneda_Destino: e.target.value
                                            })
                                        }
                                        disabled={saving || loadingMonedas || fetchingApiRate}
                                    >
                                        <option value="">
                                            {loadingMonedas ? 'Cargando monedas...' : 'Seleccione moneda destino'}
                                        </option>
                                        {monedasDisponiblesDestino.map((m) => (
                                            <option key={getTipoMonedaId(m)} value={getTipoMonedaId(m)}>
                                                {getTipoMonedaSimbolo(m)} - {getTipoMonedaDescripcion(m)} ({getTipoMonedaISO(m)})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="api-action-row">
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={handleBuscarDesdeApi}
                                        disabled={saving || fetchingApiRate || loadingMonedas}
                                    >
                                        <Wand2 size={16} />
                                        {fetchingApiRate ? 'Consultando API...' : 'Obtener tasa desde API'}
                                    </button>
                                </div>
                            </>
                        )}

                        <div className="input-group">
                            <label htmlFor="com-tasa-cambio">
                                <BadgeDollarSign size={13} />
                                Tasa de Cambio
                            </label>
                            <input
                                id="com-tasa-cambio"
                                type="number"
                                step="0.0001"
                                min="0.0001"
                                required
                                value={formData.COM_Tasa_Cambio}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        COM_Tasa_Cambio: e.target.value
                                    })
                                }
                                placeholder="Ej. 7.7500"
                                disabled={saving || fetchingApiRate}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="com-fecha-vigencia">
                                <CalendarDays size={13} />
                                Fecha de Vigencia
                            </label>
                            <input
                                id="com-fecha-vigencia"
                                type="date"
                                required
                                value={formData.COM_Fecha_Vigencia}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        COM_Fecha_Vigencia: e.target.value
                                    })
                                }
                                disabled={saving || fetchingApiRate}
                            />
                        </div>

                        {!conversionToEdit && (
                            <div className="input-group">
                                <label htmlFor="com-fuente">
                                    <RefreshCw size={13} />
                                    Fuente
                                </label>
                                <select
                                    id="com-fuente"
                                    value={formData.COM_Fuente}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            COM_Fuente: e.target.value
                                        })
                                    }
                                    disabled={saving || fetchingApiRate}
                                >
                                    <option value="M">Manual</option>
                                    <option value="API">API</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}
                            disabled={saving || fetchingApiRate}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="btn-save"
                            disabled={saving || fetchingApiRate}
                        >
                            {saving
                                ? 'Guardando...'
                                : conversionToEdit
                                    ? 'Guardar Cambios'
                                    : 'Crear Conversión'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default ConversionMonedaModal;