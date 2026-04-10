import React, { useRef } from 'react';
import { ArrowLeft, Printer, Check, Ban, Building2 } from 'lucide-react';

const g = (o, ...ks) => { for (const k of ks) { const v = o?.[k]; if (v != null) return v; } return null; };
const formatFecha = f => f ? new Date(f).toLocaleDateString('es-GT') : '—';

const estadoPill = (e) => {
    const m = { Emitido:'che-pill-blue', Activo:'che-pill-blue', Cancelado:'che-pill-gray', Depositado:'che-pill-green', Cobrado:'che-pill-green' };
    return m[e] ?? 'che-pill-amber';
};

// Convierte monto a letras de forma simple
const toLetras = (n) => {
    if (!n) return '';
    return `${n.toLocaleString('es-GT', { minimumFractionDigits:2 })} quetzales`;
};

const ChequeDetalle = ({ cheque, onBack, onCambiarEstado, estadosCheque }) => {
    const printRef = useRef(null);

    const numCheque = g(cheque,'cHE_Numero_Cheque','chE_Numero_Cheque','CHE_Numero_Cheque') ?? '—';
    const benef     = g(cheque,'beneficiario','Beneficiario') ?? '—';
    const monto     = Math.abs(g(cheque,'mOV_Monto','moV_Monto','MOV_Monto') ?? 0);
    const letras    = g(cheque,'cHE_Monto_Letras','chE_Monto_Letras','CHE_Monto_Letras') || toLetras(monto);
    const concepto  = g(cheque,'cHE_Concepto','chE_Concepto','CHE_Concepto') ?? '';
    const fEmision  = g(cheque,'cHE_Fecha_Emision','chE_Fecha_Emision','CHE_Fecha_Emision');
    const fCobro    = g(cheque,'cHE_Fecha_Cobro','chE_Fecha_Cobro','CHE_Fecha_Cobro');
    const fVenc     = g(cheque,'cHE_Fecha_Vencimiento','chE_Fecha_Vencimiento','CHE_Fecha_Vencimiento');
    const estado    = g(cheque,'estadoCheque','EstadoCheque') ?? g(cheque,'eSC_Descripcion','esC_Descripcion') ?? '';
    const banco     = g(cheque,'bAN_Nombre','ban_nombre','BAN_Nombre') ?? '—';
    const numCuenta = g(cheque,'cUB_Numero_Cuenta','cuB_Numero_Cuenta','CUB_Numero_Cuenta') ?? '';
    const serie     = g(cheque,'cHQ_Serie','chQ_Serie','CHQ_Serie') ?? '';
    const esEmitido = estado === 'Emitido' || estado === 'Activo';

    const handlePrint = () => {
        const win = window.open('', '_blank');
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8"/>
                <title>Cheque ${numCheque}</title>
            </head>
            <body>
                <h1>Cheque ${numCheque}</h1>
            </body>
            </html>`;
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 400);
    };

    return (
        <div>
            <button className="btn-secondary" style={{ marginBottom:16 }} onClick={onBack}>
                <ArrowLeft size={15}/> Volver a cheques
            </button>

            <div className="detalle-card">
                <div className="detalle-header">
                    <div className="detalle-icon" style={{ background:'#1d4ed8' }}>
                        <span style={{ fontFamily:'monospace', fontSize:11, fontWeight:700, color:'#fff' }}>CHQ</span>
                    </div>
                    <div>
                        <h2>Cheque #{numCheque}</h2>
                        <p className="detalle-subtitle">
                            Serie {serie} · {banco}
                            {numCuenta && <> · <code style={{ fontFamily:'monospace', color:'#0284c7', fontWeight:700 }}>{numCuenta}</code></>}
                        </p>
                    </div>
                    <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10 }}>
                        <span className={`che-pill ${estadoPill(estado)}`}>{estado}</span>
                        <button className="btn-print" onClick={handlePrint}>
                            <Printer size={14}/> Imprimir
                        </button>
                    </div>
                </div>

                <div style={{ background:'linear-gradient(135deg,#f0f9ff,#e0f2fe)', borderBottom:'1px solid #bae6fd', padding:'20px 24px', textAlign:'center' }}>
                    <div style={{ fontSize:10, color:'#0369a1', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Monto del cheque</div>
                    <div style={{ fontSize:30, fontWeight:700, color:'#b91c1c', fontFamily:'monospace' }}>
                        Q {monto.toLocaleString('es-GT',{minimumFractionDigits:2})}
                    </div>
                    {letras && <div style={{ fontSize:12, color:'#0369a1', marginTop:6, fontStyle:'italic' }}>{letras}</div>}
                </div>

                <div className="detalle-stats">
                    {[
                        { label:'Beneficiario', val: benef },
                        { label:'Concepto', val: concepto || '—' },
                        { label:'Fecha emisión', val: formatFecha(fEmision) },
                        { label:'Fecha cobro', val: fCobro ? formatFecha(fCobro) : '—' },
                        { label:'Vencimiento', val: fVenc ? formatFecha(fVenc) : '—' },
                    ].map((s,i) => (
                        <div key={i} className="detalle-stat">
                            <div className="detalle-stat-label">{s.label}</div>
                            <div className="detalle-stat-value">{s.val}</div>
                        </div>
                    ))}
                </div>

                {esEmitido && (
                    <div style={{ padding:'0 24px 20px', display:'flex', gap:10, borderTop:'1px solid #f1f5f9', paddingTop:16 }}>
                        {estadosCheque.map(e => {
                            const eid   = g(e,'eSC_Estado_Cheque','esC_Estado_Cheque','ESC_Estado_Cheque');
                            const edesc = g(e,'eSC_Descripcion','esC_Descripcion','ESC_Descripcion') ?? '';
                            const esBaja = edesc.toLowerCase().includes('cancel');
                            return (
                                <button key={eid}
                                    className={esBaja ? 'btn-secondary' : 'btn-primary'}
                                    style={esBaja ? { color:'#b91c1c', borderColor:'#fecaca' } : {}}
                                    onClick={() => onCambiarEstado(eid)}>
                                    {esBaja ? <Ban size={14}/> : <Check size={14}/>}
                                    {edesc}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChequeDetalle;