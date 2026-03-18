import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Phone } from 'lucide-react';
import { getDescripcion, getEstado } from './TipoTelefonoPage';

const INITIAL = {
    TIT_Descripcion: '',
    TIT_Estado: 'A'
};

const TipoTelefonoModal = ({ isOpen, onClose, onSave, tipoToEdit }) => {
    const [formData, setFormData] = useState(INITIAL);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(
                tipoToEdit
                    ? {
                        TIT_Descripcion: getDescripcion(tipoToEdit),
                        TIT_Estado: getEstado(tipoToEdit)
                    }
                    : INITIAL
            );
        }
    }, [tipoToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                            <Phone size={20} />
                        </div>
                        <h2>{tipoToEdit ? 'Editar Tipo de Teléfono' : 'Nuevo Tipo de Teléfono'}</h2>
                    </div>

                    <button onClick={onClose} className="close-btn" disabled={saving}>
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
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        TIT_Descripcion: e.target.value
                                    })
                                }
                                placeholder="Ej. Celular"
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