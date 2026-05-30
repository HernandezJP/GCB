import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    FileText,
    Save,
    CircleX,
    AlertCircle
} from 'lucide-react';

import { getDescripcion } from './EstadoDetalleConciliacionPage';

const INITIAL = {
    EDC_Descripcion: ''
};

const EstadoDetalleConciliacionModal = ({
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
                        EDC_Descripcion: getDescripcion(estadoToEdit)
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
            EDC_Descripcion: limpio
        });

        if (original !== limpio) {
            setErrors({
                EDC_Descripcion:
                    'La descripción solo permite letras y espacios.'
            });
        } else {
            setErrors({});
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const descripcion = formData.EDC_Descripcion.trim();
        const nuevosErrores = {};

        if (!descripcion) {
            nuevosErrores.EDC_Descripcion =
                'Debe ingresar una descripción.';
        } else if (
            !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(descripcion)
        ) {
            nuevosErrores.EDC_Descripcion =
                'La descripción solo permite letras y espacios.';
        }

        if (Object.keys(nuevosErrores).length > 0) {
            setErrors(nuevosErrores);
            return;
        }

        setSaving(true);

        try {
            await onSave({
                EDC_Descripcion: descripcion
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
                            <FileText size={20} />
                        </div>

                        <h2>
                            {estadoToEdit
                                ? 'Editar Estado de Detalle Conciliación'
                                : 'Nuevo Estado de Detalle Conciliación'}
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
                            <label htmlFor="edc-desc">
                                <FileText size={13} />
                                Descripción
                            </label>

                            <input
                                id="edc-desc"
                                required
                                value={formData.EDC_Descripcion}
                                onChange={handleDescripcionChange}
                                placeholder="Ej. Aprobación del detalle"
                                disabled={saving}
                                maxLength={60}
                            />

                            {errors.EDC_Descripcion && (
                                <small className="input-error">
                                    <AlertCircle size={13} />
                                    {errors.EDC_Descripcion}
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

export default EstadoDetalleConciliacionModal;