import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Percent, Repeat, Hash } from 'lucide-react';
import {
    getCuentaId,
    getFrecuenciaId,
    getPorcentaje
} from './TasaInteresPage';

const INITIAL = {
    CUB_Cuenta: '',
    INF_Frecuencia: '',
    TIN_Porcentaje: ''
};

const TasaInteresModal = ({ isOpen, onClose, onSave, tasaToEdit }) => {
    const [formData, setFormData] = useState(INITIAL);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(
                tasaToEdit
                    ? {
                        CUB_Cuenta: getCuentaId(tasaToEdit) ?? '',
                        INF_Frecuencia: getFrecuenciaId(tasaToEdit) ?? '',
                        TIN_Porcentaje: getPorcentaje(tasaToEdit) ?? ''
                    }
                    : INITIAL
            );
        }
    }, [tasaToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!tasaToEdit && !formData.CUB_Cuenta) {
            alert('Debes ingresar el ID de la cuenta.');
            return;
        }

        if (!formData.INF_Frecuencia) {
            alert('Debes ingresar la frecuencia.');
            return;
        }

        if (formData.TIN_Porcentaje === '' || Number(formData.TIN_Porcentaje) < 0) {
            alert('Debes ingresar un porcentaje válido.');
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
                            <Percent size={20} />
                        </div>
                        <h2>{tasaToEdit ? 'Editar Tasa de Interés' : 'Nueva Tasa de Interés'}</h2>
                    </div>

                    <button onClick={onClose} className="close-btn" disabled={saving}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {!tasaToEdit && (
                            <div className="input-group">
                                <label htmlFor="cub-cuenta">
                                    <Hash size={13} />
                                    ID Cuenta Bancaria
                                </label>
                                <input
                                    id="cub-cuenta"
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.CUB_Cuenta}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            CUB_Cuenta: e.target.value
                                        })
                                    }
                                    placeholder="Ej. 1"
                                    disabled={saving}
                                />
                            </div>
                        )}

                        <div className="input-group">
                            <label htmlFor="inf-frecuencia">
                                <Repeat size={13} />
                                ID Frecuencia
                            </label>
                            <input
                                id="inf-frecuencia"
                                type="number"
                                required
                                min="1"
                                value={formData.INF_Frecuencia}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        INF_Frecuencia: e.target.value
                                    })
                                }
                                placeholder="Ej. 1"
                                disabled={saving}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="tin-porcentaje">
                                <Percent size={13} />
                                Porcentaje de Interés
                            </label>
                            <input
                                id="tin-porcentaje"
                                type="number"
                                step="0.0001"
                                min="0"
                                required
                                value={formData.TIN_Porcentaje}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        TIN_Porcentaje: e.target.value
                                    })
                                }
                                placeholder="Ej. 3.5000"
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
                                : tasaToEdit
                                    ? 'Guardar Cambios'
                                    : 'Crear Tasa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default TasaInteresModal;