import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Zap, Landmark, CalendarDays, BadgeDollarSign, Repeat } from 'lucide-react';
import {
    getDescripcion,
    getOrigen,
    getMonto,
    getFrecuencia,
    getDiaCobro
} from './ReglaRecargoPage';

const INITIAL = {
    RCA_Descripcion: '',
    RCA_Origen: 'C',
    RCA_Monto: '',
    RCA_Frecuencia: 'M',
    RCA_Dia_Cobro: ''
};

const ReglaRecargoModal = ({ isOpen, onClose, onSave, reglaToEdit, cuentaSeleccionada }) => {
    const [formData, setFormData] = useState(INITIAL);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(
                reglaToEdit
                    ? {
                        RCA_Descripcion: getDescripcion(reglaToEdit),
                        RCA_Origen: getOrigen(reglaToEdit) || 'C',
                        RCA_Monto: getMonto(reglaToEdit) ?? '',
                        RCA_Frecuencia: getFrecuencia(reglaToEdit) || 'M',
                        RCA_Dia_Cobro: getDiaCobro(reglaToEdit) ?? ''
                    }
                    : INITIAL
            );
        }
    }, [reglaToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.RCA_Descripcion.trim()) {
            alert('Debes ingresar una descripción.');
            return;
        }

        if (formData.RCA_Monto === '' || Number(formData.RCA_Monto) <= 0) {
            alert('Debes ingresar un monto válido.');
            return;
        }

        if (
            formData.RCA_Frecuencia === 'M' &&
            (formData.RCA_Dia_Cobro === '' ||
                Number(formData.RCA_Dia_Cobro) < 1 ||
                Number(formData.RCA_Dia_Cobro) > 31)
        ) {
            alert('Para frecuencia mensual debes ingresar un día de cobro entre 1 y 31.');
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
            <div className="modal-card modal-card-lg">
                <div className="modal-header">
                    <div className="modal-title-group">
                        <div className="modal-icon">
                            <Zap size={20} />
                        </div>
                        <h2>{reglaToEdit ? 'Editar Regla de Recargo' : 'Nueva Regla de Recargo'}</h2>
                    </div>

                    <button onClick={onClose} className="close-btn" disabled={saving}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {cuentaSeleccionada && (
                            <div className="selected-account-box">
                                <div className="selected-account-title">
                                    <Landmark size={14} />
                                    Cuenta seleccionada
                                </div>
                                <div className="selected-account-value">
                                    {(cuentaSeleccionada?.cuB_Numero_Cuenta ?? cuentaSeleccionada?.CUB_Numero_Cuenta ?? '')}
                                    {' - '}
                                    {(cuentaSeleccionada?.baN_Nombre ?? cuentaSeleccionada?.BAN_Nombre ?? '')}
                                </div>
                            </div>
                        )}

                        <div className="input-group">
                            <label htmlFor="rca-descripcion">
                                <Zap size={13} />
                                Descripción
                            </label>
                            <input
                                id="rca-descripcion"
                                type="text"
                                required
                                value={formData.RCA_Descripcion}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        RCA_Descripcion: e.target.value
                                    })
                                }
                                placeholder="Ej. Recargo por manejo de cuenta"
                                disabled={saving}
                            />
                        </div>

                        <div className="form-grid">
                            <div className="input-group">
                                <label htmlFor="rca-origen">
                                    <Repeat size={13} />
                                    Origen del Recargo
                                </label>
                                <select
                                    id="rca-origen"
                                    value={formData.RCA_Origen}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            RCA_Origen: e.target.value
                                        })
                                    }
                                    disabled={saving}
                                >
                                    <option value="C">C - Cobro por cuenta</option>
                                    <option value="Q">Q - Cheque</option>
                                    <option value="T">T - Transferencia</option>
                                    <option value="S">S - Servicio</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label htmlFor="rca-monto">
                                    <BadgeDollarSign size={13} />
                                    Monto
                                </label>
                                <input
                                    id="rca-monto"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    required
                                    value={formData.RCA_Monto}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            RCA_Monto: e.target.value
                                        })
                                    }
                                    placeholder="Ej. 25.00"
                                    disabled={saving}
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="rca-frecuencia">
                                    <Repeat size={13} />
                                    Frecuencia
                                </label>
                                <select
                                    id="rca-frecuencia"
                                    value={formData.RCA_Frecuencia}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            RCA_Frecuencia: e.target.value,
                                            RCA_Dia_Cobro: e.target.value === 'M' ? formData.RCA_Dia_Cobro : ''
                                        })
                                    }
                                    disabled={saving}
                                >
                                    <option value="M">M - Mensual</option>
                                    <option value="U">U - Única</option>
                                    <option value="O">O - Por operación</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label htmlFor="rca-dia-cobro">
                                    <CalendarDays size={13} />
                                    Día de Cobro
                                </label>
                                <input
                                    id="rca-dia-cobro"
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={formData.RCA_Dia_Cobro}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            RCA_Dia_Cobro: e.target.value
                                        })
                                    }
                                    placeholder={formData.RCA_Frecuencia === 'M' ? 'Ej. 15' : 'No aplica'}
                                    disabled={saving || formData.RCA_Frecuencia !== 'M'}
                                />
                            </div>
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
                                : reglaToEdit
                                    ? 'Guardar Cambios'
                                    : 'Crear Regla'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default ReglaRecargoModal;