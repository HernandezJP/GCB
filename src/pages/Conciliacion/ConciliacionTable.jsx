import React from 'react';
import { Eye, RefreshCcw, Lock } from 'lucide-react';
import {
  getConciliacionId,
  getCuentaId,
  getPeriodo,
  getSaldoBanco,
  getSaldoLibros,
  getDiferencia,
  getFechaConciliacion,
  getEstadoConciliacionDescripcion,
  getEstadoPillClass,
  formatDate,
  formatMoney,
} from './ConciliacionHelpers';

const ConciliacionTable = ({ conciliaciones, onView, onRecalcular, onCerrar }) => {
  if (!conciliaciones || conciliaciones.length === 0) {
    return <div className="empty-state">No se encontraron conciliaciones.</div>;
  }

  return (
    <div className="table-container">
      <div className="table-scroll">
        <table className="custom-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cuenta</th>
              <th>Período</th>
              <th>Saldo banco</th>
              <th>Saldo libros</th>
              <th>Diferencia</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {conciliaciones.map((c, idx) => {
              const id = getConciliacionId(c);
              const estado = getEstadoConciliacionDescripcion(c);

              return (
                <tr
                  key={id ?? `conc-${idx}`}
                  onClick={() => onView && onView(c)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ color: '#cbd5e1', fontSize: 11, fontWeight: 600 }}>{idx + 1}</td>
                  <td>{getCuentaId(c)}</td>
                  <td>{getPeriodo(c) || '—'}</td>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {formatMoney(getSaldoBanco(c))}
                  </td>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {formatMoney(getSaldoLibros(c))}
                  </td>
                  <td
                    style={{
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      color: getDiferencia(c) === 0 ? '#15803d' : '#b91c1c',
                    }}
                  >
                    {formatMoney(getDiferencia(c))}
                  </td>
                  <td>
                    <span className={`status-pill ${getEstadoPillClass(estado)}`}>
                      {estado}
                    </span>
                  </td>
                  <td>{formatDate(getFechaConciliacion(c))}</td>

                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="action-buttons">
                      <button
                        className="icon-btn view"
                        title="Ver detalle"
                        onClick={() => onView && onView(c)}
                        type="button"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="icon-btn edit"
                        title="Recalcular estado"
                        onClick={() => onRecalcular && onRecalcular(id)}
                        type="button"
                      >
                        <RefreshCcw size={16} />
                      </button>

                      <button
                        className="icon-btn toggle-on"
                        title="Cerrar conciliación"
                        onClick={() => onCerrar && onCerrar(id)}
                        type="button"
                      >
                        <Lock size={16} />
                      </button>
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

export default ConciliacionTable;