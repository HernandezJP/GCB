import React from 'react';
import { Eye, Ban } from 'lucide-react';
import {
  getId,
  getTipoDescripcion,
  getMedioDescripcion,
  getPersonaNombre,
  getMonto,
  getRecargo,
  getSaldo,
  getEstadoDescripcion,
  getDescripcion,
  getReferencia,
  getFecha,
  esIngreso,
  estaAnulado,
  formatDate,
  formatMoney
} from './MovimientoHelpers';

const MovimientoTable = ({ movimientos, onView, onAnular, simbolo = 'Q' }) => {
  if (!movimientos || movimientos.length === 0) {
    return <div className="empty-state">No se encontraron movimientos.</div>;
  }

  return (
    <div className="table-container">
      <div className="table-scroll">
        <table className="custom-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Medio</th>
              <th>Persona</th>
              <th>Descripción</th>
              <th>Referencia</th>
              <th>Monto</th>
              <th>Recargo</th>
              <th>Saldo</th>
              <th>Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((m, idx) => {
              const id = getId(m);
              const anulado = estaAnulado(m);
              const ingreso = esIngreso(m);

              return (
                <tr
                  key={id ?? `mov-${idx}`}
                  className={anulado ? 'row-inactive' : 'row-active'}
                  onClick={() => onView && onView(m)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ color: '#cbd5e1', fontSize: 11, fontWeight: 600 }}>
                    {idx + 1}
                  </td>

                  <td>{formatDate(getFecha(m))}</td>

                  <td>
                    <span className={`status-pill ${anulado ? 'pill-gray' : ingreso ? 'pill-green' : 'pill-red'}`}>
                      {getTipoDescripcion(m)}
                    </span>
                  </td>

                  <td>{getMedioDescripcion(m) || '—'}</td>
                  <td>{getPersonaNombre(m) || '—'}</td>
                  <td>{getDescripcion(m) || '—'}</td>

                  <td>
                    <code
                      style={{
                        fontFamily: 'monospace',
                        background: '#f1f5f9',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600
                      }}
                    >
                      {getReferencia(m) || '—'}
                    </code>
                  </td>

                  <td
                    style={{
                      fontWeight: 600,
                      color: ingreso ? '#15803d' : '#b91c1c',
                      fontFamily: 'monospace',
                      fontSize: 13
                    }}
                  >
                    {ingreso ? '+' : '-'} {formatMoney(getMonto(m), simbolo)}
                  </td>

                  <td style={{ fontFamily: 'monospace', fontSize: 13 }}>
                    {getRecargo(m) > 0 ? formatMoney(getRecargo(m), simbolo) : '—'}
                  </td>

                  <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 13 }}>
                    {formatMoney(getSaldo(m), simbolo)}
                  </td>

                  <td>{getEstadoDescripcion(m) || '—'}</td>

                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="action-buttons">
                      <button
                        className="icon-btn view"
                        title="Ver detalle"
                        onClick={() => onView && onView(m)}
                        type="button"
                      >
                        <Eye size={16} />
                      </button>

                      {!anulado && (
                        <button
                          className="icon-btn toggle-off"
                          title="Anular"
                          onClick={() => onAnular && onAnular(id)}
                          type="button"
                        >
                          <Ban size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MovimientoTable;