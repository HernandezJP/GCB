import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Building2, Hash, AlertCircle } from 'lucide-react';
import { getNombre, getSwift } from './BancoPage';

const INITIAL = { BAN_Nombre: '', BAN_Codigo_Swift: '' };

const limpiarNombreBanco = (value) => {
    return value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, '');
};

const limpiarSwift = (value) => {
    // SWIFT/BIC normalmente usa letras y números, sin espacios ni símbolos.
    return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
};

const BancoModal = ({ isOpen, onClose, onSave, bancoToEdit }) => {
    const [formData, setFormData] = useState(INITIAL);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setFormData(
                bancoToEdit
                    ? {
                        BAN_Nombre: getNombre(bancoToEdit),
                        BAN_Codigo_Swift: getSwift(bancoToEdit),
                    }
                    : INITIAL
            );

            setErrors({});
        }
    }, [bancoToEdit, isOpen]);

    if (!isOpen) return null;

    const handleNombreChange = (e) => {
    const original = e.target.value;
    const limpio = limpiarNombreBanco(original);

    setFormData(prev => ({
        ...prev,
        BAN_Nombre: limpio,
    }));

        if (original !== limpio) {
            setErrors(prev => ({
                ...prev,
                BAN_Nombre:
                    'El nombre del banco solo permite letras y espacios.',
            }));
        } else {
            setErrors(prev => ({
                ...prev,
                BAN_Nombre: '',
            }));
        }
    };

    const handleSwiftChange = (e) => {
        const original = e.target.value;
        const limpio = limpiarSwift(original);

        setFormData(prev => ({
            ...prev,
            BAN_Codigo_Swift: limpio.slice(0, 11),
        }));

        if (original !== limpio) {
            setErrors(prev => ({
                ...prev,
                BAN_Codigo_Swift: 'El código SWIFT solo permite letras y números.',
            }));
        } else {
            setErrors(prev => ({
                ...prev,
                BAN_Codigo_Swift: '',
            }));
        }
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formData.BAN_Nombre.trim()) {
            nuevosErrores.BAN_Nombre = 'El nombre del banco es obligatorio.';
        }

        if (!/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.BAN_Nombre.trim())) {
            nuevosErrores.BAN_Nombre =
              'El nombre del banco solo puede contener letras y espacios.';
        }

        if (!formData.BAN_Codigo_Swift.trim()) {
            nuevosErrores.BAN_Codigo_Swift = 'El código SWIFT es obligatorio.';
        }

        if (!/^[A-Z0-9]{8,11}$/.test(formData.BAN_Codigo_Swift.trim())) {
            nuevosErrores.BAN_Codigo_Swift = 'El código SWIFT debe tener exactamente 8 u 11 caracteres alfanuméricos.';
        }

        setErrors(nuevosErrores);

        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        setSaving(true);

        try {
            await onSave({
                BAN_Nombre: formData.BAN_Nombre.trim(),
                BAN_Codigo_Swift: formData.BAN_Codigo_Swift.trim(),
            });
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
                            <Building2 size={20} />
                        </div>
                        <h2>{bancoToEdit ? 'Editar Banco' : 'Nuevo Banco'}</h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="close-btn"
                        disabled={saving}
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="input-group">
                            <label htmlFor="ban-nombre">
                                <Building2 size={13} />
                                Nombre del Banco
                            </label>

                            <input
                                id="ban-nombre"
                                required
                                value={formData.BAN_Nombre}
                                onChange={handleNombreChange}
                                placeholder="Ej. Banco Industrial"
                                disabled={saving}
                                maxLength={80}
                            />

                            {errors.BAN_Nombre && (
                                <small className="input-error">
                                    <AlertCircle size={13} />
                                    {errors.BAN_Nombre}
                                </small>
                            )}
                        </div>

                        <div className="input-group">
                            <label htmlFor="ban-swift">
                                <Hash size={13} />
                                Código SWIFT / BIC
                            </label>

                            <input
                                id="ban-swift"
                                required
                                value={formData.BAN_Codigo_Swift}
                                onChange={handleSwiftChange}
                                placeholder="Ej. BINDGTGX"
                                maxLength={11}
                                style={{
                                    textTransform: 'uppercase',
                                    fontFamily: 'monospace',
                                    letterSpacing: '1px',
                                }}
                                disabled={saving}
                            />

                            {errors.BAN_Codigo_Swift && (
                                <small className="input-error">
                                    <AlertCircle size={13} />
                                    {errors.BAN_Codigo_Swift}
                                </small>
                            )}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="btn-save"
                            disabled={saving}
                        >
                            {saving
                                ? 'Guardando...'
                                : bancoToEdit
                                    ? 'Guardar Cambios'
                                    : 'Crear Banco'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default BancoModal;