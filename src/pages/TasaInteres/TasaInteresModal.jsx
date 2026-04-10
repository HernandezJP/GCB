import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Percent, Repeat, Landmark } from 'lucide-react';
import {
    getCuentaId,
    getFrecuenciaId,
    getPorcentaje
} from './TasaInteresPage';

import { getCuentas } from '../../services/CuentaBancariaService';
import { getInteresFrecuencias } from '../../services/InteresFrecuenciaService';

const INITIAL = {
    CUB_Cuenta: '',
    INF_Frecuencia: '',
    TIN_Porcentaje: ''
};

const getCuentaEstado = (c) => c?.cuB_Estado ?? c?.CUB_Estado ?? 'I';
const getCuentaIdValue = (c) => c?.cuB_Cuenta ?? c?.CUB_Cuenta;
const getCuentaNumero = (c) => c?.cuB_Numero_Cuenta ?? c?.CUB_Numero_Cuenta ?? '';
const getCuentaBanco = (c) => c?.baN_Nombre ?? c?.BAN_Nombre ?? '';
const getCuentaTipo = (c) => c?.tcU_Descripcion ?? c?.TCU_Descripcion ?? '';

const getFrecuenciaEstado = (f) => f?.inF_Estado ?? f?.INF_Estado ?? 'I';
const getFrecuenciaIdValue = (f) =>
    f?.inF_Interes_Frecuencia ??
    f?.INF_Interes_Frecuencia ??
    f?.inF_Frecuencia ??
    f?.INF_Frecuencia;

const getFrecuenciaDescripcion = (f) => f?.inF_Descripcion ?? f?.INF_Descripcion ?? '';

const TasaInteresModal = ({ isOpen, onClose, onSave, tasaToEdit }) => {
    const [formData, setFormData] = useState(INITIAL);
    const [saving, setSaving] = useState(false);

    const [cuentas, setCuentas] = useState([]);
    const [frecuencias, setFrecuencias] = useState([]);
    const [loadingCombos, setLoadingCombos] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const cargarCombos = async () => {
            try {
                setLoadingCombos(true);

                const [cuentasData, frecuenciasData] = await Promise.all([
                    getCuentas(),
                    getInteresFrecuencias()
                ]);

                const cuentasActivas = (cuentasData || []).filter(c => getCuentaEstado(c) === 'A');
                const frecuenciasActivas = (frecuenciasData || []).filter(f => getFrecuenciaEstado(f) === 'A');

                setCuentas(cuentasActivas);
                setFrecuencias(frecuenciasActivas);
            } catch (error) {
                console.error('Error al cargar cuentas y frecuencias:', error);
                alert('No se pudieron cargar las cuentas bancarias o las frecuencias de interés.');
            } finally {
                setLoadingCombos(false);
            }
        };

        cargarCombos();
    }, [isOpen]);

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
            alert('Debes seleccionar una cuenta bancaria.');
            return;
        }

        if (!formData.INF_Frecuencia) {
            alert('Debes seleccionar una frecuencia de interés.');
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
                                    <Landmark size={13} />
                                    Cuenta Bancaria
                                </label>
                                <select
                                    id="cub-cuenta"
                                    required
                                    value={formData.CUB_Cuenta}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            CUB_Cuenta: e.target.value
                                        })
                                    }
                                    disabled={saving || loadingCombos}
                                >
                                    <option value="">
                                        {loadingCombos ? 'Cargando cuentas...' : 'Seleccione una cuenta'}
                                    </option>
                                    {cuentas.map((cuenta) => (
                                        <option
                                            key={getCuentaIdValue(cuenta)}
                                            value={getCuentaIdValue(cuenta)}
                                        >
                                            {getCuentaNumero(cuenta)} - {getCuentaBanco(cuenta)} - {getCuentaTipo(cuenta)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="input-group">
                            <label htmlFor="inf-frecuencia">
                                <Repeat size={13} />
                                Frecuencia de Interés
                            </label>
                            <select
                                id="inf-frecuencia"
                                required
                                value={formData.INF_Frecuencia}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        INF_Frecuencia: e.target.value
                                    })
                                }
                                disabled={saving || loadingCombos}
                            >
                                <option value="">
                                    {loadingCombos ? 'Cargando frecuencias...' : 'Seleccione una frecuencia'}
                                </option>
                                {frecuencias.map((frecuencia) => (
                                    <option
                                        key={getFrecuenciaIdValue(frecuencia)}
                                        value={getFrecuenciaIdValue(frecuencia)}
                                    >
                                        {getFrecuenciaDescripcion(frecuencia)}
                                    </option>
                                ))}
                            </select>
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
                            disabled={saving || loadingCombos}
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