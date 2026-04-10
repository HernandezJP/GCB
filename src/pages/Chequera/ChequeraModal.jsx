import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, BookOpen, ArrowLeft, CreditCard } from 'lucide-react';

const g = (o, ...ks) => {
    for (const k of ks) {
        const v = o?.[k];
        if (v != null) return v;
    }
    return null;
};

const INICIAL = {
    cuB_Cuenta: '',
    chQ_Serie: '',
    chQ_Numero_Desde: '',
    chQ_Numero_Hasta: '',
    chQ_Fecha_Recepcion: '',
};

const STEPS = ['Cuenta', 'Datos de chequera', 'Confirmar'];

const getCuentaId = (c) =>
    g(c, 'cuB_Cuenta', 'cUB_Cuenta', 'CUB_Cuenta');

const ChequeraModal = ({
    isOpen,
    onClose,
    onSave,
    saving,
    cuentas = [],
}) => {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState(INICIAL);

    useEffect(() => {
        if (!isOpen) return;

        const cuentaUnica =
            cuentas.length === 1
                ? String(getCuentaId(cuentas[0]) ?? '')
                : '';

        setStep(0);
        setForm({
            ...INICIAL,
            cuB_Cuenta: cuentaUnica,
            chQ_Fecha_Recepcion: new Date().toISOString().slice(0, 10),
        });
    }, [isOpen, cuentas]);

    const set = (k) => (e) =>
        setForm((f) => ({
            ...f,
            [k]: e.target.value,
        }));

    const cuentaSelec = useMemo(() => {
        return cuentas.find(c =>
            String(getCuentaId(c)) === String(form.cuB_Cuenta)
        );
    }, [cuentas, form.cuB_Cuenta]);

    const desde = Number(form.chQ_Numero_Desde) || 0;
    const hasta = Number(form.chQ_Numero_Hasta) || 0;
    const totalCheques = desde > 0 && hasta >= desde ? (hasta - desde + 1) : 0;

    const ok0 = !!form.cuB_Cuenta;
    const ok1 =
        !!form.chQ_Serie.trim() &&
        desde > 0 &&
        hasta >= desde &&
        !!form.chQ_Fecha_Recepcion;

    const handleSave = () => {
        if (!ok1) {
            alert('Debes completar correctamente los datos de la chequera.');
            return;
        }

        onSave({
            cuB_Cuenta: Number(form.cuB_Cuenta),
            chQ_Serie: form.chQ_Serie.trim(),
            chQ_Numero_Desde: Number(form.chQ_Numero_Desde),
            chQ_Numero_Hasta: Number(form.chQ_Numero_Hasta),
            chQ_Fecha_Recepcion: form.chQ_Fecha_Recepcion,
        });
    };

    if (!isOpen) return null;

    return createPortal(
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15,23,42,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1100,
                padding: 16
            }}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: 16,
                    width: '100%',
                    maxWidth: 620,
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '20px 24px 16px',
                        borderBottom: '1px solid #f1f5f9',
                        position: 'sticky',
                        top: 0,
                        background: '#fff',
                        zIndex: 1
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                background: '#eff6ff',
                                borderRadius: 9,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <BookOpen size={18} color="#0284c7" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                                Registrar chequera
                            </div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>
                                Paso {step + 1} de {STEPS.length} — {STEPS[step]}
                            </div>
                        </div>
                    </div>

                    <button
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 6,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                        onClick={onClose}
                        disabled={saving}
                    >
                        <X size={17} color="#64748b" />
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', padding: '16px 24px 0' }}>
                    {STEPS.map((s, i) => (
                        <React.Fragment key={step-${i}}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                                <div
                                    style={{
                                        width: 25,
                                        height: 25,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: i < step ? '#15803d' : i === step ? '#0284c7' : '#e2e8f0',
                                        color: i <= step ? '#fff' : '#64748b',
                                        fontSize: 11,
                                        fontWeight: 700
                                    }}
                                >
                                    {i < step ? <Check size={12} /> : i + 1}
                                </div>
                                <span
                                    style={{
                                        fontSize: 9,
                                        fontWeight: 600,
                                        whiteSpace: 'nowrap',
                                        color: i === step ? '#0284c7' : i < step ? '#15803d' : '#94a3b8'
                                    }}
                                >
                                    {s}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div
                                    style={{
                                        flex: 1,
                                        height: 2,
                                        background: i < step ? '#15803d' : '#e2e8f0',
                                        margin: '0 4px 14px'
                                    }}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {step === 0 && (
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                                Cuenta bancaria *
                            </label>
                            <select
                                value={form.cuB_Cuenta}
                                onChange={set('cuB_Cuenta')}
                                disabled={cuentas.length === 1}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1.5px solid #e2e8f0',
                                    borderRadius: 8,
                                    fontSize: 13,
                                    background: cuentas.length === 1 ? '#f1f5f9' : '#f8fafc',
                                    color: '#0f172a',
                                    boxSizing: 'border-box',
                                    fontFamily: 'inherit'
                                }}
                            >
                                <option value="">Seleccionar cuenta...</option>
                                {cuentas.map((c, idx) => {
                                    const id = getCuentaId(c);
                                    const numero = g(c, 'cuB_Numero_Cuenta', 'cUB_Numero_Cuenta', 'CUB_Numero_Cuenta');
                                    const banco = g(c, 'bAN_Nombre', 'ban_nombre', 'BAN_Nombre') ?? '';

                                    return (
                                        <option key={id ?? cuenta-${idx}} value={id ?? ''}>
                                            {banco} — {numero}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    )}

                    {step === 1 && (
                        <>
                            {cuentaSelec && (
                                <div
                                    style={{
                                        background: '#f0f9ff',
                                        border: '1px solid #bae6fd',
                                        borderRadius: 8,
                                        padding: '10px 14px',
                                        fontSize: 12,
                                        color: '#0369a1',
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <CreditCard size={14} />
                                        {g(cuentaSelec, 'bAN_Nombre', 'ban_nombre', 'BAN_Nombre') ?? 'Cuenta'} — {g(cuentaSelec, 'cuB_Numero_Cuenta', 'cUB_Numero_Cuenta', 'CUB_Numero_Cuenta') ?? '—'}
                                    </span>
                                </div>
                            )}

                            <div>
                                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                                    Serie *
                                </label>
                                <input
                                    value={form.chQ_Serie}
                                    onChange={set('chQ_Serie')}
                                    placeholder="Ej. 3405"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1.5px solid #e2e8f0',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        background: '#f8fafc',
                                        color: '#0f172a',
                                        boxSizing: 'border-box',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                                        Número desde *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.chQ_Numero_Desde}
                                        onChange={set('chQ_Numero_Desde')}
                                        placeholder="1"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1.5px solid #e2e8f0',
                                            borderRadius: 8,
                                            fontSize: 13,
                                            background: '#f8fafc',
                                            color: '#0f172a',
                                            boxSizing: 'border-box',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                                        Número hasta *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.chQ_Numero_Hasta}
                                        onChange={set('chQ_Numero_Hasta')}
                                        placeholder="100"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1.5px solid #e2e8f0',
                                            borderRadius: 8,
                                            fontSize: 13,
                                            background: '#f8fafc',
                                            color: '#0f172a',
                                            boxSizing: 'border-box',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                                    Fecha de recepción *
                                </label>
                                <input
                                    type="date"
                                    value={form.chQ_Fecha_Recepcion}
                                    onChange={set('chQ_Fecha_Recepcion')}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1.5px solid #e2e8f0',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        background: '#f8fafc',
                                        color: '#0f172a',
                                        boxSizing: 'border-box',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            {desde > 0 && hasta >= desde && (
                                <div
                                    style={{
                                        background: '#f0fdf4',
                                        border: '1px solid #bbf7d0',
                                        borderRadius: 8,
                                        padding: '10px 14px',
                                        fontSize: 12,
                                        color: '#166534',
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <span>Total de cheques en la chequera:</span>
                                    <strong>{totalCheques}</strong>
                                </div>
                            )}
                        </>
                    )}

                    {step === 2 && (
                        <div
                            style={{
                                background: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: 10,
                                padding: 16
                            }}
                        >
                            <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#0f172a', fontSize: 13 }}>
                                Resumen de la chequera
                            </p>

                            {[
                                ['Cuenta', ${g(cuentaSelec, 'bAN_Nombre', 'ban_nombre', '')} — ${g(cuentaSelec, 'cuB_Numero_Cuenta', 'cUB_Numero_Cuenta', 'CUB_Numero_Cuenta') || '—'}],
                                ['Serie', form.chQ_Serie || '—'],
                                ['Desde', form.chQ_Numero_Desde || '—'],
                                ['Hasta', form.chQ_Numero_Hasta || '—'],
                                ['Total', totalCheques || '—'],
                                ['Fecha recepción', form.chQ_Fecha_Recepcion || '—'],
                            ].map(([k, v], idx) => (
                                <div
                                    key={res-${idx}}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '7px 0',
                                        borderBottom: '1px solid #dcfce7',
                                        fontSize: 13,
                                        gap: 16
                                    }}
                                >
                                    <span style={{ color: '#64748b' }}>{k}</span>
                                    <span style={{ fontWeight: 500, color: '#0f172a', textAlign: 'right', wordBreak: 'break-word' }}>
                                        {v}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 10,
                        padding: '16px 24px',
                        background: '#f8fafc',
                        borderTop: '1px solid #f1f5f9',
                        borderRadius: '0 0 16px 16px',
                        position: 'sticky',
                        bottom: 0
                    }}
                >
                    {step > 0 && (
                        <button
                            onClick={() => setStep(s => s - 1)}
                            disabled={saving}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 7,
                                background: '#fff',
                                color: '#475569',
                                border: '1px solid #e2e8f0',
                                padding: '9px 16px',
                                borderRadius: 8,
                                fontWeight: 600,
                                fontSize: 13,
                                cursor: 'pointer'
                            }}
                        >
                            <ArrowLeft size={14} /> Atrás
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        disabled={saving}
                        style={{
                            background: 'transparent',
                            border: '1px solid #e2e8f0',
                            color: '#64748b',
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: 'pointer',
                            padding: '9px 16px',
                            borderRadius: 8
                        }}
                    >
                        Cancelar
                    </button>

                    {step < 2 ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            disabled={step === 0 ? !ok0 : !ok1}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 7,
                                background: 'linear-gradient(135deg,#0284c7,#0369a1)',
                                color: '#fff',
                                border: 'none',
                                padding: '9px 20px',
                                borderRadius: 8,
                                fontWeight: 600,
                                fontSize: 13,
                                cursor: 'pointer',
                                opacity: step === 0 ? (ok0 ? 1 : 0.5) : ok1 ? 1 : 0.5
                            }}
                        >
                            Siguiente <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 7,
                                background: 'linear-gradient(135deg,#0284c7,#0369a1)',
                                color: '#fff',
                                border: 'none',
                                padding: '9px 20px',
                                borderRadius: 8,
                                fontWeight: 600,
                                fontSize: 13,
                                cursor: 'pointer',
                                opacity: saving ? 0.7 : 1
                            }}
                        >
                            {saving ? 'Registrando...' : <><Check size={14} /> Registrar chequera</>}
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ChequeraModal;