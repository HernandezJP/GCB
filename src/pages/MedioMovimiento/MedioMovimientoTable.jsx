import React from 'react';
import { Eye, Pencil, Power } from 'lucide-react';
import { getId, getDescripcion, isActivo } from './MedioMovimientoPage';

const MedioMovimientoTable = ({ medios, onEdit, onToggleStatus, onView }) => {
  if (!medios.length) {
    return (
      <div className="empty-state">
        No se encontraron medios de movimiento.
      </div>
    );
  }

  return (
    <div className="table-card">
      <table className="custom-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {medios.map((m) => {
            const id = getId(m);
            const activo = isActivo(m);

            return (
              <tr key={id}>
                <td>{id}</td>
                <td>{getDescripcion(m)}</td>
                <td>
                  <span className={`status-badge ${activo ? 'active' : 'inactive'}`}>
                    {activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button className="icon-btn" title="Ver detalle" onClick={() => onView(m)}>
                      <Eye size={16} />
                    </button>

                    <button className="icon-btn" title="Editar" onClick={() => onEdit(m)}>
                      <Pencil size={16} />
                    </button>

                    <button
                      className="icon-btn"
                      title={activo ? 'Desactivar' : 'Inactivo'}
                      onClick={() => onToggleStatus(id, activo)}
                    >
                      <Power size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MedioMovimientoTable;