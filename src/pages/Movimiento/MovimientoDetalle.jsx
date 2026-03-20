import React from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  getId,
  getDescripcion,
  getReferencia,
  getMonto,
  getSaldo,
  getFecha,
  getTipoId,
  getMedioId,
  getEstadoId,
  getCuenta,
  getPersona
} from './MovimientoPage';

const MovimientoDetalle = ({
  movimiento,
  tiposMovimiento,
  mediosMovimiento,
  estadosMovimiento,
  onBack
}) => {
  const getTipoDesc = (id) =>
    tiposMovimiento.find(t => t.TIM_Tipo_Movimiento === id)?.TIM_Descripcion || id;

  const getMedioDesc = (id) =>
    mediosMovimiento.find(m => m.MEM_Medio_Movimiento === id)?.MEM_Descripcion || id;

  const getEstadoDesc = (id) =>
    estadosMovimiento.find(e => e.ESM_Estado_Movimiento === id)?.ESM_Descripcion || id;

  return (
    <div className="detail-card">
      <div className="detail-header">
        <button className="btn-cancel" onClick={onBack}>
          <ArrowLeft size={16} />
          Regresar
        </button>
        <h2>Detalle de Movimiento</h2>
      </div>

      <div className="detail-grid">
        <div className="detail-item">
          <strong>ID:</strong>
          <span>{getId(movimiento)}</span>
        </div>

        <div className="detail-item">
          <strong>Cuenta:</strong>
          <span>{getCuenta(movimiento)}</span>
        </div>

        <div className="detail-item">
          <strong>Persona:</strong>
          <span>{getPersona(movimiento)}</span>
        </div>

        <div className="detail-item">
          <strong>Tipo de Movimiento:</strong>
          <span>{getTipoDesc(getTipoId(movimiento))}</span>
        </div>

        <div className="detail-item">
          <strong>Medio de Movimiento:</strong>
          <span>{getMedioDesc(getMedioId(movimiento))}</span>
        </div>

        <div className="detail-item">
          <strong>Estado de Movimiento:</strong>
          <span>{getEstadoDesc(getEstadoId(movimiento))}</span>
        </div>

        <div className="detail-item">
          <strong>Referencia:</strong>
          <span>{getReferencia(movimiento)}</span>
        </div>

        <div className="detail-item">
          <strong>Descripción:</strong>
          <span>{getDescripcion(movimiento)}</span>
        </div>

        <div className="detail-item">
          <strong>Monto:</strong>
          <span>{getMonto(movimiento)}</span>
        </div>

        <div className="detail-item">
          <strong>Saldo:</strong>
          <span>{getSaldo(movimiento)}</span>
        </div>

        <div className="detail-item">
          <strong>Fecha:</strong>
          <span>{getFecha(movimiento)?.substring(0, 10) || 'Sin fecha'}</span>
        </div>
      </div>
    </div>
  );
};

export default MovimientoDetalle;