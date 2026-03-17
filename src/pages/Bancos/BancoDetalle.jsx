import React from 'react';
import { ArrowLeft, Building2, Hash, Activity, IdCard } from 'lucide-react';
import { getId, getNombre, getSwift, getEstado, isActivo } from './BancoPage';

const BancoDetalle = ({ banco, onBack }) => {
    if (!banco) return null;

    const activo = isActivo(banco);

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
                        <Building2 size={28} />
                    </div>
                    <div>
                        <h2>{getNombre(banco) || 'Sin nombre'}</h2>
                        <p className="detalle-subtitle">Información detallada del banco</p>
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
                            #{getId(banco)}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Building2 size={14} />
                            Nombre Institucional
                        </div>
                        <div className="detalle-valor">
                            {getNombre(banco) || 'No disponible'}
                        </div>
                    </div>

                    <div className="detalle-item">
                        <div className="detalle-label">
                            <Hash size={14} />
                            Código SWIFT / BIC
                        </div>
                        <div className="detalle-valor">
                            <code className="swift-txt swift-lg">
                                {getSwift(banco) || 'N/A'}
                            </code>
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

export default BancoDetalle;