import React from 'react';
import {
    ArrowLeft,
    Zap,
    Activity,
    CalendarDays,
    Hash,
    Landmark,
    BadgeDollarSign,
    Repeat
} from 'lucide-react';

import {
    getId,
    getCuentaId,
    getNumeroCuenta,
    getBancoNombre,
    getDescripcion,
    getOrigen,
    getOrigenLabel,
    getMonto,
    getFrecuencia,
    getFrecuenciaLabel,
    getDiaCobro,
    getEstado,
    getFechaCreacion,
    isActivo,
    formatearMonto
} from './ReglaRecargoPage';

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

const ReglaRecargoDetalle = ({ regla, onBack }) => {
    if (!regla) return null;

    const activo = isActivo(regla);

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
                        <Zap size={28} />
                    </div>

                    <div>
                        <h2>{getDescripcion(regla) || 'Sin descripción'}</h2>
                        <p className="detalle-subtitle">Información detallada de la regla de recargo</p>
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
                            #{getId(regla)}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Landmark size={14} />
                            Cuenta
                        </div>
                        <div className="detalle-valor">
                            {getNumeroCuenta(regla) || 'No disponible'}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Landmark size={14} />
                            Banco
                        </div>
                        <div className="detalle-valor">
                            {getBancoNombre(regla) || 'No disponible'}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Hash size={14} />
                            ID Cuenta
                        </div>
                        <div className="detalle-valor mono">
                            #{getCuentaId(regla)}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Zap size={14} />
                            Descripción
                        </div>
                        <div className="detalle-valor">
                            {getDescripcion(regla) || 'No disponible'}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Repeat size={14} />
                            Origen
                        </div>
                        <div className="detalle-valor">
                            {getOrigen(regla)} - {getOrigenLabel(getOrigen(regla))}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <BadgeDollarSign size={14} />
                            Monto
                        </div>
                        <div className="detalle-valor">
                            {formatearMonto(getMonto(regla))}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Repeat size={14} />
                            Frecuencia
                        </div>
                        <div className="detalle-valor">
                            {getFrecuencia(regla)} - {getFrecuenciaLabel(getFrecuencia(regla))}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <CalendarDays size={14} />
                            Día de Cobro
                        </div>
                        <div className="detalle-valor">
                            {getDiaCobro(regla) ?? 'No aplica'}
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
                            {formatearFecha(getFechaCreacion(regla))}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Activity size={14} />
                            Estado en BD
                        </div>
                        <div className="detalle-valor mono">
                            {getEstado(regla)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReglaRecargoDetalle;