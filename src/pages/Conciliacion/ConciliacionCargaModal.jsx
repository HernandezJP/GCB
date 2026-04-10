import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Check } from 'lucide-react';

const INITIAL = {
    CUB_Cuenta: '',
    CON_Periodo: '',
    Archivo: null,
};

const getCuentaId = (c) =>
    c?.cUB_Cuenta ?? c?.cuB_Cuenta ?? c?.cub_cuenta ?? 0;

const getNumeroCuenta = (c) =>
    c?.cUB_Numero_Cuenta ?? c?.cuB_Numero_Cuenta ?? c?.cub_numero_cuenta ?? '';

const getBancoNombre = (c) =>
    c?.bAN_Nombre ?? c?.baN_Nombre ?? c?.ban_nombre ?? '';

const getNombre = (c) =>
    c?.cUB_Primer_Nombre ?? c?.cuB_Primer_Nombre ?? c?.cub_primer_nombre ?? '';

const getApellido = (c) =>
    c?.cUB_Primer_Apellido ?? c?.cuB_Primer_Apellido ?? c?.cub_primer_apellido ?? '';

const getTitular = (c) => `${getNombre(c)} ${getApellido(c)}`.trim();

const getCurrentPeriod = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
};

const ConciliacionCargaModal = ({
    isOpen,
    onClose,
    onSave,
    cuentas = [],
    cuentaIdInicial = '',
}) => {
    const [form, setForm] = useState(INITIAL);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setForm({
                CUB_Cuenta: cuentaIdInicial ? String(cuentaIdInicial) : '',
                CON_Periodo: getCurrentPeriod(),
                Archivo: null,
            });
        }
    }, [isOpen, cuentaIdInicial]);

    const cuentaSeleccionada = useMemo(
        () => cuentas.find((c) => String(getCuentaId(c)) === String(form.CUB_Cuenta)),
        [cuentas, form.CUB_Cuenta]
    );

    if (!isOpen) return null;

    const isValid =
        String(form.CUB_Cuenta).trim() !== '' &&
        String(form.CON_Periodo).trim() !== '' &&
        form.Archivo;

    const handleSubmit = async () => {
        if (!isValid || saving) return;

        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('CUB_Cuenta', form.CUB_Cuenta);
            fd.append('CON_Periodo', form.CON_Periodo);
            fd.append('Archivo', form.Archivo);

            await onSave(fd);
        } finally {
            setSaving(false);
        }
    };

    return createPortal(
        <div className="modal-backdrop">
            <div className="modal-card">
                <div className="modal-header">
                    <div className="modal-title-group">
                        <div className="modal-icon">
                            <Upload size={20} />
                        </div>
                        <div>
                            <h2>Nueva conciliación</h2>
                            <p>Cargar estado de cuenta bancario</p>
                        </div>
                    </div>

                    <button className="close-btn" onClick={onClose} disabled={saving} type="button">
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="stepper">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                            <div className="step-dot active">
                                <Check size={13} />
                            </div>
                            <span className="step-label" style={{ color: '#0284c7' }}>
                                Archivo
                            </span>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Cuenta *</label>
                        <select
                            value={form.CUB_Cuenta}
                            onChange={(e) => setForm((f) => ({ ...f, CUB_Cuenta: e.target.value }))}
                            disabled={saving}
                        >
                            <option value="">Seleccionar cuenta</option>
                            {cuentas.map((c) => (
                                <option key={getCuentaId(c)} value={String(getCuentaId(c))}>
                                    {getNumeroCuenta(c) || `Cuenta #${getCuentaId(c)}`}
                                    {getBancoNombre(c) ? ` · ${getBancoNombre(c)}` : ''}
                                    {getTitular(c) ? ` · ${getTitular(c)}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label>Período *</label>
                            <input
                                type="month"
                                value={form.CON_Periodo}
                                onChange={(e) => setForm((f) => ({ ...f, CON_Periodo: e.target.value }))}
                                disabled={saving}
                            />
                        </div>

                        <div className="input-group">
                            <label>Archivo CSV *</label>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        Archivo: e.target.files?.[0] || null,
                                    }))
                                }
                                disabled={saving}
                            />
                        </div>
                    </div>

                    {cuentaSeleccionada && (
                        <div
                            style={{
                                marginTop: 12,
                                padding: '12px 14px',
                                borderRadius: 8,
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#1d4ed8',
                                fontSize: 13
                            }}
                        >
                            Se procesará el archivo para la cuenta{' '}
                            <strong>{getNumeroCuenta(cuentaSeleccionada)}</strong>.
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={saving} type="button">
                        Cancelar
                    </button>

                    <button className="btn-save" onClick={handleSubmit} disabled={!isValid || saving} type="button">
                        {saving ? 'Procesando...' : 'Procesar conciliación'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConciliacionCargaModal;