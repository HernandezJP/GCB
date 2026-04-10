import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import {
  getId,
  getMovimiento,
  getNumeroCheque,
  getFechaEmision,
  getEstadoCheque,
  getChequera,
  getBeneficiario,
  getConcepto
} from './ChequeModal';

const ChequeTable = ({ cheques, onEdit, onDelete }) => {
  if (!cheques || cheques.length === 0) {
    return <div className="empty-state">No hay cheques registrados.</div>;
  }

  return (
    <div className="table-container">
      <div className="table-scroll">
        <table className="custom-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Número cheque</th>
              <th>Movimiento</th>
              <th>Chequera</th>
              <th>Beneficiario</th>
              <th>Concepto</th>
              <th>Fecha emisión</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {cheques.map((c, idx) => {
              const id = getId(c);

              return (
                <tr key={id ?? `row-${idx}`}>
                  <td style={{ color: '#cbd5e1', fontSize: 11, fontWeight: 600 }}>{idx + 1}</td>

                  <td>
                    <code style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                      {getNumeroCheque(c)}
                    </code>
                  </td>

                  <td>{getMovimiento(c)}</td>
                  <td>{getChequera(c)}</td>
                  <td>{getBeneficiario(c) || '—'}</td>
                  <td>{getConcepto(c) || '—'}</td>
                  <td>{String(getFechaEmision(c)).split('T')[0] || '—'}</td>

                  <td>
                    <span className="status-pill pill-blue">
                      {getEstadoCheque(c)}
                    </span>
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn edit" title="Editar" onClick={() => onEdit && onEdit(c)}>
                        <Edit2 size={16} />
                      </button>

                      <button className="icon-btn toggle-off" title="Eliminar" onClick={() => onDelete && onDelete(id)}>
                        <Trash2 size={16} />
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

export default ChequeTable;