import React from 'react';
import { Edit2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { getId, isActivo, getNombre, getSwift } from './BancoPage';

const BancoTable = ({ bancos, onEdit, onToggleStatus, onView }) => {

    if (!bancos || bancos.length === 0) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    <p>No se encontraron bancos.</p>
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
                        <th>Nombre del Banco</th>
                        <th>Código SWIFT</th>
                        <th className="text-center">Estado</th>
                        <th className="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {bancos.map((banco, idx) => {
                        const id = getId(banco);
                        const activo = isActivo(banco);
                        const rowKey = id ?? `row-${idx}`;

                        return (
                            <tr key={rowKey} className={activo ? 'row-active' : 'row-inactive'}>
                                <td className="col-id">{idx + 1}</td>

                                <td className="font-semibold">
                                    {getNombre(banco) || 'N/A'}
                                </td>

                                <td>
                                    <code className="swift-txt">
                                        {getSwift(banco) || 'N/A'}
                                    </code>
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
                                            onClick={() => onView(banco)}
                                        >
                                            <Eye size={17} />
                                        </button>

                                        <button
                                            className="icon-btn edit"
                                            title="Editar"
                                            onClick={() => onEdit(banco)}
                                        >
                                            <Edit2 size={17} />
                                        </button>

                                        <button
                                            className={`icon-btn toggle ${activo ? 'is-active' : 'is-inactive'}`}
                                            title={activo ? 'Desactivar banco' : 'Activar banco'}
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

export default BancoTable;