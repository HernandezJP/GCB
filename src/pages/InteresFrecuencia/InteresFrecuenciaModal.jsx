import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Repeat } from 'lucide-react';
import { getDescripcion } from './InteresFrecuenciaPage';

const INITIAL = {
    INF_Descripcion: ''
};

const InteresFrecuenciaModal = ({ isOpen, onClose, onSave, frecuenciaToEdit }) => {
    const [formData, setFormData] = useState(INITIAL);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(
                frecuenciaToEdit
                    ? {
                        INF_Descripcion: getDescripcion(frecuenciaToEdit)
                    }
                    : INITIAL
            );
        }
    }, [frecuenciaToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.INF_Descripcion.trim()) {
            alert('Debes ingresar una descripción.');
            return;
        }

        setSaving(true);
        try {
            await onSave(formData);
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
                            <Repeat size={20} />
                        </div>
                        <h2>{frecuenciaToEdit ? 'Editar Frecuencia de Interés' : 'Nueva Frecuencia de Interés'}</h2>
                    </div>

                    <button onClick={onClose} className="close-btn" disabled={saving}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="input-group">
                            <label htmlFor="inf-descripcion">
                                <Repeat size={13} />
                                Descripción
                            </label>
                            <input
                                id="inf-descripcion"
                                type="text"
                                required
                                value={formData.INF_Descripcion}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        INF_Descripcion: e.target.value
                                    })
                                }
                                placeholder="Ej. Mensual"
                                disabled={saving}
                            />
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
                                : frecuenciaToEdit
                                    ? 'Guardar Cambios'
                                    : 'Crear Frecuencia'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default InteresFrecuenciaModal;