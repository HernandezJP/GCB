import React from 'react';
import { Edit2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import {
    getId,
    getNumeroCuenta,
    getBancoNombre,
    getFrecuenciaDescripcion,
    getPorcentaje,
    isActivo,
    formatearPorcentaje
} from './TasaInteresPage';

const TasaInteresTable = ({ tasas, onEdit, onToggleStatus, onView }) => {
    if (!tasas || tasas.length === 0) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    <p>No se encontraron tasas de interés.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="table-container">
            <div className="table-scroll">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Cuenta</th>
                            <th>Banco</th>
                            <th>Frecuencia</th>
                            <th className="text-center">Porcentaje</th>
                            <th className="text-center">Estado</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasas.map((tasa, idx) => {
                            const id = getId(tasa);
                            const activo = isActivo(tasa);
                            const rowKey = id ?? `row-${idx}`;

                            return (
                                <tr key={rowKey} className={activo ? 'row-active' : 'row-inactive'}>
                                    <td className="col-id">{idx + 1}</td>

                                    <td className="font-semibold">
                                        {getNumeroCuenta(tasa) || 'N/A'}
                                    </td>

                                    <td>{getBancoNombre(tasa) || 'N/A'}</td>

                                    <td>{getFrecuenciaDescripcion(tasa) || 'N/A'}</td>

                                    <td className="text-center">
                                        <span className="percentage-badge">
                                            {formatearPorcentaje(getPorcentaje(tasa))}
                                        </span>
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
                                                onClick={() => onView(tasa)}
                                            >
                                                <Eye size={17} />
                                            </button>

                                            <button
                                                className="icon-btn edit"
                                                title="Editar"
                                                onClick={() => onEdit(tasa)}
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
                                                    : <ToggleLeft size={22} />
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

export default TasaInteresTable;