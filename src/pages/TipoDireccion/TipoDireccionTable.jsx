import React from 'react';
import { Edit2, Eye, ToggleLeft, ToggleRight, MapPin } from 'lucide-react';
import { getId, getDescripcion, isActivo } from './TipoDireccionPage';

const TipoDireccionTable = ({ tipos, onEdit, onToggleStatus, onView }) => {
  if (!tipos || tipos.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <p>No se encontraron tipos de dirección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Descripción</th>
            <th className="text-center">Estado</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tipos.map((tipo, idx) => {
            const id = getId(tipo);
            const activo = isActivo(tipo);
            const rowKey = id ?? `row-${idx}`;

            return (
              <tr key={rowKey} className={activo ? 'row-active' : 'row-inactive'}>
                <td className="col-id">{idx + 1}</td>

                <td className="font-semibold direccion-cell">
                  <MapPin size={15} />
                  {getDescripcion(tipo) || 'N/A'}
                </td>

                <td className="text-center">
                  <span className={`status-pill ${activo ? 'pill-green' : 'pill-red'}`}>
                    <span className="pill-dot" />
                    {activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>

                <td>
                  <div className="action-buttons">
                    <button
                      type="button"
                      className="icon-btn view"
                      title="Ver detalles"
                      onClick={() => onView(tipo)}
                    >
                      <Eye size={17} />
                    </button>

                    <button
                      type="button"
                      className="icon-btn edit"
                      title="Editar"
                      onClick={() => onEdit(tipo)}
                    >
                      <Edit2 size={17} />
                    </button>

                    <button
                      type="button"
                      className={`icon-btn toggle ${activo ? 'is-active' : 'is-inactive'}`}
                      title={activo ? 'Desactivar' : 'Activar'}
                      onClick={() => onToggleStatus(id, !activo)}
                    >
                      {activo ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
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

export default TipoDireccionTable;