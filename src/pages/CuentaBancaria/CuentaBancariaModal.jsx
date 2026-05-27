import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    CreditCard,
    Check,
    ArrowLeft,
    ChevronRight,
    Search,
    Plus
} from 'lucide-react';

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

// ── Helpers catálogos ────────────────────────────────────────────
const getBancoId    = (b) => b?.baN_Banco        ?? b?.bAN_Banco        ?? b?.ban_banco;
const getBancoNom   = (b) => b?.baN_Nombre       ?? b?.bAN_Nombre       ?? b?.ban_nombre       ?? '';

const getTCUId      = (t) => t?.tcU_Tipo_Cuenta  ?? t?.tCU_Tipo_Cuenta  ?? t?.tcu_tipo_cuenta;
const getTCUDesc    = (t) => t?.tcU_Descripcion  ?? t?.tCU_Descripcion  ?? t?.tcu_descripcion  ?? '';

const getTMOId      = (m) => m?.tmO_Tipo_Moneda  ?? m?.tMO_Tipo_Moneda  ?? m?.tmo_tipo_moneda;
const getTMODesc    = (m) => m?.tmO_Descripcion  ?? m?.tMO_Descripcion  ?? m?.tmo_descripcion  ?? '';
const getTMOSimbolo = (m) => m?.tmO_Simbolo      ?? m?.tMO_Simbolo      ?? m?.tmo_simbolo      ?? 'Q';

const getESCId      = (e) => e?.esC_Estado_Cuenta?? e?.eSC_Estado_Cuenta?? e?.esc_estado_cuenta;
const getESCDesc    = (e) => e?.esC_Descripcion  ?? e?.eSC_Descripcion  ?? e?.esc_descripcion  ?? '';

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

const normalize = (value) =>
    String(value ?? '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

const SearchableSelect = ({
    label,
    value,
    options = [],
    getOptionId,
    getOptionText,
    getSearchText,
    onChange,
    placeholder = 'Seleccionar...',
    disabled = false,
}) => {
    const boxRef = useRef(null);
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);

    const selected = useMemo(
        () => options.find(item => String(getOptionId(item)) === String(value)),
        [options, value, getOptionId]
    );

    useEffect(() => {
        if (selected) {
            setQuery(getOptionText(selected));
        }
    }, [selected, getOptionText]);

    useEffect(() => {
        const handleOutside = (event) => {
            if (boxRef.current && !boxRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    const filteredOptions = useMemo(() => {
        const q = normalize(query);

        if (!q) return options.slice(0, 10);

        return options
            .filter(item => {
                const visible = normalize(getOptionText(item));
                const search = normalize(getSearchText ? getSearchText(item) : getOptionText(item));

                return visible.includes(q) || search.includes(q);
            })
            .slice(0, 10);
    }, [query, options, getOptionText, getSearchText]);

    const handleChange = (e) => {
        const text = e.target.value;
        const q = normalize(text);

        setQuery(text);
        setOpen(true);

        const exact = options.find(item => {
            const visible = normalize(getOptionText(item));
            const search = normalize(getSearchText ? getSearchText(item) : getOptionText(item));

            return visible === q || search === q;
        });

        onChange(exact ? String(getOptionId(exact)) : '');
    };

    const handleSelect = (item) => {
        onChange(String(getOptionId(item)));
        setQuery(getOptionText(item));
        setOpen(false);
    };

    return (
        <div className="input-group searchable-select" ref={boxRef}>
            <label>{label} *</label>

            <div className={`searchable-control ${open ? 'is-open' : ''}`}>
                <Search size={15} className="searchable-control-icon" />

                <input
                    type="text"
                    value={query}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete="off"
                    onFocus={() => setOpen(true)}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') setOpen(false);
                    }}
                />
            </div>

            {!disabled && open && (
                <div className="searchable-menu">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(item => {
                            const id = String(getOptionId(item));

                            return (
                                <button
                                    key={id}
                                    type="button"
                                    className={`searchable-item ${String(value) === id ? 'selected' : ''}`}
                                    onClick={() => handleSelect(item)}
                                >
                                    <span>{getOptionText(item)}</span>
                                    {String(value) === id && <Check size={14} />}
                                </button>
                            );
                        })
                    ) : (
                        <div className="searchable-empty">
                            No se encontraron resultados.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

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
                    BAN_Banco:            String(getBanco(cuentaToEdit) ?? ''),
                    CUB_Numero_Cuenta:    String(getNumero(cuentaToEdit) ?? '').replace(/\D/g, ''),
                    CUB_Primer_Nombre:    getNombre(cuentaToEdit),
                    CUB_Segundo_Nombre:   cuentaToEdit?.cUB_Segundo_Nombre ?? cuentaToEdit?.cuB_Segundo_Nombre ?? '',
                    CUB_Primer_Apellido:  getApellido(cuentaToEdit),
                    CUB_Segundo_Apellido: cuentaToEdit?.cUB_Segundo_Apellido ?? cuentaToEdit?.cuB_Segundo_Apellido ?? '',
                    TCU_Tipo_Cuenta:      String(cuentaToEdit?.tCU_Tipo_Cuenta ?? cuentaToEdit?.tcU_Tipo_Cuenta ?? cuentaToEdit?.tcu_tipo_cuenta ?? ''),
                    TMO_Tipo_Moneda:      String(cuentaToEdit?.tMO_Tipo_Moneda ?? cuentaToEdit?.tmO_Tipo_Moneda ?? cuentaToEdit?.tmo_tipo_moneda ?? ''),
                    CUB_Saldo_Inicial:    String(getSaldoInicial(cuentaToEdit) ?? ''),
                    ESC_Estado_Cuenta:    String(cuentaToEdit?.eSC_Estado_Cuenta ?? cuentaToEdit?.esC_Estado_Cuenta ?? cuentaToEdit?.esc_estado_cuenta ?? ''),
                });
            } else {
                setForm(INITIAL);
            }

            setStep(0);
        }
    }, [isOpen, cuentaToEdit]);

    if (!isOpen) return null;

    const setValue = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const onlyNumbers = key => e => {
        setValue(key, e.target.value.replace(/\D/g, ''));
    };

    const onlyNames = key => e => {
        const value = e.target.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]/g, '');
        setValue(key, value.replace(/\s{2,}/g, ' '));
    };

    const onlyPositiveMoney = key => e => {
        const value = e.target.value.replace(',', '.');

        if (value === '') {
            setValue(key, '');
            return;
        }

        if (/^\d*\.?\d{0,2}$/.test(value) && Number(value) >= 0) {
            setValue(key, value);
        }
    };

    const ok0 =
        form.BAN_Banco.trim()         !== '' &&
        form.CUB_Numero_Cuenta.trim() !== '' &&
        form.TCU_Tipo_Cuenta.trim()   !== '' &&
        form.TMO_Tipo_Moneda.trim()   !== '';

    const ok1 =
        form.CUB_Primer_Nombre.trim()   !== '' &&
        form.CUB_Primer_Apellido.trim() !== '' &&
        form.CUB_Saldo_Inicial          !== '' &&
        Number(form.CUB_Saldo_Inicial)  >= 0 &&
        form.ESC_Estado_Cuenta.trim()   !== '';

    const bancoSel   = bancos.find(b => String(getBancoId(b)) === form.BAN_Banco);
    const tipoCueSel = tiposCuenta.find(t => String(getTCUId(t)) === form.TCU_Tipo_Cuenta);
    const tipoMonSel = tiposMoneda.find(m => String(getTMOId(m)) === form.TMO_Tipo_Moneda);
    const estadoSel  = estadosCuenta.find(e => String(getESCId(e)) === form.ESC_Estado_Cuenta);
    const simbolo    = getTMOSimbolo(tipoMonSel);

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
                <div className={`step-dot ${done ? 'done' : active ? 'active' : 'idle'}`}>
                    {done ? <Check size={13}/> : idx + 1}
                </div>

                <span className="step-label" style={{ color: active ? '#0284c7' : done ? '#15803d' : '#64748b' }}>
                    {STEPS[idx]}
                </span>
            </div>
        );
    };

    return createPortal(
        <div className="modal-backdrop">
            <div className="modal-card cuenta-modal-card">
                <div className="modal-header">
                    <div className="modal-title-group">
                        <div className="modal-icon">
                            <CreditCard size={20}/>
                        </div>

                        <div>
                            <h2>{cuentaToEdit ? 'Editar cuenta' : 'Nueva cuenta bancaria'}</h2>
                            <p>Paso {step + 1} de {STEPS.length}</p>
                        </div>
                    </div>

                    <button className="close-btn" onClick={onClose} disabled={saving} type="button">
                        <X size={18}/>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="stepper">
                        {STEPS.map((_, i) => (
                            <React.Fragment key={i}>
                                <StepDot idx={i}/>

                                {i < STEPS.length - 1 && (
                                    <div
                                        className="step-line"
                                        style={{ background: i < step ? '#15803d' : '#e2e8f0' }}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {step === 0 && (
                        <>
                            <div className="form-row">
                                <SearchableSelect
                                    label="Banco"
                                    value={form.BAN_Banco}
                                    options={bancos}
                                    getOptionId={getBancoId}
                                    getOptionText={getBancoNom}
                                    getSearchText={getBancoNom}
                                    onChange={(value) => setValue('BAN_Banco', value)}
                                    placeholder="Seleccionar banco..."
                                    disabled={saving}
                                />

                                <div className="input-group">
                                    <label>Número de cuenta *</label>
                                    <input
                                        value={form.CUB_Numero_Cuenta}
                                        onChange={onlyNumbers('CUB_Numero_Cuenta')}
                                        placeholder="Ej. 0410012345"
                                        inputMode="numeric"
                                        disabled={saving || !!cuentaToEdit}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <SearchableSelect
                                    label="Tipo de cuenta"
                                    value={form.TCU_Tipo_Cuenta}
                                    options={tiposCuenta}
                                    getOptionId={getTCUId}
                                    getOptionText={getTCUDesc}
                                    getSearchText={getTCUDesc}
                                    onChange={(value) => setValue('TCU_Tipo_Cuenta', value)}
                                    placeholder="Seleccionar tipo..."
                                    disabled={saving || !!cuentaToEdit}
                                />

                                <SearchableSelect
                                    label="Moneda"
                                    value={form.TMO_Tipo_Moneda}
                                    options={tiposMoneda}
                                    getOptionId={getTMOId}
                                    getOptionText={(m) => `${getTMOSimbolo(m)} — ${getTMODesc(m)}`}
                                    getSearchText={(m) => getTMODesc(m)}
                                    onChange={(value) => setValue('TMO_Tipo_Moneda', value)}
                                    placeholder="Seleccionar moneda..."
                                    disabled={saving || !!cuentaToEdit}
                                />
                            </div>
                        </>
                    )}

                    {step === 1 && (
                        <>
                            <div className="account-summary-strip">
                                <strong>{getBancoNom(bancoSel)}</strong>
                                <span>{getTCUDesc(tipoCueSel)}</span>
                                <code>{form.CUB_Numero_Cuenta}</code>
                            </div>

                            <div className="form-row">
                                <div className="input-group">
                                    <label>Primer nombre *</label>
                                    <input
                                        value={form.CUB_Primer_Nombre}
                                        onChange={onlyNames('CUB_Primer_Nombre')}
                                        placeholder="Nombre"
                                        disabled={saving}
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Segundo nombre</label>
                                    <input
                                        value={form.CUB_Segundo_Nombre}
                                        onChange={onlyNames('CUB_Segundo_Nombre')}
                                        placeholder="Segundo nombre"
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="input-group">
                                    <label>Primer apellido *</label>
                                    <input
                                        value={form.CUB_Primer_Apellido}
                                        onChange={onlyNames('CUB_Primer_Apellido')}
                                        placeholder="Apellido"
                                        disabled={saving}
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Segundo apellido</label>
                                    <input
                                        value={form.CUB_Segundo_Apellido}
                                        onChange={onlyNames('CUB_Segundo_Apellido')}
                                        placeholder="Segundo apellido"
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="input-group">
                                    <label>Saldo inicial *</label>

                                    <div className="money-input">
                                        <span>{simbolo}</span>

                                        <input
                                            value={form.CUB_Saldo_Inicial}
                                            onChange={onlyPositiveMoney('CUB_Saldo_Inicial')}
                                            placeholder="0.00"
                                            inputMode="decimal"
                                            disabled={saving || !!cuentaToEdit}
                                        />
                                    </div>
                                </div>

                                <SearchableSelect
                                    label="Estado de cuenta"
                                    value={form.ESC_Estado_Cuenta}
                                    options={estadosCuenta}
                                    getOptionId={getESCId}
                                    getOptionText={getESCDesc}
                                    getSearchText={getESCDesc}
                                    onChange={(value) => setValue('ESC_Estado_Cuenta', value)}
                                    placeholder="Seleccionar estado..."
                                    disabled={saving}
                                />
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <div className="confirm-card">
                            <p>Resumen de la cuenta</p>

                            {[
                                ['Banco', getBancoNom(bancoSel)],
                                ['Número', form.CUB_Numero_Cuenta],
                                ['Tipo de cuenta', getTCUDesc(tipoCueSel)],
                                ['Moneda', `${simbolo} — ${getTMODesc(tipoMonSel)}`],
                                ['Titular', `${form.CUB_Primer_Nombre} ${form.CUB_Primer_Apellido}`],
                                ['Saldo inicial', `${simbolo} ${parseFloat(form.CUB_Saldo_Inicial || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`],
                                ['Estado', getESCDesc(estadoSel)],
                            ].map(([k, v]) => (
                                <div key={k} className="confirm-row">
                                    <span>{k}</span>
                                    <strong>{v || '—'}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {step > 0 && (
                        <button className="btn-secondary" onClick={() => setStep(s => s - 1)} disabled={saving} type="button">
                            <ArrowLeft size={14}/> Atrás
                        </button>
                    )}

                    <button className="btn-cancel" onClick={onClose} disabled={saving} type="button">
                        Cancelar
                    </button>

                    {step < 2 ? (
                        <button
                            className="btn-save"
                            style={{ opacity: (step === 0 ? ok0 : ok1) ? 1 : 0.5 }}
                            onClick={() => {
                                if (step === 0 ? ok0 : ok1) setStep(s => s + 1);
                            }}
                            disabled={saving || (step === 0 ? !ok0 : !ok1)}
                            type="button"
                        >
                            Siguiente <Plus size={14}/>
                        </button>
                    ) : (
                        <button className="btn-save" onClick={handleSubmit} disabled={saving} type="button">
                            {saving ? 'Guardando...' : (
                                <>
                                    <Check size={14}/> {cuentaToEdit ? 'Guardar cambios' : 'Crear cuenta'}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CuentaBancariaModal;