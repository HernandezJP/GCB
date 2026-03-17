import React from 'react';
import { ArrowLeft, Phone, Activity, IdCard, CalendarDays } from 'lucide-react';
import { getId, getDescripcion, getFechaCreacion, isActivo } from './TipoTelefonoPage';

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

const TipoTelefonoDetalle = ({ tipo, onBack }) => {
    if (!tipo) return null;

    const activo = isActivo(tipo);

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
                        <Phone size={28} />
                    </div>

                    <div>
                        <h2>{getDescripcion(tipo) || 'Sin descripción'}</h2>
                        <p className="detalle-subtitle">Información detallada del tipo de teléfono</p>
                    </div>

                    <span className={`status-pill ${activo ? 'pill-green' : 'pill-red'} detalle-status`}>
                        <span className="pill-dot" />
                        {activo ? 'Activo' : 'Inactivo'}
                    </span>
                </div>

                <div className="detalle-grid">
                    <div className="detalle-item">
                        <div className="detalle-label">
                            <IdCard size={14} />
                            ID Interno
                        </div>
                        <div className="detalle-valor mono">
                            #{getId(tipo)}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Phone size={14} />
                            Descripción
                        </div>
                        <div className="detalle-valor">
                            {getDescripcion(tipo) || 'No disponible'}
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
                            {formatearFecha(getFechaCreacion(tipo))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TipoTelefonoDetalle;