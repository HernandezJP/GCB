import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, FileText, ArrowLeft, Search, User } from 'lucide-react';

const g = (o, ...ks) => {
    for (const k of ks) {
        const v = o?.[k];
        if (v != null) return v;
    }
    return null;
};

const INICIAL = {
    CUB_Cuenta: '',
    CHQ_Chequera: '',
    PER_Persona: '',
    ESC_Estado_Cheque: '',
    CHE_Numero_Cheque: '',
    CHE_Monto_Letras: '',
    CHE_Fecha_Emision: '',
    CHE_Fecha_Vencimiento: '',
    CHE_Concepto: '',
    MOV_Numero_Referencia: '',
    MOV_Descripcion: '',
    MOV_Monto: '',
};

const STEPS = ['Cuenta y chequera', 'Beneficiario y monto', 'Confirmar'];

const getPersonaId = (p) =>
    g(p, 'peR_Persona', 'pER_Persona', 'per_persona', 'PER_Persona');

const getPersonaNombre = (p) => {
    const nombreCompleto =
        g(
            p,
            'peR_Nombre_Completo',
            'pER_Nombre_Completo',
            'PER_Nombre_Completo',
            'nombreCompleto',
            'NombreCompleto'
        ) ?? '';

    if (nombreCompleto && String(nombreCompleto).trim().toLowerCase() !== 'string') {
        return String(nombreCompleto).trim();
    }

    return [
        g(p, 'peR_Primer_Nombre', 'pER_Primer_Nombre', 'PER_Primer_Nombre'),
        g(p, 'peR_Segundo_Nombre', 'pER_Segundo_Nombre', 'PER_Segundo_Nombre'),
        g(p, 'peR_Primer_Apellido', 'pER_Primer_Apellido', 'PER_Primer_Apellido'),
        g(p, 'peR_Segundo_Apellido', 'pER_Segundo_Apellido', 'PER_Segundo_Apellido'),
    ]
        .filter(v => v && String(v).trim().toLowerCase() !== 'string')
        .join(' ')
        .trim();
};

const getPersonaNit = (p) =>
    g(p, 'peR_NIT', 'pER_NIT', 'PER_NIT', 'nit', 'NIT') ?? '';

const getPersonaDpi = (p) =>
    g(p, 'peR_DPI', 'pER_DPI', 'PER_DPI', 'dpi', 'DPI') ?? '';

const getCuentaId = (c) =>
    g(c, 'cuB_Cuenta', 'cUB_Cuenta', 'CUB_Cuenta');

const getChequeraId = (q) =>
    g(q, 'chQ_Chequera', 'cHQ_Chequera', 'CHQ_Chequera');

const getEstadoChequeId = (e) =>
    g(e, 'esC_Estado_Cheque', 'eSC_Estado_Cheque', 'ESC_Estado_Cheque');

const getEstadoChequeDesc = (e) =>
    g(e, 'esC_Descripcion', 'eSC_Descripcion', 'ESC_Descripcion');

// =========================
// MONTO A LETRAS
// =========================
const UNIDADES = [
    '', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
    'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE',
    'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE', 'VEINTE'
];

const DECENAS = [
    '', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA',
    'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'
];

const CENTENAS = [
    '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS',
    'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'
];

const convertirMenorDe100 = (n) => {
    if (n <= 20) return UNIDADES[n];
    if (n < 30) return `VEINTI${UNIDADES[n - 20].toLowerCase()}`.toUpperCase();

    const decena = Math.floor(n / 10);
    const unidad = n % 10;

    if (unidad === 0) return DECENAS[decena];
    return `${DECENAS[decena]} Y ${UNIDADES[unidad]}`;
};

const convertirMenorDe1000 = (n) => {
    if (n === 0) return '';
    if (n === 100) return 'CIEN';
    if (n < 100) return convertirMenorDe100(n);

    const centena = Math.floor(n / 100);
    const resto = n % 100;

    if (resto === 0) return CENTENAS[centena];
    return `${CENTENAS[centena]} ${convertirMenorDe100(resto)}`;
};

const numeroALetrasEntero = (n) => {
    if (n === 0) return 'CERO';
    if (n < 1000) return convertirMenorDe1000(n);

    if (n < 1000000) {
        const miles = Math.floor(n / 1000);
        const resto = n % 1000;

        let textoMiles = '';
        if (miles === 1) textoMiles = 'MIL';
        else textoMiles = `${convertirMenorDe1000(miles)} MIL`;

        if (resto === 0) return textoMiles;
        return `${textoMiles} ${convertirMenorDe1000(resto)}`;
    }

    if (n < 1000000000) {
        const millones = Math.floor(n / 1000000);
        const resto = n % 1000000;

        let textoMillones = '';
        if (millones === 1) textoMillones = 'UN MILLÓN';
        else textoMillones = `${numeroALetrasEntero(millones)} MILLONES`;

        if (resto === 0) return textoMillones;
        return `${textoMillones} ${numeroALetrasEntero(resto)}`;
    }

    return 'MONTO DEMASIADO GRANDE';
};

const montoALetras = (valor) => {
    const numero = Number(valor);

    if (Number.isNaN(numero) || numero <= 0) return '';

    const enteros = Math.floor(numero);
    const centavos = Math.round((numero - enteros) * 100);

    const letrasEnteros = numeroALetrasEntero(enteros);
    const letrasCentavos = centavos === 0 ? 'CERO' : numeroALetrasEntero(centavos);

    return `${letrasEnteros} QUETZALES CON ${letrasCentavos} CENTAVOS`;
};

const ChequeModal = ({
    isOpen,
    onClose,
    onSave,
    saving,
    cuentas = [],
    chequeras = [],
    personas = [],
    estadosCheque = [],
}) => {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState(INICIAL);
    const [personaSearch, setPersonaSearch] = useState('');

    useEffect(() => {
        if (!isOpen) return;

        const cuentaUnica =
            cuentas.length === 1
                ? String(getCuentaId(cuentas[0]) ?? '')
                : '';

        setStep(0);
        setPersonaSearch('');
        setForm({
            ...INICIAL,
            CUB_Cuenta: cuentaUnica,
        });
    }, [isOpen, cuentas]);

    useEffect(() => {
        const texto = montoALetras(form.MOV_Monto);

        setForm((prev) => {
            if (prev.CHE_Monto_Letras === texto) return prev;
            return {
                ...prev,
                CHE_Monto_Letras: texto,
            };
        });
    }, [form.MOV_Monto]);

    const set = (k) => (e) =>
        setForm((f) => ({
            ...f,
            [k]: e.target.value,
        }));

    const handleCuentaChange = (e) => {
        const value = e.target.value;
        setForm((f) => ({
            ...f,
            CUB_Cuenta: value,
            CHQ_Chequera: '',
            CHE_Numero_Cheque: '',
        }));
    };

    const chequerasFiltradas = useMemo(() => {
        return chequeras.filter((q) => {
            const cid = g(q, 'cuB_Cuenta', 'cUB_Cuenta', 'CUB_Cuenta');
            return !form.CUB_Cuenta || String(cid) === String(form.CUB_Cuenta);
        });
    }, [chequeras, form.CUB_Cuenta]);

    const chequeraSelec = useMemo(() => {
        return chequerasFiltradas.find(
            (q) => String(getChequeraId(q)) === String(form.CHQ_Chequera)
        );
    }, [chequerasFiltradas, form.CHQ_Chequera]);

    const cuentaSelec = useMemo(() => {
        return cuentas.find(
            (c) => String(getCuentaId(c)) === String(form.CUB_Cuenta)
        );
    }, [cuentas, form.CUB_Cuenta]);

    const personaSelec = useMemo(() => {
        return personas.find(
            (p) => String(getPersonaId(p)) === String(form.PER_Persona)
        );
    }, [personas, form.PER_Persona]);

    const saldo = Number(
        g(cuentaSelec, 'cUB_Saldo_Actual', 'cuB_Saldo_Actual', 'CUB_Saldo_Actual') ?? 0
    );

    const monto = parseFloat(form.MOV_Monto) || 0;

    const proximoNum = useMemo(() => {
        if (!chequeraSelec) return null;

        const desde = Number(
            g(chequeraSelec, 'chQ_Numero_Desde', 'cHQ_Numero_Desde', 'CHQ_Numero_Desde') ?? 0
        );

        const hasta = Number(
            g(chequeraSelec, 'chQ_Numero_Hasta', 'cHQ_Numero_Hasta', 'CHQ_Numero_Hasta') ?? 0
        );

        const ultimoUsado = Number(
            g(chequeraSelec, 'chQ_Ultimo_Usado', 'cHQ_Ultimo_Usado', 'CHQ_Ultimo_Usado') ?? 0
        );

        const siguiente = ultimoUsado > 0 ? ultimoUsado + 1 : desde;

        if (siguiente > hasta) return null;

        return siguiente;
    }, [chequeraSelec]);

    const numeroChequeMostrado =
        form.CHE_Numero_Cheque && String(form.CHE_Numero_Cheque).trim() !== ''
            ? String(form.CHE_Numero_Cheque).trim()
            : proximoNum != null
                ? String(proximoNum).padStart(8, '0')
                : '';

    const personasFiltradas = useMemo(() => {
        const q = personaSearch.trim().toLowerCase();
        if (!q) return personas;

        return personas.filter((p) => {
            const nombre = String(getPersonaNombre(p) ?? '').toLowerCase();
            const nit = String(getPersonaNit(p) ?? '').toLowerCase();
            const dpi = String(getPersonaDpi(p) ?? '').toLowerCase();

            return nombre.includes(q) || nit.includes(q) || dpi.includes(q);
        });
    }, [personas, personaSearch]);

    const ok0 = form.CUB_Cuenta && form.CHQ_Chequera;
    const ok1 =
        form.PER_Persona &&
        form.MOV_Monto &&
        monto > 0 &&
        monto <= saldo &&
        form.CHE_Fecha_Emision &&
        form.ESC_Estado_Cheque;

    const handleSelectPersona = (persona) => {
        const pid = getPersonaId(persona);

        if (pid == null || pid === '') {
            alert('La persona seleccionada no tiene identificador válido.');
            return;
        }

        setForm((f) => ({
            ...f,
            PER_Persona: String(pid),
        }));
    };

    const handleSave = () => {
        if (!form.CUB_Cuenta) {
            alert('Debes seleccionar una cuenta.');
            return;
        }

        if (!form.CHQ_Chequera) {
            alert('Debes seleccionar una chequera.');
            return;
        }

        if (!form.PER_Persona) {
            alert('Debes seleccionar una persona beneficiaria.');
            return;
        }

        const estadoChequeFinal = Number(form.ESC_Estado_Cheque);

        if (!estadoChequeFinal || Number.isNaN(estadoChequeFinal)) {
            alert('Debes seleccionar un estado de cheque válido.');
            return;
        }

        if (!form.CHE_Fecha_Emision) {
            alert('Debes ingresar la fecha de emisión.');
            return;
        }

        if (!monto || Number.isNaN(monto) || monto <= 0) {
            alert('Debes ingresar un monto válido.');
            return;
        }

        if (monto > saldo) {
            alert('El monto supera el saldo disponible.');
            return;
        }

        const numeroChequeFinal =
            form.CHE_Numero_Cheque && String(form.CHE_Numero_Cheque).trim() !== ''
                ? String(form.CHE_Numero_Cheque).trim()
                : String(proximoNum ?? '').trim();

        if (!numeroChequeFinal) {
            alert('No se pudo determinar un número de cheque válido.');
            return;
        }

        onSave({
            CUB_Cuenta: parseInt(form.CUB_Cuenta, 10),
            CHQ_Chequera: parseInt(form.CHQ_Chequera, 10),
            PER_Persona: parseInt(form.PER_Persona, 10),
            ESC_Estado_Cheque: estadoChequeFinal,
            CHE_Numero_Cheque: numeroChequeFinal,
            CHE_Monto_Letras: form.CHE_Monto_Letras.trim(),
            CHE_Fecha_Emision: form.CHE_Fecha_Emision,
            CHE_Fecha_Vencimiento: form.CHE_Fecha_Vencimiento || null,
            CHE_Concepto: form.CHE_Concepto.trim(),
            MOV_Numero_Referencia:
                form.MOV_Numero_Referencia.trim() || `CH-${numeroChequeFinal}`,
            MOV_Descripcion:
                form.MOV_Descripcion.trim() || `Emisión de cheque No. ${numeroChequeFinal}`,
            MOV_Monto: monto,
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
            onClick={onClose}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: 16,
                    width: '100%',
                    maxWidth: 680,
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
                            <FileText size={18} color="#0284c7" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                                Emitir cheque
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
                        <React.Fragment key={`step-${i}`}>
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
                        <>
                            <div>
                                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                                    Cuenta bancaria *
                                </label>
                                <select
                                    value={form.CUB_Cuenta}
                                    onChange={handleCuentaChange}
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
                                        const cid = getCuentaId(c);
                                        const num = g(c, 'cUB_Numero_Cuenta', 'cuB_Numero_Cuenta', 'CUB_Numero_Cuenta');
                                        const ban = g(c, 'bAN_Nombre', 'ban_nombre', 'BAN_Nombre') ?? '';
                                        return (
                                            <option key={cid ?? `cuenta-${idx}`} value={cid ?? ''}>
                                                {ban} — {num}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                                    Chequera *
                                </label>
                                <select
                                    value={form.CHQ_Chequera}
                                    onChange={set('CHQ_Chequera')}
                                    disabled={!form.CUB_Cuenta}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1.5px solid #e2e8f0',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        background: form.CUB_Cuenta ? '#f8fafc' : '#f1f5f9',
                                        color: '#0f172a',
                                        boxSizing: 'border-box',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    <option value="">Seleccionar chequera...</option>
                                    {chequerasFiltradas.map((q, idx) => {
                                        const qid = getChequeraId(q);
                                        const serie = g(q, 'chQ_Serie', 'cHQ_Serie', 'CHQ_Serie') ?? '';
                                        const desde = Number(g(q, 'chQ_Numero_Desde', 'cHQ_Numero_Desde', 'CHQ_Numero_Desde') ?? 0);
                                        const hasta = Number(g(q, 'chQ_Numero_Hasta', 'cHQ_Numero_Hasta', 'CHQ_Numero_Hasta') ?? 0);
                                        const ultimo = Number(g(q, 'chQ_Ultimo_Usado', 'cHQ_Ultimo_Usado', 'CHQ_Ultimo_Usado') ?? 0);

                                        const siguiente = ultimo > 0 ? ultimo + 1 : desde;
                                        const disp = siguiente > hasta ? 0 : hasta - siguiente + 1;

                                        return (
                                            <option key={qid ?? `chequera-${idx}`} value={qid ?? ''} disabled={disp <= 0}>
                                                {`Serie ${serie} — ${disp} disponibles${disp <= 0 ? ' (agotada)' : ''}`}
                                            </option>
                                        );
                                    })}
                                </select>

                                {form.CUB_Cuenta && chequerasFiltradas.length === 0 && (
                                    <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 4, display: 'block' }}>
                                        No hay chequeras disponibles para esta cuenta.
                                    </span>
                                )}
                            </div>

                            <div>
                                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                                    Número de cheque
                                </label>
                                <input
                                    value={numeroChequeMostrado}
                                    readOnly
                                    placeholder="Se genera automáticamente"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1.5px solid #e2e8f0',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        background: '#f1f5f9',
                                        color: '#0f172a',
                                        boxSizing: 'border-box',
                                        fontFamily: 'monospace',
                                        fontWeight: 700
                                    }}
                                />
                            </div>
                        </>
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
                                    <span>
                                        <strong>{g(cuentaSelec, 'bAN_Nombre', 'ban_nombre')}</strong> —{' '}
                                        <code style={{ fontFamily: 'monospace' }}>
                                            {g(cuentaSelec, 'cUB_Numero_Cuenta', 'cuB_Numero_Cuenta', 'CUB_Numero_Cuenta')}
                                        </code>
                                    </span>
                                    <span style={{ color: '#15803d', fontWeight: 600 }}>
                                        Saldo: Q {saldo.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )}

                            <div>
                                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                                    Buscar persona por nombre, NIT o DPI *
                                </label>

                                <div style={{ position: 'relative', marginBottom: 10 }}>
                                    <Search
                                        size={15}
                                        color="#94a3b8"
                                        style={{
                                            position: 'absolute',
                                            left: 12,
                                            top: '50%',
                                            transform: 'translateY(-50%)'
                                        }}
                                    />
                                    <input
                                        value={personaSearch}
                                        onChange={(e) => setPersonaSearch(e.target.value)}
                                        placeholder="Escribe nombre, NIT o DPI..."
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px 10px 34px',
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

                                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                                    Persona seleccionada: {form.PER_Persona || 'ninguna'}
                                </div>

                                <div
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 10,
                                        maxHeight: 240,
                                        overflowY: 'auto',
                                        background: '#fff'
                                    }}
                                >
                                    {personasFiltradas.length === 0 ? (
                                        <div style={{ padding: 14, fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
                                            No se encontraron personas.
                                        </div>
                                    ) : (
                                        personasFiltradas.map((p, idx) => {
                                            const pid = getPersonaId(p);
                                            const nombre = getPersonaNombre(p) || 'Sin nombre';
                                            const nit = getPersonaNit(p);
                                            const dpi = getPersonaDpi(p);
                                            const selected = String(form.PER_Persona) === String(pid);

                                            return (
                                                <button
                                                    key={pid ?? `persona-${idx}`}
                                                    type="button"
                                                    onClick={() => handleSelectPersona(p)}
                                                    style={{
                                                        width: '100%',
                                                        border: 'none',
                                                        borderBottom: '1px solid #f1f5f9',
                                                        background: selected ? '#eff6ff' : '#fff',
                                                        padding: '12px 14px',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        gap: 10
                                                    }}
                                                >
                                                    <div style={{ minWidth: 0 }}>
                                                        <div
                                                            style={{
                                                                fontSize: 13,
                                                                fontWeight: 600,
                                                                color: '#0f172a',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis'
                                                            }}
                                                        >
                                                            {nombre}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                                                            NIT: {nit || '—'} {' · '} DPI: {dpi || '—'}
                                                        </div>
                                                    </div>

                                                    {selected ? (
                                                        <span
                                                            style={{
                                                                fontSize: 11,
                                                                fontWeight: 700,
                                                                color: '#0284c7',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            Seleccionado
                                                        </span>
                                                    ) : (
                                                        <User size={16} color="#94a3b8" />
                                                    )}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                                    Monto *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span
                                        style={{
                                            position: 'absolute',
                                            left: 12,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#0284c7',
                                            fontWeight: 700,
                                            fontSize: 13
                                        }}
                                    >
                                        Q
                                    </span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={form.MOV_Monto}
                                        onChange={set('MOV_Monto')}
                                        placeholder="0.00"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px 10px 26px',
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

                                {monto > saldo && (
                                    <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 3, display: 'block' }}>
                                        El monto supera el saldo disponible.
                                    </span>
                                )}
                            </div>

                            <div>
                                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                                    Monto en letras
                                </label>
                                <input
                                    value={form.CHE_Monto_Letras}
                                    readOnly
                                    placeholder="Se genera automáticamente"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1.5px solid #e2e8f0',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        background: '#f1f5f9',
                                        color: '#0f172a',
                                        boxSizing: 'border-box',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                                        Fecha emisión *
                                    </label>
                                    <input
                                        type="date"
                                        value={form.CHE_Fecha_Emision}
                                        onChange={set('CHE_Fecha_Emision')}
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
                                        Fecha vencimiento
                                    </label>
                                    <input
                                        type="date"
                                        value={form.CHE_Fecha_Vencimiento}
                                        onChange={set('CHE_Fecha_Vencimiento')}
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
                                    Concepto
                                </label>
                                <input
                                    value={form.CHE_Concepto}
                                    onChange={set('CHE_Concepto')}
                                    placeholder="Ej. Pago de servicios"
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
                                    Estado del cheque *
                                </label>
                                <select
                                    value={form.ESC_Estado_Cheque}
                                    onChange={set('ESC_Estado_Cheque')}
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
                                >
                                    <option value="">Seleccionar estado...</option>
                                    {estadosCheque.map((e, idx) => {
                                        const eid = getEstadoChequeId(e);
                                        const edesc = getEstadoChequeDesc(e);

                                        return (
                                            <option key={eid ?? `estado-${idx}`} value={String(eid ?? '')}>
                                                {edesc ?? 'Sin descripción'}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {!ok1 && (
                                <div style={{ fontSize: 11, color: '#b91c1c', marginTop: 4 }}>
                                    Debes completar: persona, monto válido, fecha de emisión y estado del cheque.
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
                            <p style={{
                                margin: '0 0 12px',
                                fontSize: 14,
                                fontWeight: 700,
                                color: '#166534'
                            }}>
                                Confirma la información del cheque
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>Cuenta</div>
                                    <div style={{ fontSize: 13, color: '#0f172a' }}>
                                        {g(cuentaSelec, 'bAN_Nombre', 'ban_nombre', 'BAN_Nombre') ?? '—'} — {g(cuentaSelec, 'cUB_Numero_Cuenta', 'cuB_Numero_Cuenta', 'CUB_Numero_Cuenta') ?? '—'}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>Chequera</div>
                                    <div style={{ fontSize: 13, color: '#0f172a' }}>
                                        Serie {g(chequeraSelec, 'chQ_Serie', 'cHQ_Serie', 'CHQ_Serie') ?? '—'}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>Número de cheque</div>
                                    <div style={{ fontSize: 13, color: '#0f172a', fontFamily: 'monospace', fontWeight: 700 }}>
                                        {numeroChequeMostrado || '—'}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>Beneficiario</div>
                                    <div style={{ fontSize: 13, color: '#0f172a' }}>
                                        {personaSelec ? getPersonaNombre(personaSelec) : '—'}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>Monto</div>
                                    <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 700 }}>
                                        Q {monto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>Estado</div>
                                    <div style={{ fontSize: 13, color: '#0f172a' }}>
                                        {getEstadoChequeDesc(estadosCheque.find(e => String(getEstadoChequeId(e)) === String(form.ESC_Estado_Cheque))) ?? '—'}
                                    </div>
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>Monto en letras</div>
                                    <div style={{ fontSize: 13, color: '#0f172a' }}>
                                        {form.CHE_Monto_Letras || '—'}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>Fecha emisión</div>
                                    <div style={{ fontSize: 13, color: '#0f172a' }}>
                                        {form.CHE_Fecha_Emision || '—'}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>Fecha vencimiento</div>
                                    <div style={{ fontSize: 13, color: '#0f172a' }}>
                                        {form.CHE_Fecha_Vencimiento || '—'}
                                    </div>
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>Concepto</div>
                                    <div style={{ fontSize: 13, color: '#0f172a' }}>
                                        {form.CHE_Concepto || '—'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 10,
                        padding: '0 24px 20px'
                    }}
                >
                    {step > 0 && (
                        <button
                            onClick={() => setStep((s) => s - 1)}
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
                            onClick={() => setStep((s) => s + 1)}
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
                            {saving ? 'Emitiendo...' : <><Check size={14} /> Emitir cheque</>}
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ChequeModal;