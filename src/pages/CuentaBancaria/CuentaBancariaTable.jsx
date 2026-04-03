import React from 'react';
import { Eye, Edit2, ToggleRight, ToggleLeft } from 'lucide-react';
import {
    getId, getBancoNombre, getNumero, getNombre, getApellido,
    getTipoCuenta, getMoneda, getSimbolo, getSaldoActual,
    getEstadoDesc, isActivo
} from './CuentaBancariaModal';

const CuentaBancariaTable = ({ cuentas, onView, onEdit, onToggleStatus }) => {
    if (!cuentas || cuentas.length === 0) {
        return <div className="empty-state">No se encontraron cuentas bancarias.</div>;
    }

    return (
        <div className="table-container">
            <div className="table-scroll">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Número de cuenta</th>
                            <th>Banco</th>
                            <th>Tipo</th>
                            <th>Moneda</th>
                            <th>Titular</th>
                            <th>Saldo actual</th>
                            <th>Estado cuenta</th>
                            <th>Estado</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cuentas.map((c, idx) => {
                            const activo   = isActivo(c);
                            const id       = getId(c);
                            const saldo    = getSaldoActual(c);
                            const simbolo  = getSimbolo(c);
                            const titular  = `${getNombre(c)} ${getApellido(c)}`.trim();

                            return (
                                <tr
                                    key={id ?? `row-${idx}`}
                                    className={activo ? 'row-active' : 'row-inactive'}
                                    onClick={() => onView && onView(c)}
                                    style={{ cursor:'pointer' }}
                                >
                                    <td style={{ color:'#cbd5e1', fontSize:11, fontWeight:600 }}>{idx + 1}</td>
                                    <td>
                                        <code style={{ fontFamily:'monospace', background:'#f1f5f9', padding:'2px 8px', borderRadius:4, fontSize:12, fontWeight:600 }}>
                                            {getNumero(c)}
                                        </code>
                                    </td>
                                    <td style={{ fontWeight:500 }}>{getBancoNombre(c)}</td>
                                    <td>{getTipoCuenta(c)}</td>
                                    <td>
                                        <span style={{ fontWeight:700, color:'#0284c7' }}>{simbolo}</span>
                                        {' '}{getMoneda(c)}
                                    </td>
                                    <td>{titular || '—'}</td>
                                    <td style={{ fontWeight:600, color: saldo < 0 ? '#b91c1c' : '#0f172a', fontFamily:'monospace', fontSize:13 }}>
                                        {simbolo} {saldo.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td>{getEstadoDesc(c) || '—'}</td>
                                    <td>
                                        <span className={`status-pill ${activo ? 'pill-green' : 'pill-red'}`}>
                                            <span style={{ width:6, height:6, borderRadius:'50%', background: activo?'#22c55e':'#ef4444', display:'inline-block' }}/>
                                            {activo ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </td>
                                    <td onClick={e => e.stopPropagation()}>
                                        <div className="action-buttons">
                                            <button className="icon-btn view" title="Ver detalle" onClick={() => onView && onView(c)}>
                                                <Eye size={16} />
                                            </button>
                                            <button className="icon-btn edit" title="Editar" onClick={() => onEdit && onEdit(c)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className={`icon-btn ${activo ? 'toggle-on' : 'toggle-off'}`}
                                                title={activo ? 'Desactivar' : 'Activar'}
                                                onClick={() => onToggleStatus && onToggleStatus(id, !activo)}
                                            >
                                                {activo ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
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

export default CuentaBancariaTable;