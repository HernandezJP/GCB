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
                <style>
                    * { box-sizing:border-box; margin:0; padding:0; }
                    body { font-family: Georgia, serif; background: #fff; display:flex; justify-content:center; align-items:center; min-height:100vh; }
                    .cheque { width:600px; border:2px solid #1e293b; border-radius:6px; overflow:hidden; }
                    .hdr { background:#0b1221; padding:10px 18px; display:flex; justify-content:space-between; align-items:center; }
                    .hdr-l { display:flex; align-items:center; gap:10px; }
                    .logo { width:28px; height:28px; background:linear-gradient(135deg,#38bdf8,#818cf8); border-radius:5px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:12px; }
                    .banco-nm { color:#f1f5f9; font-weight:700; font-size:12px; font-family:system-ui; }
                    .banco-cu { color:#64748b; font-size:9px; font-family:system-ui; }
                    .num-box { text-align:right; }
                    .num-lbl { color:#94a3b8; font-size:8px; font-family:system-ui; text-transform:uppercase; }
                    .num-val { color:#38bdf8; font-family:monospace; font-size:17px; font-weight:700; letter-spacing:2px; }
                    .body { padding:16px 20px; background:repeating-linear-gradient(0deg,#fff,#fff 19px,#e8f4fd 20px); }
                    .fecha-row { display:flex; justify-content:flex-end; margin-bottom:12px; font-size:11px; }
                    .fecha-lbl { color:#64748b; margin-right:8px; }
                    .fecha-val { border-bottom:1px solid #334155; min-width:90px; font-family:monospace; font-weight:700; }
                    .pagese { font-size:9px; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px; }
                    .benef-row { border-bottom:2px solid #334155; padding-bottom:4px; display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:12px; }
                    .benef-nm { font-size:14px; font-weight:700; color:#0f172a; font-family:monospace; }
                    .monto-bx { border:1px solid #334155; padding:2px 10px; border-radius:3px; font-family:monospace; font-size:14px; font-weight:700; }
                    .letras { font-size:10px; color:#334155; font-style:italic; border-bottom:1px solid #94a3b8; padding-bottom:3px; margin-bottom:12px; }
                    .concepto-row { font-size:10px; margin-bottom:16px; }
                    .concepto-lbl { color:#64748b; }
                    .concepto-val { border-bottom:1px solid #94a3b8; display:inline-block; min-width:180px; font-family:monospace; }
                    .firmas { display:flex; justify-content:space-between; align-items:flex-end; margin-top:14px; }
                    .firma-box { text-align:center; }
                    .firma-linea { border-top:1px solid #334155; width:150px; margin-bottom:3px; }
                    .firma-lbl { font-size:9px; color:#64748b; text-transform:uppercase; font-family:system-ui; }
                    .micr { background:#1e293b; padding:7px 18px; display:flex; justify-content:space-between; align-items:center; }
                    .micr-txt { font-family:monospace; color:#64748b; font-size:10px; letter-spacing:2px; }
                    .no-neg { color:#475569; font-size:8px; text-transform:uppercase; font-family:system-ui; }
                    @media print { body { margin:0; } }
                </style>
            </head>
            <body>
            <div class="cheque">
                <div class="hdr">
                    <div class="hdr-l">
                        <div class="logo">B</div>
                        <div>
                            <div class="banco-nm">${banco}</div>
                            <div class="banco-cu">${numCuenta}</div>
                        </div>
                    </div>
                    <div class="num-box">
                        <div class="num-lbl">N° CHEQUE</div>
                        <div class="num-val">${numCheque}</div>
                    </div>
                </div>
                <div class="body">
                    <div class="fecha-row">
                        <span class="fecha-lbl">Fecha:</span>
                        <span class="fecha-val">${formatFecha(fEmision)}</span>
                    </div>
                    <div class="pagese">Páguese a la orden de</div>
                    <div class="benef-row">
                        <span class="benef-nm">${benef}</span>
                        <span class="monto-bx">Q ${monto.toLocaleString('es-GT',{minimumFractionDigits:2})}</span>
                    </div>
                    <div class="letras">La suma de: ${letras}</div>
                    <div class="concepto-row">
                        <span class="concepto-lbl">Concepto: </span>
                        <span class="concepto-val">${concepto}</span>
                    </div>
                    <div class="firmas">
                        <div class="firma-box">
                            <div class="firma-linea"></div>
                            <div class="firma-lbl">Autorizado por</div>
                        </div>
                        <div class="firma-box">
                            <div class="firma-linea"></div>
                            <div class="firma-lbl">Firma y sello</div>
                        </div>
                    </div>
                </div>
                <div class="micr">
                    <span class="micr-txt">⑆${(numCuenta || '').replace(/-/g,'')}⑆${numCheque}⑈</span>
                    <span class="no-neg">No negociable</span>
                </div>
            </div>
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
                {/* Header */}
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

                {/* Monto destacado */}
                <div style={{ background:'linear-gradient(135deg,#f0f9ff,#e0f2fe)', borderBottom:'1px solid #bae6fd', padding:'20px 24px', textAlign:'center' }}>
                    <div style={{ fontSize:10, color:'#0369a1', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Monto del cheque</div>
                    <div style={{ fontSize:30, fontWeight:700, color:'#b91c1c', fontFamily:'monospace' }}>
                        Q {monto.toLocaleString('es-GT',{minimumFractionDigits:2})}
                    </div>
                    {letras && <div style={{ fontSize:12, color:'#0369a1', marginTop:6, fontStyle:'italic' }}>{letras}</div>}
                </div>

                {/* Stats */}
                <div className="detalle-stats">
                    {[
                        { label:'Beneficiario',    val: benef },
                        { label:'Concepto',        val: concepto || '—' },
                        { label:'Fecha emisión',   val: formatFecha(fEmision) },
                        { label:'Fecha cobro',     val: fCobro ? formatFecha(fCobro) : '—' },
                        { label:'Vencimiento',     val: fVenc ? formatFecha(fVenc) : '—' },
                    ].map((s,i) => (
                        <div key={i} className="detalle-stat">
                            <div className="detalle-stat-label">{s.label}</div>
                            <div className="detalle-stat-value">{s.val}</div>
                        </div>
                    ))}
                </div>

                {/* Vista del cheque (previa) */}
                <div style={{ padding:'20px 24px', borderTop:'1px solid #f1f5f9' }}>
                    <div style={{ fontSize:11, color:'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:12 }}>
                        Vista previa del cheque físico
                    </div>
                    <div className="cheque-print-wrapper">
                        <div className="cheque-fisico" ref={printRef}>
                            <div className="cheque-header-band">
                                <div className="cheque-banco-info">
                                    <div className="cheque-banco-logo"><Building2 size={14} color="#fff"/></div>
                                    <div>
                                        <div className="cheque-banco-nombre">{banco}</div>
                                        <div className="cheque-banco-cuenta">{numCuenta}</div>
                                    </div>
                                </div>
                                <div className="cheque-num-box">
                                    <div className="cheque-num-label">N° CHEQUE</div>
                                    <div className="cheque-num-value">{numCheque}</div>
                                </div>
                            </div>

                            <div className="cheque-body">
                                <div className="cheque-fecha-row">
                                    <span className="cheque-fecha-lbl">Fecha:</span>
                                    <span className="cheque-fecha-val">{formatFecha(fEmision)}</span>
                                </div>
                                <div className="cheque-pagese">Páguese a la orden de</div>
                                <div className="cheque-beneficiario-row">
                                    <span className="cheque-beneficiario-nombre">{benef}</span>
                                    <span className="cheque-monto-box">Q {monto.toLocaleString('es-GT',{minimumFractionDigits:2})}</span>
                                </div>
                                <div className="cheque-letras-row">La suma de: {letras}</div>
                                <div className="cheque-concepto-row">
                                    <span className="cheque-concepto-lbl">Concepto: </span>
                                    <span className="cheque-concepto-val">{concepto}</span>
                                </div>
                                <div className="cheque-firmas">
                                    <div className="cheque-firma-box">
                                        <div className="cheque-firma-linea"></div>
                                        <div className="cheque-firma-lbl">Autorizado por</div>
                                    </div>
                                    <div className="cheque-firma-box">
                                        <div className="cheque-firma-linea"></div>
                                        <div className="cheque-firma-lbl">Firma y sello</div>
                                    </div>
                                </div>
                            </div>

                            <div className="cheque-micr-band">
                                <span className="cheque-micr">⑆{numCuenta.replace(/-/g,'')}⑆{numCheque}⑈</span>
                                <span className="cheque-no-neg">No negociable</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Acciones de estado */}
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