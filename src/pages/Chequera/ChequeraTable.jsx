import React from 'react';
import { Eye, Edit2, ToggleRight, ToggleLeft } from 'lucide-react';
import {
  getId,
  getCuenta,
  getSerie,
  getNumeroDesde,
  getNumeroHasta,
  getUltimoUsado,
  getEstado,
  getFechaRecepcion,
  isActiva
} from './ChequeraModal';

const ChequeraTable = ({ chequeras, onView, onEdit, onToggleStatus }) => {
  if (!chequeras || chequeras.length === 0) {
    return <div className="empty-state">No hay chequeras registradas.</div>;
  }

  return (
    <div className="table-container">
      <div className="table-scroll">
        <table className="custom-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Serie</th>
              <th>Cuenta</th>
              <th>Rango</th>
              <th>Último usado</th>
              <th>Disponibles</th>
              <th>Fecha recepción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {chequeras.map((c, idx) => {
              const activo = isActiva(c);
              const id = getId(c);
              const desde = Number(getNumeroDesde(c));
              const hasta = Number(getNumeroHasta(c));
              const ultimo = Number(getUltimoUsado(c));
              const disponibles = Math.max(hasta - ultimo, 0);

              return (
                <tr
                  key={id ?? `row-${idx}`}
                  className={activo ? 'row-active' : 'row-inactive'}
                  onClick={() => onView && onView(c)}
                >
                  <td style={{ color: '#cbd5e1', fontSize: 11, fontWeight: 600 }}>{idx + 1}</td>

                  <td>
                    <code style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                      {getSerie(c)}
                    </code>
                  </td>

                  <td>{getCuenta(c)}</td>
                  <td>{desde} - {hasta}</td>
                  <td>{ultimo}</td>
                  <td style={{ fontWeight: 700, color: disponibles > 0 ? '#16a34a' : '#dc2626' }}>
                    {disponibles}
                  </td>
                  <td>{String(getFechaRecepcion(c)).split('T')[0]}</td>

                  <td>
                    <span className={`status-pill ${activo ? 'pill-green' : 'pill-red'}`}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: activo ? '#22c55e' : '#ef4444', display: 'inline-block' }} />
                      {activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>

                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="action-buttons">
                      <button className="icon-btn view" title="Ver detalle" onClick={() => onView && onView(c)}>
                        <Eye size={16} />
                      </button>

                      <button className="icon-btn edit" title="Editar" onClick={() => onEdit && onEdit(c)}>
                        <Edit2 size={16} />
                      </button>

                      <button
                        className={`icon-btn ${activo ? 'toggle-on' : 'toggle-off'}`}
                        title={activo ? 'Desactivar' : 'Activar'}
                        onClick={() => onToggleStatus && onToggleStatus(id, !activo)}
                      >
                        {activo ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
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

export default ChequeraTable;