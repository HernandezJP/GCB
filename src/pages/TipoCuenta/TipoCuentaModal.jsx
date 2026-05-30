import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    CreditCard,
    Save,
    CircleX,
    AlertCircle
} from 'lucide-react';
import { getDescripcion } from './TipoCuentaPage';

const INITIAL = { TCU_Descripcion: '' };

const TipoCuentaModal = ({ isOpen, onClose, onSave, tipoToEdit }) => {
    const [formData, setFormData] = useState(INITIAL);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setFormData(
                tipoToEdit
                    ? { TCU_Descripcion: getDescripcion(tipoToEdit) }
                    : INITIAL
            );
        setErrors({});
        }
    }, [tipoToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
    e.preventDefault();

    const descripcion = formData.TCU_Descripcion.trim();

    if (!descripcion) {
        alert("Debe ingresar una descripción.");
        return;
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(descripcion)) {
    setErrors({
        TCU_Descripcion:
            "La descripción solo puede contener letras y espacios."
    });
    return;
}

    setSaving(true);

    try {
        await onSave({
            TCU_Descripcion: descripcion
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
                            <CreditCard size={20} />
                        </div>
                        <h2>{tipoToEdit ? 'Editar Tipo de Cuenta' : 'Nuevo Tipo de Cuenta'}</h2>
                    </div>
                    <button onClick={onClose} className="close-btn" disabled={saving}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="input-group">
                            <label htmlFor="tcu-desc">
                                <CreditCard size={13} />
                                Descripción
                            </label>
                            <input
                                id="tcu-desc"
                                required
                                value={formData.TCU_Descripcion}
                                onChange={(e) => {
                                    const original = e.target.value;

                                    const limpio = original.replace(
                                        /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
                                        ""
                                    );

                                    setFormData({
                                        TCU_Descripcion: limpio
                                    });

                                    if (original !== limpio) {
                                        setErrors({
                                            TCU_Descripcion:
                                                "La descripción solo permite letras y espacios."
                                        });
                                    } else {
                                        setErrors({});
                                    }
                                }}
                                placeholder="Ej. Cuenta de Ahorro"
                                disabled={saving}
                            />
                            {errors.TCU_Descripcion && (
                                <small className="input-error">
                                    <AlertCircle size={13} />
                                    {errors.TCU_Descripcion}
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
                        <CircleX size={16} />
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="btn-save"
                        disabled={saving}
                    >
                        <Save size={16} />
                        {saving
                            ? 'Guardando...'
                            : tipoToEdit
                                ? 'Guardar Cambios'
                                : 'Crear Tipo'}
                    </button>
                </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default TipoCuentaModal;