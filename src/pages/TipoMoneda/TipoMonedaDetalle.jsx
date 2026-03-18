import React from 'react';
import { ArrowLeft, Coins, Activity, IdCard, Calendar, Tag } from 'lucide-react';
import { getId, getDescripcion, getSimbolo, getFecha, isActivo } from './TipoMonedaPage';

const TipoMonedaDetalle = ({ moneda, onBack }) => {
    if (!moneda) return null;

    const activo = isActivo(moneda);

    const formatFecha = () => {
        const fecha = getFecha(moneda);
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
                        <Coins size={28} />
                    </div>
                    <div>
                        <h2>
                            {getSimbolo(moneda) && (
                                <span className="simbolo-badge simbolo-lg">{getSimbolo(moneda)}</span>
                            )}
                            {' '}{getDescripcion(moneda) || 'Sin descripción'}
                        </h2>
                        <p className="detalle-subtitle">Información detallada del tipo de moneda</p>
                    </div>
                    <span className={`status-pill ${activo ? 'pill-green' : 'pill-red'} detalle-status`}>
                        <span className="pill-dot" />
                        {activo ? 'Activo' : 'Inactivo'}
                    </span>
                </div>

                <div className="detalle-grid">
                    <div className="detalle-item">
                        <div className="detalle-label"><IdCard size={14} /> ID Interno</div>
                        <div className="detalle-valor mono">#{getId(moneda)}</div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label"><Coins size={14} /> Descripción</div>
                        <div className="detalle-valor">{getDescripcion(moneda) || 'No disponible'}</div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label"><Tag size={14} /> Símbolo</div>
                        <div className="detalle-valor">
                            <span className="simbolo-badge simbolo-lg">
                                {getSimbolo(moneda) || '—'}
                            </span>
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label"><Calendar size={14} /> Fecha de Creación</div>
                        <div className="detalle-valor">{formatFecha()}</div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label"><Activity size={14} /> Estado del Registro</div>
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

export default TipoMonedaDetalle;