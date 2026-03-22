import React from 'react';
import { ArrowLeft, CreditCard, Activity, IdCard, Calendar } from 'lucide-react';
import { getId, getDescripcion, getEstado, isActivo, getFecha } from './TipoCuentaPage';

const TipoCuentaDetalle = ({ tipo, onBack }) => {
    if (!tipo) return null;

    const activo = isActivo(tipo);

    const formatFecha = () => {
        const fecha = getFecha(tipo);
        if (!fecha) return 'No disponible';
        return new Date(fecha).toLocaleDateString('es-GT', {
            weekday: 'long',
            day:     '2-digit',
            month:   'long',
            year:    'numeric'
        });
    };

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
                        <CreditCard size={28} />
                    </div>
                    <div>
                        <h2>{getDescripcion(tipo) || 'Sin descripción'}</h2>
                        <p className="detalle-subtitle">Información detallada del tipo de cuenta</p>
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
                            <CreditCard size={14} />
                            Descripción
                        </div>
                        <div className="detalle-valor">
                            {getDescripcion(tipo) || 'No disponible'}
                        </div>
                    </div>
                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Calendar size={14} />
                            Fecha de Creación
                        </div>
                        <div className="detalle-valor">
                            {formatFecha()}
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
                </div>
            </div>
        </div>
    );
};

export default TipoCuentaDetalle;