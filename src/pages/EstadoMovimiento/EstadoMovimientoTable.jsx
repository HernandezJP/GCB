import React from 'react';
import { Eye, Pencil, Power } from 'lucide-react';
import { getId, getDescripcion, isActivo } from './EstadoMovimientoPage';

const EstadoMovimientoTable = ({ estados, onEdit, onToggleStatus, onView }) => {
  if (!estados.length) {
    return (
      <div className="empty-state">
        No se encontraron estados de movimiento.
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
          {estados.map((e) => {
            const id = getId(e);
            const activo = isActivo(e);

            return (
              <tr key={id}>
                <td>{id}</td>
                <td>{getDescripcion(e)}</td>
                <td>
                  <span className={`status-badge ${activo ? 'active' : 'inactive'}`}>
                    {activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button className="icon-btn" title="Ver detalle" onClick={() => onView(e)}>
                      <Eye size={16} />
                    </button>

                    <button className="icon-btn" title="Editar" onClick={() => onEdit(e)}>
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

export default EstadoMovimientoTable;