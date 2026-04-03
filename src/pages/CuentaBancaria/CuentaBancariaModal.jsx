import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CreditCard, Check, ArrowLeft, ChevronRight } from 'lucide-react';

// ── Helpers cuenta bancaria ───────────────────────────────────────
export const getId        = (c) => c?.cUB_Cuenta          ?? c?.cuB_Cuenta         ?? c?.cub_cuenta;
export const getBanco     = (c) => c?.bAN_Banco            ?? c?.baN_Banco          ?? c?.ban_banco;
export const getBancoNombre=(c) => c?.bAN_Nombre           ?? c?.baN_Nombre         ?? c?.ban_nombre         ?? '';
export const getNumero    = (c) => c?.cUB_Numero_Cuenta    ?? c?.cuB_Numero_Cuenta  ?? c?.cub_numero_cuenta  ?? '';
export const getNombre    = (c) => c?.cUB_Primer_Nombre    ?? c?.cuB_Primer_Nombre  ?? c?.cub_primer_nombre  ?? '';
export const getApellido  = (c) => c?.cUB_Primer_Apellido  ?? c?.cuB_Primer_Apellido?? c?.cub_primer_apellido?? '';
export const getTipoCuenta= (c) => c?.tCU_Descripcion      ?? c?.tcU_Descripcion    ?? c?.tcu_descripcion    ?? '';
export const getMoneda    = (c) => c?.tMO_Descripcion      ?? c?.tmO_Descripcion    ?? c?.tmo_descripcion    ?? '';
export const getSimbolo   = (c) => c?.tMO_Simbolo          ?? c?.tmO_Simbolo        ?? c?.tmo_simbolo        ?? 'Q';
export const getSaldoInicial=(c)=> c?.cUB_Saldo_Inicial    ?? c?.cuB_Saldo_Inicial  ?? c?.cub_saldo_inicial  ?? 0;
export const getSaldoActual= (c)=> c?.cUB_Saldo_Actual     ?? c?.cuB_Saldo_Actual   ?? c?.cub_saldo_actual   ?? 0;
export const getEstadoDesc= (c) => c?.eSC_Descripcion      ?? c?.esC_Descripcion    ?? c?.esc_descripcion    ?? '';
export const getCubEstado = (c) => c?.cUB_Estado           ?? c?.cuB_Estado         ?? c?.cub_estado         ?? 'A';
export const isActivo     = (c) => getCubEstado(c) === 'A';

// ── Helpers catálogos con claves EXACTAS de la API ────────────────
// bancos:        { baN_Banco, baN_Nombre }
// tiposCuenta:   { tcU_Tipo_Cuenta, tcU_Descripcion }
// tiposMoneda:   { tmO_Tipo_Moneda, tmO_Descripcion, tmO_Simbolo }
// estadosCuenta: { esC_Estado_Cuenta, esC_Descripcion }

const getBancoId    = (b) => b?.baN_Banco        ?? b?.bAN_Banco        ?? b?.ban_banco;
const getBancoNom   = (b) => b?.baN_Nombre       ?? b?.bAN_Nombre       ?? b?.ban_nombre       ?? '';

const getTCUId      = (t) => t?.tcU_Tipo_Cuenta  ?? t?.tCU_Tipo_Cuenta  ?? t?.tcu_tipo_cuenta;
const getTCUDesc    = (t) => t?.tcU_Descripcion  ?? t?.tCU_Descripcion  ?? t?.tcu_descripcion  ?? '';

const getTMOId      = (m) => m?.tmO_Tipo_Moneda  ?? m?.tMO_Tipo_Moneda  ?? m?.tmo_tipo_moneda;
const getTMODesc    = (m) => m?.tmO_Descripcion  ?? m?.tMO_Descripcion  ?? m?.tmo_descripcion  ?? '';
const getTMOSimbolo = (m) => m?.tmO_Simbolo      ?? m?.tMO_Simbolo      ?? m?.tmo_simbolo      ?? 'Q';

const getESCId      = (e) => e?.esC_Estado_Cuenta?? e?.eSC_Estado_Cuenta?? e?.esc_estado_cuenta;
const getESCDesc    = (e) => e?.esC_Descripcion  ?? e?.eSC_Descripcion  ?? e?.esc_descripcion  ?? '';

// ─────────────────────────────────────────────────────────────────
const INITIAL = {
    BAN_Banco:            '',
    CUB_Numero_Cuenta:    '',
    CUB_Primer_Nombre:    '',
    CUB_Segundo_Nombre:   '',
    CUB_Primer_Apellido:  '',
    CUB_Segundo_Apellido: '',
    TCU_Tipo_Cuenta:      '',
    TMO_Tipo_Moneda:      '',
    CUB_Saldo_Inicial:    '',
    ESC_Estado_Cuenta:    '',
};

const STEPS = ['Datos bancarios', 'Titular y saldo', 'Confirmar'];

const CuentaBancariaModal = ({
    isOpen, onClose, onSave, cuentaToEdit,
    bancos = [], tiposCuenta = [], tiposMoneda = [], estadosCuenta = []
}) => {
    const [step,   setStep]   = useState(0);
    const [form,   setForm]   = useState(INITIAL);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (cuentaToEdit) {
                setForm({
                    BAN_Banco:            String(getBanco(cuentaToEdit)    ?? ''),
                    CUB_Numero_Cuenta:    getNumero(cuentaToEdit),
                    CUB_Primer_Nombre:    getNombre(cuentaToEdit),
                    CUB_Segundo_Nombre:   cuentaToEdit?.cUB_Segundo_Nombre ?? cuentaToEdit?.cuB_Segundo_Nombre ?? '',
                    CUB_Primer_Apellido:  getApellido(cuentaToEdit),
                    CUB_Segundo_Apellido: cuentaToEdit?.cUB_Segundo_Apellido ?? cuentaToEdit?.cuB_Segundo_Apellido ?? '',
                    TCU_Tipo_Cuenta:      String(cuentaToEdit?.tCU_Tipo_Cuenta ?? cuentaToEdit?.tcU_Tipo_Cuenta ?? cuentaToEdit?.tcu_tipo_cuenta ?? ''),
                    TMO_Tipo_Moneda:      String(cuentaToEdit?.tMO_Tipo_Moneda ?? cuentaToEdit?.tmO_Tipo_Moneda ?? cuentaToEdit?.tmo_tipo_moneda ?? ''),
                    CUB_Saldo_Inicial:    getSaldoInicial(cuentaToEdit),
                    ESC_Estado_Cuenta:    String(cuentaToEdit?.eSC_Estado_Cuenta ?? cuentaToEdit?.esC_Estado_Cuenta ?? cuentaToEdit?.esc_estado_cuenta ?? ''),
                });
            } else {
                setForm(INITIAL);
            }
            setStep(0);
        }
    }, [isOpen, cuentaToEdit]);

    if (!isOpen) return null;

    const setText = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

    // ── Validaciones ─────────────────────────────────────────────
    const ok0 =
        form.BAN_Banco.trim()        !== '' &&
        form.CUB_Numero_Cuenta.trim()!== '' &&
        form.TCU_Tipo_Cuenta.trim()  !== '' &&
        form.TMO_Tipo_Moneda.trim()  !== '';

    const ok1 =
        form.CUB_Primer_Nombre.trim()   !== '' &&
        form.CUB_Primer_Apellido.trim() !== '' &&
        form.CUB_Saldo_Inicial          !== '' &&
        form.ESC_Estado_Cuenta.trim()   !== '';

    // ── Lookups para el resumen ───────────────────────────────────
    const bancoSel   = bancos.find(b        => String(getBancoId(b)) === form.BAN_Banco);
    const tipoCueSel = tiposCuenta.find(t   => String(getTCUId(t))   === form.TCU_Tipo_Cuenta);
    const tipoMonSel = tiposMoneda.find(m   => String(getTMOId(m))   === form.TMO_Tipo_Moneda);
    const estadoSel  = estadosCuenta.find(e => String(getESCId(e))   === form.ESC_Estado_Cuenta);
    const simbolo    = getTMOSimbolo(tipoMonSel);

    // ── Submit: convierte a Number para la BD ─────────────────────
    const handleSubmit = async () => {
        setSaving(true);
        try {
            await onSave({
                ...form,
                BAN_Banco:         Number(form.BAN_Banco),
                TCU_Tipo_Cuenta:   Number(form.TCU_Tipo_Cuenta),
                TMO_Tipo_Moneda:   Number(form.TMO_Tipo_Moneda),
                CUB_Saldo_Inicial: Number(form.CUB_Saldo_Inicial),
                ESC_Estado_Cuenta: Number(form.ESC_Estado_Cuenta),
            });
        } finally {
            setSaving(false);
        }
    };

    const StepDot = ({ idx }) => {
        const done   = idx < step;
        const active = idx === step;
        return (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                <div className={`step-dot ${done?'done':active?'active':'idle'}`}>
                    {done ? <Check size={13}/> : idx+1}
                </div>
                <span className="step-label" style={{ color: active?'#0284c7':done?'#15803d':'#64748b' }}>
                    {STEPS[idx]}
                </span>
            </div>
        );
    };

    return createPortal(
        <div className="modal-backdrop">
            <div className="modal-card">
                <div className="modal-header">
                    <div className="modal-title-group">
                        <div className="modal-icon"><CreditCard size={20}/></div>
                        <div>
                            <h2>{cuentaToEdit ? 'Editar cuenta' : 'Nueva cuenta bancaria'}</h2>
                            <p>Paso {step+1} de {STEPS.length}</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose} disabled={saving}><X size={18}/></button>
                </div>

                <div className="modal-body">
                    <div className="stepper">
                        {STEPS.map((_,i) => (
                            <React.Fragment key={i}>
                                <StepDot idx={i}/>
                                {i < STEPS.length-1 && (
                                    <div className="step-line" style={{ background: i<step?'#15803d':'#e2e8f0' }}/>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* ── PASO 0 ── */}
                    {step === 0 && (
                        <>
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Banco *</label>
                                    <select value={form.BAN_Banco} onChange={setText('BAN_Banco')} disabled={saving}>
                                        <option value="">Seleccionar banco...</option>
                                        {bancos.map(b => (
                                            <option key={getBancoId(b)} value={String(getBancoId(b))}>
                                                {getBancoNom(b)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Número de cuenta *</label>
                                    <input
                                        value={form.CUB_Numero_Cuenta}
                                        onChange={setText('CUB_Numero_Cuenta')}
                                        placeholder="Ej. 041-001234-5"
                                        disabled={saving || !!cuentaToEdit}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Tipo de cuenta *</label>
                                    <select
                                        value={form.TCU_Tipo_Cuenta}
                                        onChange={setText('TCU_Tipo_Cuenta')}
                                        disabled={saving || !!cuentaToEdit}
                                    >
                                        <option value="">Seleccionar tipo...</option>
                                        {tiposCuenta.map(t => (
                                            <option key={getTCUId(t)} value={String(getTCUId(t))}>
                                                {getTCUDesc(t)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Moneda *</label>
                                    <select
                                        value={form.TMO_Tipo_Moneda}
                                        onChange={setText('TMO_Tipo_Moneda')}
                                        disabled={saving || !!cuentaToEdit}
                                    >
                                        <option value="">Seleccionar moneda...</option>
                                        {tiposMoneda.map(m => (
                                            <option key={getTMOId(m)} value={String(getTMOId(m))}>
                                                {getTMOSimbolo(m)} — {getTMODesc(m)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── PASO 1 ── */}
                    {step === 1 && (
                        <>
                            <div style={{ background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#0369a1', marginBottom:15 }}>
                                <strong>{getBancoNom(bancoSel)}</strong>
                                {' · '}{getTCUDesc(tipoCueSel)}
                                {' · '}<code style={{ fontFamily:'monospace' }}>{form.CUB_Numero_Cuenta}</code>
                            </div>
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Primer nombre *</label>
                                    <input value={form.CUB_Primer_Nombre} onChange={setText('CUB_Primer_Nombre')} placeholder="Nombre" disabled={saving}/>
                                </div>
                                <div className="input-group">
                                    <label>Segundo nombre</label>
                                    <input value={form.CUB_Segundo_Nombre} onChange={setText('CUB_Segundo_Nombre')} placeholder="Segundo nombre" disabled={saving}/>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Primer apellido *</label>
                                    <input value={form.CUB_Primer_Apellido} onChange={setText('CUB_Primer_Apellido')} placeholder="Apellido" disabled={saving}/>
                                </div>
                                <div className="input-group">
                                    <label>Segundo apellido</label>
                                    <input value={form.CUB_Segundo_Apellido} onChange={setText('CUB_Segundo_Apellido')} placeholder="Segundo apellido" disabled={saving}/>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Saldo inicial *</label>
                                    <div style={{ position:'relative' }}>
                                        <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#0284c7', fontWeight:700, fontSize:13 }}>
                                            {simbolo}
                                        </span>
                                        <input
                                            value={form.CUB_Saldo_Inicial}
                                            onChange={setText('CUB_Saldo_Inicial')}
                                            placeholder="0.00"
                                            type="number"
                                            step="0.01"
                                            style={{ paddingLeft:28 }}
                                            disabled={saving || !!cuentaToEdit}
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Estado de cuenta *</label>
                                    <select value={form.ESC_Estado_Cuenta} onChange={setText('ESC_Estado_Cuenta')} disabled={saving}>
                                        <option value="">Seleccionar estado...</option>
                                        {estadosCuenta.map(e => (
                                            <option key={getESCId(e)} value={String(getESCId(e))}>
                                                {getESCDesc(e)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── PASO 2: Resumen ── */}
                    {step === 2 && (
                        <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:16 }}>
                            <p style={{ margin:'0 0 12px', fontWeight:600, color:'#0f172a', fontSize:13 }}>Resumen de la cuenta</p>
                            {[
                                ['Banco',          getBancoNom(bancoSel)],
                                ['Número',         form.CUB_Numero_Cuenta],
                                ['Tipo de cuenta', getTCUDesc(tipoCueSel)],
                                ['Moneda',         `${simbolo} — ${getTMODesc(tipoMonSel)}`],
                                ['Titular',        `${form.CUB_Primer_Nombre} ${form.CUB_Primer_Apellido}`],
                                ['Saldo inicial',  `${simbolo} ${parseFloat(form.CUB_Saldo_Inicial||0).toLocaleString('es-GT',{minimumFractionDigits:2})}`],
                                ['Estado',         getESCDesc(estadoSel)],
                            ].map(([k,v]) => (
                                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #dcfce7', fontSize:13 }}>
                                    <span style={{ color:'#64748b' }}>{k}</span>
                                    <span style={{ fontWeight:500, color:'#0f172a' }}>{v}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {step > 0 && (
                        <button className="btn-secondary" onClick={() => setStep(s => s-1)} disabled={saving}>
                            <ArrowLeft size={14}/> Atrás
                        </button>
                    )}
                    <button className="btn-cancel" onClick={onClose} disabled={saving}>Cancelar</button>
                    {step < 2
                        ? <button
                            className="btn-save"
                            style={{ opacity: (step===0 ? ok0 : ok1) ? 1 : 0.5 }}
                            onClick={() => { if (step===0 ? ok0 : ok1) setStep(s => s+1); }}
                            disabled={saving || (step===0 ? !ok0 : !ok1)}
                          >
                            Siguiente <ChevronRight size={14}/>
                          </button>
                        : <button className="btn-save" onClick={handleSubmit} disabled={saving}>
                            {saving ? 'Guardando...' : (
                                <><Check size={14}/> {cuentaToEdit ? 'Guardar cambios' : 'Crear cuenta'}</>
                            )}
                          </button>
                    }
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CuentaBancariaModal;