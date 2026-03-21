import React from 'react';
import { Eye, Pencil, Power } from 'lucide-react';
import {
  getId,
  getDescripcion,
  getReferencia,
  getMonto,
  getFecha,
  getTipoId,
  getMedioId,
  getEstadoId
} from './MovimientoPage';

const MovimientoTable = ({
  movimientos,
  tiposMovimiento,
  mediosMovimiento,
  estadosMovimiento,
  onEdit,
  onToggleStatus,
  onView
}) => {
  const getTipoDesc = (id) =>
    tiposMovimiento.find(t => t.TIM_Tipo_Movimiento === id)?.TIM_Descripcion || id;

  const getMedioDesc = (id) =>
    mediosMovimiento.find(m => m.MEM_Medio_Movimiento === id)?.MEM_Descripcion || id;

  const getEstadoDesc = (id) =>
    estadosMovimiento.find(e => e.ESM_Estado_Movimiento === id)?.ESM_Descripcion || id;

  if (!movimientos.length) {
    return <div className="empty-state">No se encontraron movimientos.</div>;
  }

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Referencia</th>
            <th>Descripción</th>
            <th>Tipo</th>
            <th>Medio</th>
            <th>Estado</th>
            <th>Monto</th>
            <th>Fecha</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {movimientos.map((m) => {
            const estadoId = getEstadoId(m);

            return (
              <tr key={getId(m)} className="row-active">
                <td className="col-id">{getId(m)}</td>
                <td>{getReferencia(m)}</td>
                <td className="font-semibold">{getDescripcion(m)}</td>
                <td>{getTipoDesc(getTipoId(m))}</td>
                <td>{getMedioDesc(getMedioId(m))}</td>
                <td>
                  <span className="status-pill pill-green">
                    <span className="pill-dot"></span>
                    {getEstadoDesc(estadoId)}
                  </span>
                </td>
                <td>{getMonto(m)}</td>
                <td className="col-fecha">{getFecha(m)?.substring(0, 10)}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => onView(m)} className="icon-btn view" title="Ver">
                      <Eye size={16} />
                    </button>

                    <button onClick={() => onEdit(m)} className="icon-btn edit" title="Editar">
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => onToggleStatus(getId(m))}
                      className="icon-btn toggle is-active"
                      title="Eliminar"
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

export default MovimientoTable;