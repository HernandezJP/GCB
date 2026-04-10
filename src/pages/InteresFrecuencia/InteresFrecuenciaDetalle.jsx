import React from 'react';
import {
    ArrowLeft,
    Repeat,
    Activity,
    CalendarDays,
    Hash
} from 'lucide-react';

import {
    getId,
    getDescripcion,
    getEstado,
    getFechaCreacion,
    isActivo
} from './InteresFrecuenciaPage';

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

const InteresFrecuenciaDetalle = ({ frecuencia, onBack }) => {
    if (!frecuencia) return null;

    const activo = isActivo(frecuencia);

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
                        <Repeat size={28} />
                    </div>

                    <div>
                        <h2>{getDescripcion(frecuencia) || 'Sin descripción'}</h2>
                        <p className="detalle-subtitle">Información detallada de la frecuencia de interés</p>
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
                            #{getId(frecuencia)}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Repeat size={14} />
                            Descripción
                        </div>
                        <div className="detalle-valor">
                            {getDescripcion(frecuencia) || 'No disponible'}
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
                            {formatearFecha(getFechaCreacion(frecuencia))}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Activity size={14} />
                            Estado en BD
                        </div>
                        <div className="detalle-valor mono">
                            {getEstado(frecuencia)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InteresFrecuenciaDetalle;