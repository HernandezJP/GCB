import React from 'react';
import { Edit2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import {
    getId,
    getSimboloOrigen,
    getDescripcionOrigen,
    getIsoOrigen,
    getSimboloDestino,
    getDescripcionDestino,
    getIsoDestino,
    getTasaCambio,
    getFuente,
    isActivo,
    formatearTasa
} from './ConversionMonedaPage';

const ConversionMonedaTable = ({ conversiones, onEdit, onToggleStatus, onView }) => {
    if (!conversiones || conversiones.length === 0) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    <p>No se encontraron conversiones de moneda.</p>
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
                            <th>Origen</th>
                            <th>Destino</th>
                            <th className="text-center">Tasa</th>
                            <th className="text-center">Fuente</th>
                            <th className="text-center">Estado</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {conversiones.map((conversion, idx) => {
                            const id = getId(conversion);
                            const activo = isActivo(conversion);
                            const rowKey = id ?? `row-${idx}`;

                            return (
                                <tr key={rowKey} className={activo ? 'row-active' : 'row-inactive'}>
                                    <td className="col-id">{idx + 1}</td>

                                    <td className="font-semibold">
                                        {getSimboloOrigen(conversion)} - {getDescripcionOrigen(conversion)} ({getIsoOrigen(conversion)})
                                    </td>

                                    <td className="font-semibold">
                                        {getSimboloDestino(conversion)} - {getDescripcionDestino(conversion)} ({getIsoDestino(conversion)})
                                    </td>

                                    <td className="text-center">
                                        <span className="rate-badge">{formatearTasa(getTasaCambio(conversion))}</span>
                                    </td>

                                    <td className="text-center">
                                        <span className={`source-pill ${getFuente(conversion) === 'API' ? 'source-api' : 'source-manual'}`}>
                                            {getFuente(conversion) || 'N/A'}
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
                                                onClick={() => onView(conversion)}
                                            >
                                                <Eye size={17} />
                                            </button>

                                            <button
                                                className="icon-btn edit"
                                                title="Editar"
                                                onClick={() => onEdit(conversion)}
                                            >
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

export default ConversionMonedaTable;