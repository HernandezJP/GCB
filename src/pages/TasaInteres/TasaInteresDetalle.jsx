import React from 'react';
import {
    ArrowLeft,
    Percent,
    Wallet,
    Building2,
    Landmark,
    Repeat,
    Activity,
    CalendarDays,
    Hash
} from 'lucide-react';

import {
    getId,
    getCuentaId,
    getNumeroCuenta,
    getBancoNombre,
    getTipoCuenta,
    getFrecuenciaId,
    getFrecuenciaDescripcion,
    getPorcentaje,
    getEstado,
    getFechaCreacion,
    isActivo,
    formatearPorcentaje
} from './TasaInteresPage';

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

const TasaInteresDetalle = ({ tasa, onBack }) => {
    if (!tasa) return null;

    const activo = isActivo(tasa);

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
                        <Percent size={28} />
                    </div>

                    <div>
                        <h2>{formatearPorcentaje(getPorcentaje(tasa))}</h2>
                        <p className="detalle-subtitle">Información detallada de la tasa de interés</p>
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
                            #{getId(tasa)}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Wallet size={14} />
                            ID Cuenta
                        </div>
                        <div className="detalle-valor mono">
                            #{getCuentaId(tasa)}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Landmark size={14} />
                            Número de Cuenta
                        </div>
                        <div className="detalle-valor">
                            {getNumeroCuenta(tasa) || 'No disponible'}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Building2 size={14} />
                            Banco
                        </div>
                        <div className="detalle-valor">
                            {getBancoNombre(tasa) || 'No disponible'}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Wallet size={14} />
                            Tipo de Cuenta
                        </div>
                        <div className="detalle-valor">
                            {getTipoCuenta(tasa) || 'No disponible'}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Repeat size={14} />
                            Frecuencia
                        </div>
                        <div className="detalle-valor">
                            {getFrecuenciaDescripcion(tasa) || `ID ${getFrecuenciaId(tasa)}`}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Percent size={14} />
                            Porcentaje
                        </div>
                        <div className="detalle-valor">
                            {formatearPorcentaje(getPorcentaje(tasa))}
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
                            {formatearFecha(getFechaCreacion(tasa))}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Hash size={14} />
                            ID Frecuencia
                        </div>
                        <div className="detalle-valor mono">
                            #{getFrecuenciaId(tasa)}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Activity size={14} />
                            Estado en BD
                        </div>
                        <div className="detalle-valor mono">
                            {getEstado(tasa)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TasaInteresDetalle;