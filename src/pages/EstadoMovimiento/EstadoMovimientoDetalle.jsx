import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { getId, getDescripcion, getEstado, getFecha } from './EstadoMovimientoPage';

const EstadoMovimientoDetalle = ({ estado, onBack }) => {
  return (
    <div className="detail-card">
      <div className="detail-header">
        <button className="btn-cancel" onClick={onBack}>
          <ArrowLeft size={16} />
          Regresar
        </button>
        <h2>Detalle de Estado de Movimiento</h2>
      </div>

      <div className="detail-grid">
        <div className="detail-item">
          <strong>ID:</strong>
          <span>{getId(estado)}</span>
        </div>

        <div className="detail-item">
          <strong>Descripción:</strong>
          <span>{getDescripcion(estado)}</span>
        </div>

        <div className="detail-item">
          <strong>Estado:</strong>
          <span>{getEstado(estado)}</span>
        </div>

        <div className="detail-item">
          <strong>Fecha de creación:</strong>
          <span>{getFecha(estado) || 'Sin fecha'}</span>
        </div>
      </div>
    </div>
  );
};

export default EstadoMovimientoDetalle;