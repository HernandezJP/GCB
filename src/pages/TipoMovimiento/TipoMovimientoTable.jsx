import React from 'react';
import { Edit2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { getId, getDescripcion, isActivo, getFecha } from './TipoMovimientoPage';

const TipoMovimientoTable = ({ movimientos, onEdit, onToggleStatus, onView }) => {

    if (!movimientos || movimientos.length === 0) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    <p>No se encontraron tipos de movimiento.</p>
                </div>
            </div>
        );
    }

    const formatFecha = (m) => {
        const fecha = getFecha(m);
        if (!fecha) return '—';
        return new Date(fecha).toLocaleDateString('es-GT', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className="table-container">
            <div className="table-scroll">
            <table className="custom-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Descripción</th>
                        <th>Fecha Creación</th>
                        <th className="text-center">Estado</th>
                        <th className="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {movimientos.map((m, idx) => {
                        const id     = getId(m);
                        const activo = isActivo(m);
                        const rowKey = id ?? `row-${idx}`;

                        return (
                            <tr key={rowKey} className={activo ? 'row-active' : 'row-inactive'}>
                                <td className="col-id">{idx + 1}</td>

                                <td className="font-semibold">
                                    {getDescripcion(m) || 'N/A'}
                                </td>

                                <td className="col-fecha">
                                    {formatFecha(m)}
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
                                            className="icon-btn view"
                                            title="Ver detalles"
                                            onClick={() => onView(m)}
                                        >
                                            <Eye size={17} />
                                        </button>

                                        <button
                                            className="icon-btn edit"
                                            title="Editar"
                                            onClick={() => onEdit(m)}
                                        >
                                            <Edit2 size={17} />
                                        </button>

                                        <button
                                            className={`icon-btn toggle ${activo ? 'is-active' : 'is-inactive'}`}
                                            title={activo ? 'Desactivar' : 'Activar'}
                                            onClick={() => onToggleStatus(id, !activo)}
                                        >
                                            {activo
                                                ? <ToggleRight size={22} />
                                                : <ToggleLeft  size={22} />
                                            }
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

export default TipoMovimientoTable;