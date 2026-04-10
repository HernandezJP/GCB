import React from 'react';
import { Eye, Printer, CheckCircle, Ban, XCircle, RotateCcw } from 'lucide-react';

const g = (o, ...ks) => {
    for (const k of ks) {
        const v = o?.[k];
        if (v != null) return v;
    }
    return null;
};

export const getChId = (c) =>
    g(c, 'chE_Cheque', 'cHE_Cheque', 'CHE_Cheque');

export const getChNumero = (c) =>
    g(c, 'chE_Numero_Cheque', 'cHE_Numero_Cheque', 'CHE_Numero_Cheque') ?? '—';

export const getChBenef = (c) =>
    g(c, 'beneficiario', 'Beneficiario') ?? '—';

export const getChMonto = (c) =>
    Math.abs(g(c, 'mOV_Monto', 'moV_Monto', 'MOV_Monto') ?? 0);

export const getChEstado = (c) =>
    g(c, 'estadoCheque', 'EstadoCheque', 'esC_Descripcion', 'eSC_Descripcion', 'ESC_Descripcion') ?? '';

export const getChFecEm = (c) =>
    g(c, 'chE_Fecha_Emision', 'cHE_Fecha_Emision', 'CHE_Fecha_Emision');

export const getChFecCo = (c) =>
    g(c, 'chE_Fecha_Cobro', 'cHE_Fecha_Cobro', 'CHE_Fecha_Cobro');

export const getChSerie = (c) =>
    g(c, 'chQ_Serie', 'cHQ_Serie', 'CHQ_Serie') ?? '';

const getEstadoChequeId = (e) =>
    g(e, 'esC_Estado_Cheque', 'eSC_Estado_Cheque', 'ESC_Estado_Cheque');

const getEstadoChequeDesc = (e) =>
    g(e, 'esC_Descripcion', 'eSC_Descripcion', 'ESC_Descripcion') ?? '';

const estadoPill = (e) => {
    const m = {
        Activo: 'che-pill-blue',
        Pendiente: 'che-pill-amber',
        Cancelado: 'che-pill-gray',
        Depositado: 'che-pill-green',
        Cobrado: 'che-pill-green',
        Rechazado: 'che-pill-red',
        Desactivado: 'che-pill-gray',
    };
    return m[e] ?? 'che-pill-amber';
};

const formatFecha = (f) => (f ? new Date(f).toLocaleDateString('es-GT') : '—');

const ChequeTable = ({ cheques, onVer, onImprimir, onCambiarEstado, estadosCheque }) => {
    if (!cheques?.length) {
        return (
            <div className="che-empty">
                <span>No se encontraron cheques.</span>
            </div>
        );
    }

    const findEstadoId = (descripcion) => {
        const estado = estadosCheque?.find(
            (e) => String(getEstadoChequeDesc(e)).toLowerCase() === descripcion.toLowerCase()
        );
        return getEstadoChequeId(estado);
    };

    const estadoCobradoId = findEstadoId('Cobrado');
    const estadoCanceladoId = findEstadoId('Cancelado');
    const estadoRechazadoId = findEstadoId('Rechazado');
    const estadoActivoId = findEstadoId('Activo');
    const estadoDepositadoId = findEstadoId('Depositado');

    return (
        <div className="che-table-card">
            <div className="che-table-scroll">
                <table className="che-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>N° Cheque</th>
                            <th>Serie</th>
                            <th>Beneficiario</th>
                            <th>Monto</th>
                            <th>Fecha emisión</th>
                            <th>Fecha cobro</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cheques.map((c, i) => {
                            const chequeId = getChId(c);
                            const estado = getChEstado(c);
                            const cancelado = estado === 'Cancelado';

                            return (
                                <tr
                                    key={chequeId ?? `cheque-${i}`}
                                    className={cancelado ? 'row-cancelado' : ''}
                                    onClick={() => onVer?.(c)}
                                >
                                    <td style={{ color: '#cbd5e1', fontSize: 11, fontWeight: 600 }}>
                                        {i + 1}
                                    </td>

                                    <td>
                                        <code className="che-num">{getChNumero(c)}</code>
                                    </td>

                                    <td style={{ fontWeight: 700, color: '#0284c7' }}>
                                        Serie {getChSerie(c)}
                                    </td>

                                    <td
                                        style={{
                                            fontWeight: 500,
                                            maxWidth: 140,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {getChBenef(c)}
                                    </td>

                                    <td
                                        style={{
                                            fontWeight: 600,
                                            color: '#b91c1c',
                                            fontFamily: 'monospace',
                                            fontSize: 12,
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        Q {getChMonto(c).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                    </td>

                                    <td style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                                        {formatFecha(getChFecEm(c))}
                                    </td>

                                    <td style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                                        {getChFecCo(c) ? formatFecha(getChFecCo(c)) : '—'}
                                    </td>

                                    <td>
                                        <span className={`che-pill ${estadoPill(estado)}`}>{estado}</span>
                                    </td>

                                    <td onClick={(e) => e.stopPropagation()}>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                                            <button
                                                className="che-icon-btn view"
                                                title="Ver detalle"
                                                onClick={() => onVer?.(c)}
                                            >
                                                <Eye size={15} color="#0284c7" />
                                            </button>

                                            <button
                                                className="che-icon-btn print"
                                                title="Imprimir"
                                                onClick={() => onImprimir?.(c)}
                                            >
                                                <Printer size={15} color="#7c3aed" />
                                            </button>

                                            {(estado === 'Activo' || estado === 'Pendiente') && estadoCobradoId && (
                                                <button
                                                    className="che-icon-btn cobrar"
                                                    title="Cobrado"
                                                    onClick={() => onCambiarEstado?.(chequeId, estadoCobradoId)}
                                                >
                                                    <CheckCircle size={15} color="#15803d" />
                                                </button>
                                            )}

                                            {(estado === 'Activo' || estado === 'Pendiente') && estadoCanceladoId && (
                                                <button
                                                    className="che-icon-btn anular"
                                                    title="Cancelado"
                                                    onClick={() => onCambiarEstado?.(chequeId, estadoCanceladoId)}
                                                >
                                                    <Ban size={15} color="#b91c1c" />
                                                </button>
                                            )}

                                            {(estado === 'Activo' || estado === 'Pendiente') && estadoRechazadoId && (
                                                <button
                                                    className="che-icon-btn rechazar"
                                                    title="Rechazado"
                                                    onClick={() => onCambiarEstado?.(chequeId, estadoRechazadoId)}
                                                >
                                                    <XCircle size={15} color="#dc2626" />
                                                </button>
                                            )}

                                            {estado === 'Depositado' && estadoCobradoId && (
                                                <button
                                                    className="che-icon-btn cobrar"
                                                    title="Cobrado"
                                                    onClick={() => onCambiarEstado?.(chequeId, estadoCobradoId)}
                                                >
                                                    <CheckCircle size={15} color="#15803d" />
                                                </button>
                                            )}

                                            {estado === 'Rechazado' && estadoActivoId && (
                                                <button
                                                    className="che-icon-btn reactivar"
                                                    title="Activo"
                                                    onClick={() => onCambiarEstado?.(chequeId, estadoActivoId)}
                                                >
                                                    <RotateCcw size={15} color="#2563eb" />
                                                </button>
                                            )}

                                            {estado === 'Rechazado' && estadoCanceladoId && (
                                                <button
                                                    className="che-icon-btn anular"
                                                    title="Cancelado"
                                                    onClick={() => onCambiarEstado?.(chequeId, estadoCanceladoId)}
                                                >
                                                    <Ban size={15} color="#b91c1c" />
                                                </button>
                                            )}

                                            {(estado === 'Cobrado' || estado === 'Cancelado' || estado === 'Desactivado') && (
                                                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                                                    Sin acciones
                                                </span>
                                            )}
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

export default ChequeTable;