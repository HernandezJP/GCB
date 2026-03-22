import React from 'react';
import { Edit2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { getId, getDescripcion, getSimbolo, isActivo, getFecha } from './TipoMonedaPage';

const TipoMonedaTable = ({ monedas, onEdit, onToggleStatus, onView }) => {

    if (!monedas || monedas.length === 0) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    <p>No se encontraron tipos de moneda.</p>
                </div>
            </div>
        );
    }

    const formatFecha = (moneda) => {
        const fecha = getFecha(moneda);
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
                        <th className="text-center">Símbolo</th>
                        <th>Fecha Creación</th>
                        <th className="text-center">Estado</th>
                        <th className="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {monedas.map((moneda, idx) => {
                        const id     = getId(moneda);
                        const activo = isActivo(moneda);
                        const rowKey = id ?? `row-${idx}`;

                        return (
                            <tr key={rowKey} className={activo ? 'row-active' : 'row-inactive'}>
                                <td className="col-id">{idx + 1}</td>

                                <td className="font-semibold">
                                    {getDescripcion(moneda) || 'N/A'}
                                </td>

                                <td className="text-center">
                                    <span className="simbolo-badge">
                                        {getSimbolo(moneda) || '—'}
                                    </span>
                                </td>

                                <td className="col-fecha">
                                    {formatFecha(moneda)}
                                </td>

                                <td className="text-center">
                                    <span className={`status-pill ${activo ? 'pill-green' : 'pill-red'}`}>
                                        <span className="pill-dot" />
                                        {activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>

                                <td>
                                    <div className="action-buttons">
                                        <button className="icon-btn view" title="Ver detalles" onClick={() => onView(moneda)}>
                                            <Eye size={17} />
                                        </button>
                                        <button className="icon-btn edit" title="Editar" onClick={() => onEdit(moneda)}>
                                            <Edit2 size={17} />
                                        </button>
                                        <button
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
        </div>
    );
};

export default TipoMonedaTable;