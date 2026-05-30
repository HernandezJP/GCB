import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    Phone,
    Save,
    CircleX,
    AlertCircle
} from 'lucide-react';

import {
    getDescripcion,
    getEstado
} from './TipoTelefonoPage';

const INITIAL = {
    TIT_Descripcion: '',
    TIT_Estado: 'A'
};

const TipoTelefonoModal = ({
    isOpen,
    onClose,
    onSave,
    tipoToEdit
}) => {
    const [formData, setFormData] = useState(INITIAL);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setFormData(
                tipoToEdit
                    ? {
                        TIT_Descripcion:
                            getDescripcion(tipoToEdit),
                        TIT_Estado:
                            getEstado(tipoToEdit)
                    }
                    : INITIAL
            );

            setErrors({});
        }
    }, [tipoToEdit, isOpen]);

    if (!isOpen) return null;

    const handleDescripcionChange = (e) => {
        const original = e.target.value;

        const limpio = original.replace(
            /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
            ''
        );

        setFormData((prev) => ({
            ...prev,
            TIT_Descripcion: limpio
        }));

        if (original !== limpio) {
            setErrors({
                TIT_Descripcion:
                    'La descripción solo permite letras y espacios.'
            });
        } else {
            setErrors({});
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const descripcion =
            formData.TIT_Descripcion.trim();

        const nuevosErrores = {};

        if (!descripcion) {
            nuevosErrores.TIT_Descripcion =
                'Debe ingresar una descripción.';
        } else if (
            !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(
                descripcion
            )
        ) {
            nuevosErrores.TIT_Descripcion =
                'La descripción solo permite letras y espacios.';
        }

        if (
            Object.keys(nuevosErrores).length > 0
        ) {
            setErrors(nuevosErrores);
            return;
        }

        setSaving(true);

        try {
            await onSave({
                ...formData,
                TIT_Descripcion: descripcion
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
                            <Phone size={20} />
                        </div>

                        <h2>
                            {tipoToEdit
                                ? 'Editar Tipo de Teléfono'
                                : 'Nuevo Tipo de Teléfono'}
                        </h2>
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
                            <label htmlFor="tit-desc">
                                <Phone size={13} />
                                Descripción
                            </label>

                            <input
                                id="tit-desc"
                                type="text"
                                required
                                value={formData.TIT_Descripcion}
                                onChange={
                                    handleDescripcionChange
                                }
                                placeholder="Ej. Celular"
                                disabled={saving}
                                maxLength={60}
                            />

                            {errors.TIT_Descripcion && (
                                <small className="input-error">
                                    <AlertCircle size={13} />
                                    {
                                        errors.TIT_Descripcion
                                    }
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

export default TipoTelefonoModal;