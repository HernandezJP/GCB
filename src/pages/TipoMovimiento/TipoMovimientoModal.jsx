import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    Shuffle,
    Save,
    CircleX,
    AlertCircle
} from 'lucide-react';

import { getDescripcion } from './TipoMovimientoPage';

const INITIAL = {
    TIM_Descripcion: ''
};

const TipoMovimientoModal = ({
    isOpen,
    onClose,
    onSave,
    movimientoToEdit
}) => {
    const [formData, setFormData] = useState(INITIAL);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setFormData(
                movimientoToEdit
                    ? {
                        TIM_Descripcion:
                            getDescripcion(movimientoToEdit)
                    }
                    : INITIAL
            );

            setErrors({});
        }
    }, [movimientoToEdit, isOpen]);

    if (!isOpen) return null;

    const handleDescripcionChange = (e) => {
        const original = e.target.value;

        const limpio = original.replace(
            /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
            ''
        );

        setFormData({
            TIM_Descripcion: limpio
        });

        if (original !== limpio) {
            setErrors({
                TIM_Descripcion:
                    'La descripción solo permite letras y espacios.'
            });
        } else {
            setErrors({});
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const descripcion =
            formData.TIM_Descripcion.trim();

        const nuevosErrores = {};

        if (!descripcion) {
            nuevosErrores.TIM_Descripcion =
                'Debe ingresar una descripción.';
        } else if (
            !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(
                descripcion
            )
        ) {
            nuevosErrores.TIM_Descripcion =
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
                TIM_Descripcion: descripcion
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
                            <Shuffle size={20} />
                        </div>

                        <h2>
                            {movimientoToEdit
                                ? 'Editar Tipo de Movimiento'
                                : 'Nuevo Tipo de Movimiento'}
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
                            <label htmlFor="tim-desc">
                                <Shuffle size={13} />
                                Descripción
                            </label>

                            <input
                                id="tim-desc"
                                required
                                value={formData.TIM_Descripcion}
                                onChange={
                                    handleDescripcionChange
                                }
                                placeholder="Ej. Ingreso, Egreso"
                                disabled={saving}
                                maxLength={60}
                            />

                            {errors.TIM_Descripcion && (
                                <small className="input-error">
                                    <AlertCircle size={13} />
                                    {
                                        errors.TIM_Descripcion
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
                                : movimientoToEdit
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

export default TipoMovimientoModal;