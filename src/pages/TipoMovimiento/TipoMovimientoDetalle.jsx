import React from 'react';
import { ArrowLeft, Shuffle, Activity, IdCard, Calendar } from 'lucide-react';
import { getId, getDescripcion, getFecha, isActivo } from './TipoMovimientoPage';

const TipoMovimientoDetalle = ({ movimiento, onBack }) => {
    if (!movimiento) return null;

    const activo = isActivo(movimiento);

    const formatFecha = () => {
        const fecha = getFecha(movimiento);
        if (!fecha) return 'No disponible';
        return new Date(fecha).toLocaleDateString('es-GT', {
            weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
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
                        <Shuffle size={28} />
                    </div>
                    <div>
                        <h2>{getDescripcion(movimiento) || 'Sin descripción'}</h2>
                        <p className="detalle-subtitle">Información detallada del tipo de movimiento</p>
                    </div>
                    <span className={`status-pill ${activo ? 'pill-green' : 'pill-red'} detalle-status`}>
                        <span className="pill-dot" />
                        {activo ? 'Activo' : 'Inactivo'}
                    </span>
                </div>

                <div className="detalle-grid">
                    <div className="detalle-item">
                        <div className="detalle-label">
                            <IdCard size={14} /> ID Interno
                        </div>
                        <div className="detalle-valor mono">
                            #{getId(movimiento)}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Shuffle size={14} /> Descripción
                        </div>
                        <div className="detalle-valor">
                            {getDescripcion(movimiento) || 'No disponible'}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Calendar size={14} /> Fecha de Creación
                        </div>
                        <div className="detalle-valor">
                            {formatFecha()}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Activity size={14} /> Estado del Registro
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

export default TipoMovimientoDetalle;