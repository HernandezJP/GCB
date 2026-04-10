import React from 'react';
import { Edit2, Eye, Trash2 } from 'lucide-react';
import {
    getId,
    getDescripcion,
    getOrigen,
    getOrigenLabel,
    getMonto,
    getFrecuencia,
    getFrecuenciaLabel,
    getDiaCobro,
    isActivo,
    formatearMonto
} from './ReglaRecargoPage';

const ReglaRecargoTable = ({ reglas, onEdit, onDelete, onView }) => {
    if (!reglas || reglas.length === 0) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    <p>No se encontraron reglas de recargo para esta cuenta.</p>
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
                            <th>Descripción</th>
                            <th>Origen</th>
                            <th className="text-center">Monto</th>
                            <th>Frecuencia</th>
                            <th className="text-center">Día Cobro</th>
                            <th className="text-center">Estado</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reglas.map((regla, idx) => {
                            const id = getId(regla);
                            const activo = isActivo(regla);
                            const rowKey = id ?? `row-${idx}`;

                            return (
                                <tr key={rowKey} className={activo ? 'row-active' : 'row-inactive'}>
                                    <td className="col-id">{idx + 1}</td>

                                    <td className="font-semibold">
                                        {getDescripcion(regla) || 'N/A'}
                                    </td>

                                    <td>
                                        <span className="code-pill">
                                            {getOrigen(regla)} - {getOrigenLabel(getOrigen(regla))}
                                        </span>
                                    </td>

                                    <td className="text-center">
                                        <span className="amount-badge">
                                            {formatearMonto(getMonto(regla))}
                                        </span>
                                    </td>

                                    <td>{getFrecuenciaLabel(getFrecuencia(regla))}</td>

                                    <td className="text-center">
                                        {getDiaCobro(regla) ?? '—'}
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
                                                onClick={() => onView(regla)}
                                            >
                                                <Eye size={17} />
                                            </button>

                                            <button
                                                className="icon-btn edit"
                                                title="Editar"
                                                onClick={() => onEdit(regla)}
                                            >
                                                <Edit2 size={17} />
                                            </button>

                                            <button
                                                className="icon-btn delete"
                                                title="Desactivar"
                                                onClick={() => onDelete(id)}
                                            >
                                                <Trash2 size={17} />
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

export default ReglaRecargoTable;