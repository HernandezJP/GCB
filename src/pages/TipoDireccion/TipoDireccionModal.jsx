import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    MapPin,
    Save,
    CircleX,
    AlertCircle
} from 'lucide-react';

import { getDescripcion, getEstado } from './TipoDireccionPage';

const INITIAL = {
    TDI_Descripcion: '',
    TDI_Estado: 'A',
};

const TipoDireccionModal = ({ isOpen, onClose, onSave, tipoToEdit }) => {
    const [formData, setFormData] = useState(INITIAL);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setFormData(
                tipoToEdit
                    ? {
                        TDI_Descripcion: getDescripcion(tipoToEdit),
                        TDI_Estado: getEstado(tipoToEdit),
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
            TDI_Descripcion: limpio
        }));

        if (original !== limpio) {
            setErrors({
                TDI_Descripcion:
                    'La descripción solo permite letras y espacios.'
            });
        } else {
            setErrors({});
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const descripcion = formData.TDI_Descripcion.trim();
        const nuevosErrores = {};

        if (!descripcion) {
            nuevosErrores.TDI_Descripcion =
                'Debe ingresar una descripción.';
        } else if (
            !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(descripcion)
        ) {
            nuevosErrores.TDI_Descripcion =
                'La descripción solo permite letras y espacios.';
        }

        if (Object.keys(nuevosErrores).length > 0) {
            setErrors(nuevosErrores);
            return;
        }

        setSaving(true);

        try {
            await onSave({
                ...formData,
                TDI_Descripcion: descripcion
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
                            <MapPin size={20} />
                        </div>

                        <h2>
                            {tipoToEdit
                                ? 'Editar Tipo de Dirección'
                                : 'Nuevo Tipo de Dirección'}
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
                            <label htmlFor="tdi-desc">
                                <MapPin size={13} />
                                Descripción
                            </label>

                            <input
                                id="tdi-desc"
                                type="text"
                                required
                                value={formData.TDI_Descripcion}
                                onChange={handleDescripcionChange}
                                placeholder="Ej. Casa, Oficina, Facturación"
                                disabled={saving}
                                maxLength={60}
                            />

                            {errors.TDI_Descripcion && (
                                <small className="input-error">
                                    <AlertCircle size={13} />
                                    {errors.TDI_Descripcion}
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

export default TipoDireccionModal;