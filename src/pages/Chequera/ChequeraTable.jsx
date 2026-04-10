import React from 'react';
import { Eye, ToggleRight, ToggleLeft } from 'lucide-react';

// helpers casing
const g = (o, ...ks) => {
    for (const k of ks) {
        const v = o?.[k];
        if (v != null) return v;
    }
    return null;
};

export const getQId = q => g(q, 'cHQ_Chequera', 'chQ_Chequera', 'CHQ_Chequera');
export const getQCuenta = q => g(q, 'cUB_Cuenta', 'cuB_Cuenta', 'CUB_Cuenta') ?? 0;
export const getQSerie = q => g(q, 'cHQ_Serie', 'chQ_Serie', 'CHQ_Serie') ?? '';
export const getQDesde = q => g(q, 'cHQ_Numero_Desde', 'chQ_Numero_Desde', 'CHQ_Numero_Desde') ?? 0;
export const getQHasta = q => g(q, 'cHQ_Numero_Hasta', 'chQ_Numero_Hasta', 'CHQ_Numero_Hasta') ?? 0;
export const getQUsados = q => g(q, 'cHQ_Ultimo_Usado', 'chQ_Ultimo_Usado', 'CHQ_Ultimo_Usado') ?? 0;
export const getQEstado = q => g(q, 'cHQ_Estado', 'chQ_Estado', 'CHQ_Estado') ?? '';
export const getQFecRec = q => g(q, 'cHQ_Fecha_Recepcion', 'chQ_Fecha_Recepcion', 'CHQ_Fecha_Recepcion');

const estadoPill = (estado) => {
    const m = {
        A: 'chq-pill-green',
        I: 'chq-pill-red',
        Activa: 'chq-pill-green',
        Agotada: 'chq-pill-red',
        Pendiente: 'chq-pill-amber',
        Anulada: 'chq-pill-gray'
    };
    return m[estado] ?? 'chq-pill-gray';
};

const estadoLabel = (e) => {
    const m = {
        A: 'Activa',
        I: 'Inactiva',
        Activa: 'Activa',
        Agotada: 'Agotada',
        Pendiente: 'Pendiente',
        Anulada: 'Anulada'
    };
    return m[e] ?? e;
};

const formatFecha = f => (f ? new Date(f).toLocaleDateString('es-GT') : '—');

const ChequeraTable = ({ chequeras, onVer, onToggle }) => {
    if (!chequeras?.length) {
        return (
            <div className="chq-empty">
                <span>No se encontraron chequeras.</span>
            </div>
        );
    }

    return (
        <div className="chq-table-card">
            <div className="chq-table-scroll">
                <table className="chq-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Cuenta</th>
                            <th>Serie</th>
                            <th>Rango</th>
                            <th>Uso</th>
                            <th>Disponibles</th>
                            <th>Estado</th>
                            <th>Recepción</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chequeras.map((q, i) => {
                            const total = getQHasta(q) - getQDesde(q) + 1;
                            const usados = getQUsados(q);
                            const disp = total - usados;
                            const pct = total > 0 ? Math.min(100, Math.round((usados / total) * 100)) : 0;
                            const estado = getQEstado(q);
                            const activo = estado === 'A' || estado === 'Activa';
                            const barColor = pct >= 80 ? '#b91c1c' : pct >= 50 ? '#92400e' : '#15803d';

                            return (
                                <tr
                                    key={getQId(q) ?? i}
                                    className={!activo ? 'row-inactiva' : ''}
                                    onClick={() => onVer?.(q)}
                                >
                                    <td style={{ color: '#cbd5e1', fontSize: 11, fontWeight: 600 }}>
                                        {i + 1}
                                    </td>

                                    <td>
                                        <code
                                            style={{
                                                fontFamily: 'monospace',
                                                background: '#f1f5f9',
                                                padding: '2px 7px',
                                                borderRadius: 4,
                                                fontSize: 12
                                            }}
                                        >
                                            {g(q, 'cUB_Numero_Cuenta', 'cuB_Numero_Cuenta', 'CUB_Numero_Cuenta') ?? `Cuenta #${getQCuenta(q)}`}
                                        </code>
                                    </td>

                                    <td>
                                        <span style={{ fontWeight: 700, fontSize: 17, color: '#0284c7' }}>
                                            {getQSerie(q)}
                                        </span>
                                    </td>

                                    <td>
                                        <code className="chq-num" style={{ fontSize: 11 }}>
                                            {String(getQDesde(q)).padStart(5, '0')} — {String(getQHasta(q)).padStart(5, '0')}
                                        </code>
                                    </td>

                                    <td>
                                        <div className="chq-bar-wrap">
                                            <div className="chq-bar">
                                                <div
                                                    className="chq-bar-fill"
                                                    style={{ width: `${pct}%`, background: barColor }}
                                                />
                                            </div>
                                            <span style={{ fontSize: 12, color: '#64748b' }}>
                                                {usados}/{total}
                                            </span>
                                        </div>
                                    </td>

                                    <td>
                                        <span
                                            style={{
                                                fontWeight: 600,
                                                color: disp === 0 ? '#b91c1c' : disp < 5 ? '#92400e' : '#15803d'
                                            }}
                                        >
                                            {disp}
                                        </span>
                                    </td>

                                    <td>
                                        <span className={`chq-pill ${estadoPill(estado)}`}>
                                            {estadoLabel(estado)}
                                        </span>
                                    </td>

                                    <td style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                                        {formatFecha(getQFecRec(q))}
                                    </td>

                                    <td onClick={e => e.stopPropagation()}>
                                        <div className="chq-action-btns">
                                            <button
                                                className="chq-icon-btn view"
                                                title="Ver detalle"
                                                onClick={() => onVer?.(q)}
                                            >
                                                <Eye size={15} color="#0284c7" />
                                            </button>

                                            <button
                                                className={`chq-icon-btn ${activo ? 'danger' : 'success'}`}
                                                title={activo ? 'Desactivar' : 'Reactivar'}
                                                onClick={() => onToggle?.(getQId(q), activo)}
                                            >
                                                {activo
                                                    ? <ToggleRight size={18} color="#15803d" />
                                                    : <ToggleLeft size={18} color="#b91c1c" />
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

export default ChequeraTable;