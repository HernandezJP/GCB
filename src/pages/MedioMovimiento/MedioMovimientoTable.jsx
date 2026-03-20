import React from 'react';
import { Edit2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { getId, getDescripcion, isActivo, getFecha } from './MedioMovimientoPage';

const MedioMovimientoTable = ({ medios, onEdit, onToggleStatus, onView }) => {

    if (!medios || medios.length === 0) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    <p>No se encontraron medios de movimiento.</p>
                </div>
            </div>
        );
    }

    const formatFecha = (medio) => {
        const fecha = getFecha(medio);
        if (!fecha) return '—';
        return new Date(fecha).toLocaleDateString('es-GT', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className="table-container">
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
                    {medios.map((medio, idx) => {
                        const id     = getId(medio);
                        const activo = isActivo(medio);
                        const rowKey = id ?? `row-${idx}`;

                        return (
                            <tr key={rowKey} className={activo ? 'row-active' : 'row-inactive'}>
                                <td className="col-id">{idx + 1}</td>

                                <td className="font-semibold">
                                    {getDescripcion(medio) || 'N/A'}
                                </td>

                                <td className="col-fecha">
                                    {formatFecha(medio)}
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
                                            onClick={() => onView(medio)}
                                        >
                                            <Eye size={17} />
                                        </button>

                                        <button
                                            className="icon-btn edit"
                                            title="Editar"
                                            onClick={() => onEdit(medio)}
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
    );
};

export default MedioMovimientoTable;