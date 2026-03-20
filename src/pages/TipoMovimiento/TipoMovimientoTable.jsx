import React from 'react';
import { Eye, Pencil, Power } from 'lucide-react';
import { getId, getDescripcion, getEstado, isActivo } from './TipoMovimientoPage';

const TipoMovimientoTable = ({ movimientos, onEdit, onToggleStatus, onView }) => {
  if (!movimientos.length) {
    return (
      <div className="empty-state">
        No se encontraron tipos de movimiento.
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
          {movimientos.map((m) => {
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

export default TipoMovimientoTable;