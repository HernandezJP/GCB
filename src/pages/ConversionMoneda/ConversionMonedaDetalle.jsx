import React from 'react';
import {
    ArrowLeft,
    RefreshCw,
    Activity,
    CalendarDays,
    Hash,
    Landmark,
    BadgeDollarSign
} from 'lucide-react';

import {
    getId,
    getMonedaOrigenId,
    getMonedaDestinoId,
    getSimboloOrigen,
    getDescripcionOrigen,
    getIsoOrigen,
    getSimboloDestino,
    getDescripcionDestino,
    getIsoDestino,
    getTasaCambio,
    getFechaVigencia,
    getFuente,
    getEstado,
    getFechaCreacion,
    isActivo,
    formatearTasa
} from './ConversionMonedaPage';

const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';

    try {
        return new Date(fecha).toLocaleDateString('es-GT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return fecha;
    }
};

const ConversionMonedaDetalle = ({ conversion, onBack }) => {
    if (!conversion) return null;

    const activo = isActivo(conversion);

    return (
        <div className="detalle-container">
            <div className="detalle-back-row">
                <button className="btn-secondary" onClick={onBack}>
                    <ArrowLeft size={16} />
                    Volver al catálogo
                </button>
            </div>

            <div className="detalle-card">
                <div className="detalle-card-header">
                    <div className="detalle-icon-wrap">
                        <RefreshCw size={28} />
                    </div>

                    <div>
                        <h2>{getIsoOrigen(conversion)} → {getIsoDestino(conversion)}</h2>
                        <p className="detalle-subtitle">Información detallada de la conversión de moneda</p>
                    </div>

                    <span className={`status-pill ${activo ? 'pill-green' : 'pill-red'} detalle-status`}>
                        <span className="pill-dot" />
                        {activo ? 'Activo' : 'Inactivo'}
                    </span>
                </div>

                <div className="detalle-grid">
                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Hash size={14} />
                            ID Interno
                        </div>
                        <div className="detalle-valor mono">
                            #{getId(conversion)}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Landmark size={14} />
                            Moneda Origen
                        </div>
                        <div className="detalle-valor">
                            {getSimboloOrigen(conversion)} - {getDescripcionOrigen(conversion)} ({getIsoOrigen(conversion)})
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Landmark size={14} />
                            ID Moneda Origen
                        </div>
                        <div className="detalle-valor mono">
                            #{getMonedaOrigenId(conversion)}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Landmark size={14} />
                            Moneda Destino
                        </div>
                        <div className="detalle-valor">
                            {getSimboloDestino(conversion)} - {getDescripcionDestino(conversion)} ({getIsoDestino(conversion)})
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Landmark size={14} />
                            ID Moneda Destino
                        </div>
                        <div className="detalle-valor mono">
                            #{getMonedaDestinoId(conversion)}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <BadgeDollarSign size={14} />
                            Tasa de Cambio
                        </div>
                        <div className="detalle-valor">
                            {formatearTasa(getTasaCambio(conversion))}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <CalendarDays size={14} />
                            Fecha de Vigencia
                        </div>
                        <div className="detalle-valor">
                            {formatearFecha(getFechaVigencia(conversion))}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <RefreshCw size={14} />
                            Fuente
                        </div>
                        <div className="detalle-valor">
                            {getFuente(conversion) || 'No disponible'}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Activity size={14} />
                            Estado del Registro
                        </div>
                        <div className="detalle-valor">
                            <span className={`status-pill ${activo ? 'pill-green' : 'pill-red'}`}>
                                <span className="pill-dot" />
                                {activo ? 'Operativo (Activo)' : 'Baja lógica (Inactivo)'}
                            </span>
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <CalendarDays size={14} />
                            Fecha de Creación
                        </div>
                        <div className="detalle-valor">
                            {formatearFecha(getFechaCreacion(conversion))}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Activity size={14} />
                            Estado en BD
                        </div>
                        <div className="detalle-valor mono">
                            {getEstado(conversion)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConversionMonedaDetalle;