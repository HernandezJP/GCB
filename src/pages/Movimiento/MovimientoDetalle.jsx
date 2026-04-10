import React from 'react';
import { ArrowLeft, ArrowLeftRight } from 'lucide-react';
import {
  getTipoDescripcion,
  getMedioDescripcion,
  getPersonaNombre,
  getEstadoDescripcion,
  getDescripcion,
  getReferencia,
  getMonto,
  getRecargo,
  getSaldo,
  getFecha,
  getFechaCreacion,
  formatDate,
  formatMoney,
  esIngreso
} from './MovimientoHelpers';

const MovimientoDetalle = ({ movimiento, onBack, simbolo = 'Q' }) => {
  if (!movimiento) return null;

  const ingreso = esIngreso(movimiento);

  return (
    <div>
      <button
        className="btn-secondary"
        style={{ marginBottom: 16 }}
        onClick={onBack}
        type="button"
      >
        <ArrowLeft size={15} /> Volver a movimientos
      </button>

      <div className="detalle-card">
        <div className="detalle-header">
          <div className="detalle-icon">
            <ArrowLeftRight size={26} />
          </div>

          <div>
            <h2>{getTipoDescripcion(movimiento) || 'Movimiento'}</h2>
            <p className="detalle-subtitle">
              {getMedioDescripcion(movimiento) || '—'} {' · '} {formatDate(getFecha(movimiento))}
            </p>
          </div>

          <div className="detalle-status">
            <span className={`status-pill ${ingreso ? 'pill-green' : 'pill-red'}`}>
              {getEstadoDescripcion(movimiento) || '—'}
            </span>
          </div>
        </div>

        <div className="detalle-stats">
          {[
            { label: 'Persona', val: getPersonaNombre(movimiento) || '—' },
            { label: 'Referencia', val: getReferencia(movimiento) || '—' },
            {
              label: 'Monto',
              val: formatMoney(getMonto(movimiento), simbolo),
              color: ingreso ? '#15803d' : '#b91c1c'
            },
            { label: 'Saldo', val: formatMoney(getSaldo(movimiento), simbolo) },
          ].map((s, i) => (
            <div key={i} className="detalle-stat">
              <div className="detalle-stat-label">{s.label}</div>
              <div className="detalle-stat-value" style={{ color: s.color || '#0f172a' }}>
                {s.val}
              </div>
            </div>
          ))}
        </div>

        <div className="tab-content" style={{ paddingTop: 24 }}>
          <div className="form-grid">
            <div className="input-group">
              <label>Descripción</label>
              <input value={getDescripcion(movimiento) || '—'} disabled />
            </div>

            <div className="input-group">
              <label>Recargo</label>
              <input value={formatMoney(getRecargo(movimiento), simbolo)} disabled />
            </div>

            <div className="input-group">
              <label>Fecha del movimiento</label>
              <input value={formatDate(getFecha(movimiento))} disabled />
            </div>

            <div className="input-group">
              <label>Fecha de creación</label>
              <input value={formatDate(getFechaCreacion(movimiento))} disabled />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovimientoDetalle;