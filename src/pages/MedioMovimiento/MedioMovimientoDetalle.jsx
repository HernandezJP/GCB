import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { getId, getDescripcion, getEstado, getFecha } from './MedioMovimientoPage';

const MedioMovimientoDetalle = ({ medio, onBack }) => {
  return (
    <div className="detail-card">
      <div className="detail-header">
        <button className="btn-cancel" onClick={onBack}>
          <ArrowLeft size={16} />
          Regresar
        </button>
        <h2>Detalle de Medio de Movimiento</h2>
      </div>

      <div className="detail-grid">
        <div className="detail-item">
          <strong>ID:</strong>
          <span>{getId(medio)}</span>
        </div>

        <div className="detail-item">
          <strong>Descripción:</strong>
          <span>{getDescripcion(medio)}</span>
        </div>

        <div className="detail-item">
          <strong>Estado:</strong>
          <span>{getEstado(medio)}</span>
        </div>

        <div className="detail-item">
          <strong>Fecha de creación:</strong>
          <span>{getFecha(medio) || 'Sin fecha'}</span>
        </div>
      </div>
    </div>
  );
};

export default MedioMovimientoDetalle;