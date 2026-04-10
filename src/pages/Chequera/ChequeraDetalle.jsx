import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, FileText, AlertCircle, Loader } from 'lucide-react';
import { getChequesPorCuenta } from '../../services/ChequeService';
import { getQId, getQSerie, getQDesde, getQHasta, getQUsados, getQEstado, getQFecRec } from './ChequeraTable';

const g = (o, ...ks) => {
    for (const k of ks) {
        const v = o?.[k];
        if (v != null) return v;
    }
    return null;
};

const formatFecha = f => (f ? new Date(f).toLocaleDateString('es-GT') : '—');

const estadoCheqPill = (e) => {
    const m = {
        Emitido: 'chq-pill-blue',
        Cancelado: 'chq-pill-gray',
        Depositado: 'chq-pill-green',
        Activo: 'chq-pill-green',
        Cobrado: 'chq-pill-green',
        Rechazado: 'chq-pill-red',
        Pendiente: 'chq-pill-amber',
    };
    return m[e] ?? 'chq-pill-amber';
};

const ChequeraDetalle = ({ chequera, onBack }) => {
    const [cheques, setCheques] = useState([]);
    const [loading, setLoading] = useState(true);

    const cuentaId = g(chequera, 'cUB_Cuenta', 'cuB_Cuenta', 'CUB_Cuenta');
    const serie = getQSerie(chequera);
    const desde = Number(getQDesde(chequera) ?? 0);
    const hasta = Number(getQHasta(chequera) ?? 0);
    const usados = Number(getQUsados(chequera) ?? 0);
    const total = hasta >= desde ? (hasta - desde + 1) : 0;
    const disp = Math.max(0, total - usados);
    const pct = total > 0 ? Math.min(100, Math.round((usados / total) * 100)) : 0;
    const estado = getQEstado(chequera);
    const banco = g(chequera, 'bAN_Nombre', 'ban_nombre', 'BAN_Nombre') ?? '—';
    const numCuenta = g(chequera, 'cUB_Numero_Cuenta', 'cuB_Numero_Cuenta', 'CUB_Numero_Cuenta') ?? '';

    useEffect(() => {
        if (!cuentaId) {
            setCheques([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        getChequesPorCuenta(cuentaId)
            .then(data => {
                const qId = getQId(chequera);
                const filtrados = (data ?? []).filter(c =>
                    String(g(c, 'cHQ_Chequera', 'chQ_Chequera', 'CHQ_Chequera')) === String(qId)
                );
                setCheques(filtrados);
            })
            .catch(() => setCheques([]))
            .finally(() => setLoading(false));
    }, [cuentaId, chequera]);

    return (
        <div>
            <button className="btn-secondary" style={{ marginBottom: 16 }} onClick={onBack}>
                <ArrowLeft size={15} /> Volver a chequeras
            </button>

            <div className="detalle-card">
                <div className="detalle-header">
                    <div className="detalle-icon" style={{ background: '#0284c7' }}>
                        <BookOpen size={24} color="#fff" />
                    </div>

                    <div>
                        <h2>Chequera Serie {serie}</h2>
                        <p className="detalle-subtitle">
                            {banco}
                            {numCuenta && (
                                <>
                                    {' '}·{' '}
                                    <code style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>
                                        {numCuenta}
                                    </code>
                                </>
                            )}
                        </p>
                    </div>

                    <div className="detalle-status" style={{ marginLeft: 'auto' }}>
                        <span className={`chq-pill ${estado === 'A' || estado === 'Activa' ? 'chq-pill-green' : 'chq-pill-gray'}`}>
                            {estado === 'A' ? 'Activa' : estado === 'I' ? 'Inactiva' : estado}
                        </span>
                    </div>
                </div>

                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                        <span style={{ color: '#64748b' }}>Uso de la chequera</span>
                        <span style={{ fontWeight: 600 }}>
                            {usados} usados de {total} ({pct}%)
                        </span>
                    </div>

                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                        <div
                            style={{
                                height: '100%',
                                width: `${pct}%`,
                                background: pct >= 80 ? '#b91c1c' : pct >= 50 ? '#92400e' : '#15803d',
                                borderRadius: 4,
                                transition: 'width 0.4s',
                            }}
                        />
                    </div>
                </div>

                <div className="detalle-stats">
                    {[
                        {
                            label: 'Rango',
                            val: (
                                <code className="chq-num">
                                    {String(desde).padStart(5, '0')} — {String(hasta).padStart(5, '0')}
                                </code>
                            )
                        },
                        { label: 'Total cheques', val: total },
                        { label: 'Usados', val: usados },
                        {
                            label: 'Disponibles',
                            val: (
                                <span style={{ fontWeight: 700, color: disp === 0 ? '#b91c1c' : disp < 5 ? '#92400e' : '#15803d' }}>
                                    {disp}
                                </span>
                            )
                        },
                        { label: 'Recepción', val: formatFecha(getQFecRec(chequera)) },
                    ].map((s, i) => (
                        <div key={i} className="detalle-stat">
                            <div className="detalle-stat-label">{s.label}</div>
                            <div className="detalle-stat-value">{s.val}</div>
                        </div>
                    ))}
                </div>

                {disp === 0 && (
                    <div
                        style={{
                            margin: '0 20px 16px',
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            borderRadius: 8,
                            padding: '10px 14px',
                            fontSize: 12,
                            color: '#92400e',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}
                    >
                        <AlertCircle size={14} />
                        Esta chequera está agotada. Registra una nueva para seguir emitiendo cheques.
                    </div>
                )}

                <div style={{ borderTop: '1px solid #e2e8f0' }}>
                    <div
                        style={{
                            padding: '14px 20px',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 7 }}>
                            <FileText size={15} color="#0284c7" /> Cheques emitidos con esta chequera
                        </span>
                        <span style={{ fontSize: 12, color: '#64748b' }}>{cheques.length} cheques</span>
                    </div>

                    {loading ? (
                        <div className="chq-loading">
                            <Loader size={18} color="#0284c7" />
                            <span>Cargando cheques...</span>
                        </div>
                    ) : cheques.length === 0 ? (
                        <div className="chq-empty">
                            <FileText size={28} color="#e2e8f0" />
                            <span>No hay cheques emitidos con esta chequera.</span>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="chq-table">
                                <thead>
                                    <tr>
                                        <th>N° Cheque</th>
                                        <th>Beneficiario</th>
                                        <th>Monto</th>
                                        <th>Fecha emisión</th>
                                        <th>Fecha cobro</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cheques.map((c, i) => {
                                        const est = g(c, 'estadoCheque', 'EstadoCheque', 'ESC_Descripcion', 'eSC_Descripcion', 'esC_Descripcion') ?? '';
                                        const monto = Math.abs(Number(g(c, 'mOV_Monto', 'moV_Monto', 'MOV_Monto') ?? 0));
                                        const numCh = g(c, 'cHE_Numero_Cheque', 'chE_Numero_Cheque', 'CHE_Numero_Cheque') ?? '—';
                                        const benef = g(c, 'beneficiario', 'Beneficiario') ?? '—';
                                        const fEmis = g(c, 'cHE_Fecha_Emision', 'chE_Fecha_Emision', 'CHE_Fecha_Emision');
                                        const fCobro = g(c, 'cHE_Fecha_Cobro', 'chE_Fecha_Cobro', 'CHE_Fecha_Cobro');

                                        return (
                                            <tr key={i}>
                                                <td>
                                                    <code className="chq-num">{numCh}</code>
                                                </td>
                                                <td style={{ fontWeight: 500 }}>{benef}</td>
                                                <td style={{ fontWeight: 600, color: '#b91c1c', fontFamily: 'monospace', fontSize: 12 }}>
                                                    Q {monto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td style={{ fontSize: 12, color: '#64748b' }}>{formatFecha(fEmis)}</td>
                                                <td style={{ fontSize: 12, color: '#64748b' }}>{fCobro ? formatFecha(fCobro) : '—'}</td>
                                                <td>
                                                    <span className={`chq-pill ${estadoCheqPill(est)}`}>
                                                        {est || '—'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChequeraDetalle;