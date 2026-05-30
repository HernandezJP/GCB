import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    Tag,
    Save,
    CircleX,
    AlertCircle
} from 'lucide-react';

import { getDescripcion } from './EstadoMovimientoPage';

const INITIAL = {
    ESM_Descripcion: ''
};

const EstadoMovimientoModal = ({
    isOpen,
    onClose,
    onSave,
    estadoToEdit
}) => {
    const [formData, setFormData] = useState(INITIAL);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setFormData(
                estadoToEdit
                    ? {
                        ESM_Descripcion:
                            getDescripcion(estadoToEdit)
                    }
                    : INITIAL
            );

            setErrors({});
        }
    }, [estadoToEdit, isOpen]);

    if (!isOpen) return null;

    const handleDescripcionChange = (e) => {
        const original = e.target.value;

        const limpio = original.replace(
            /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
            ''
        );

        setFormData({
            ESM_Descripcion: limpio
        });

        if (original !== limpio) {
            setErrors({
                ESM_Descripcion:
                    'La descripción solo permite letras y espacios.'
            });
        } else {
            setErrors({});
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const descripcion = formData.ESM_Descripcion.trim();
        const nuevosErrores = {};

        if (!descripcion) {
            nuevosErrores.ESM_Descripcion =
                'Debe ingresar una descripción.';
        } else if (
            !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(descripcion)
        ) {
            nuevosErrores.ESM_Descripcion =
                'La descripción solo permite letras y espacios.';
        }

        if (Object.keys(nuevosErrores).length > 0) {
            setErrors(nuevosErrores);
            return;
        }

        setSaving(true);

        try {
            await onSave({
                ESM_Descripcion: descripcion
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
                            <Tag size={20} />
                        </div>

                        <h2>
                            {estadoToEdit
                                ? 'Editar Estado de Movimiento'
                                : 'Nuevo Estado de Movimiento'}
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
                            <label htmlFor="esm-desc">
                                <Tag size={13} />
                                Descripción
                            </label>

                            <input
                                id="esm-desc"
                                required
                                value={formData.ESM_Descripcion}
                                onChange={handleDescripcionChange}
                                placeholder="Ej. Pendiente"
                                disabled={saving}
                                maxLength={60}
                            />

                            {errors.ESM_Descripcion && (
                                <small className="input-error">
                                    <AlertCircle size={13} />
                                    {errors.ESM_Descripcion}
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
                                : estadoToEdit
                                    ? 'Guardar Cambios'
                                    : 'Crear Estado'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default EstadoMovimientoModal;