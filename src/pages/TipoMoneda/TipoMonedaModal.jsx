import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
    X,
    Coins,
    Tag,
    BadgeCheck,
    AlertCircle,
    Save,
    CircleX,
} from "lucide-react";

import {
    getDescripcion,
    getCodigoIso,
    getSimbolo,
} from "./TipoMonedaPage";

const INITIAL = {
    TMO_Descripcion: "",
    TMO_Codigo_ISO: "",
    TMO_Simbolo: "",
};

const soloLetrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const soloLetrasMayusRegex = /^[A-Z]+$/;

const limpiarSoloLetras = (value) => {
    return value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
};

const limpiarCodigoIso = (value) => {
    return value.replace(/[^A-Za-z]/g, "").toUpperCase();
};

const TipoMonedaModal = ({ isOpen, onClose, onSave, monedaToEdit }) => {
    const [formData, setFormData] = useState(INITIAL);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isOpen) return;

        if (monedaToEdit) {
            setFormData({
                TMO_Descripcion: getDescripcion(monedaToEdit),
                TMO_Codigo_ISO: getCodigoIso(monedaToEdit),
                TMO_Simbolo: getSimbolo(monedaToEdit),
            });
        } else {
            setFormData(INITIAL);
        }

        setErrors({});
    }, [monedaToEdit, isOpen]);

    if (!isOpen) return null;

    const handleDescripcionChange = (e) => {
        const original = e.target.value;
        const limpio = limpiarSoloLetras(original);

        setFormData((prev) => ({
            ...prev,
            TMO_Descripcion: limpio,
        }));

        if (original !== limpio) {
            setErrors((prev) => ({
                ...prev,
                TMO_Descripcion:
                    "La descripción solo permite letras y espacios.",
            }));
        } else {
            setErrors((prev) => ({
                ...prev,
                TMO_Descripcion: "",
            }));
        }
    };

    const handleCodigoIsoChange = (e) => {
        const original = e.target.value;
        const limpio = limpiarCodigoIso(original).slice(0, 3);

        setFormData((prev) => ({
            ...prev,
            TMO_Codigo_ISO: limpio,
        }));

        if (original !== limpiarCodigoIso(original)) {
            setErrors((prev) => ({
                ...prev,
                TMO_Codigo_ISO:
                    "El código ISO solo permite letras, sin números ni caracteres especiales.",
            }));
        } else {
            setErrors((prev) => ({
                ...prev,
                TMO_Codigo_ISO: "",
            }));
        }
    };

    const handleSimboloChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            TMO_Simbolo: e.target.value,
        }));
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        const descripcion = formData.TMO_Descripcion.trim();
        const codigoIso = formData.TMO_Codigo_ISO.trim();
        const simbolo = formData.TMO_Simbolo.trim();

        if (!descripcion) {
            nuevosErrores.TMO_Descripcion = "La descripción es obligatoria.";
        } else if (!soloLetrasRegex.test(descripcion)) {
            nuevosErrores.TMO_Descripcion =
                "La descripción solo puede contener letras y espacios.";
        }

        if (!codigoIso) {
            nuevosErrores.TMO_Codigo_ISO = "El código ISO es obligatorio.";
        } else if (!soloLetrasMayusRegex.test(codigoIso)) {
            nuevosErrores.TMO_Codigo_ISO =
                "El código ISO solo puede contener letras.";
        } else if (codigoIso.length !== 3) {
            nuevosErrores.TMO_Codigo_ISO =
                "El código ISO debe tener exactamente 3 letras. Ej. GTQ, USD, EUR.";
        }

        if (!simbolo) {
            nuevosErrores.TMO_Simbolo = "El símbolo es obligatorio.";
        }

        setErrors(nuevosErrores);

        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        setSaving(true);

        try {
            await onSave({
                TMO_Descripcion: formData.TMO_Descripcion.trim(),
                TMO_Codigo_ISO: formData.TMO_Codigo_ISO.trim(),
                TMO_Simbolo: formData.TMO_Simbolo.trim(),
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
                            <Coins size={20} />
                        </div>

                        <h2>
                            {monedaToEdit
                                ? "Editar tipo de moneda"
                                : "Nuevo tipo de moneda"}
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
                            <label htmlFor="tmo-desc">
                                <Coins size={13} /> Descripción
                            </label>

                            <input
                                id="tmo-desc"
                                required
                                value={formData.TMO_Descripcion}
                                onChange={handleDescripcionChange}
                                placeholder="Ej. Quetzal, Dólar, Euro"
                                disabled={saving}
                                maxLength={60}
                            />

                            {errors.TMO_Descripcion && (
                                <small className="input-error">
                                    <AlertCircle size={13} />
                                    {errors.TMO_Descripcion}
                                </small>
                            )}
                        </div>

                        <div className="input-group">
                            <label htmlFor="tmo-iso">
                                <BadgeCheck size={13} /> Código ISO
                            </label>

                            <input
                                id="tmo-iso"
                                required
                                value={formData.TMO_Codigo_ISO}
                                onChange={handleCodigoIsoChange}
                                placeholder="Ej. GTQ, USD, EUR"
                                maxLength={3}
                                disabled={saving}
                                style={{
                                    fontWeight: "700",
                                    letterSpacing: "1px",
                                    textTransform: "uppercase",
                                }}
                            />

                            {errors.TMO_Codigo_ISO && (
                                <small className="input-error">
                                    <AlertCircle size={13} />
                                    {errors.TMO_Codigo_ISO}
                                </small>
                            )}
                        </div>

                        <div className="input-group">
                            <label htmlFor="tmo-simbolo">
                                <Tag size={13} /> Símbolo
                            </label>

                            <input
                                id="tmo-simbolo"
                                required
                                value={formData.TMO_Simbolo}
                                onChange={handleSimboloChange}
                                placeholder="Ej. Q, $, €, £"
                                maxLength={10}
                                disabled={saving}
                                style={{
                                    fontWeight: "700",
                                    fontSize: "1.1rem",
                                    letterSpacing: "1px",
                                }}
                            />

                            {errors.TMO_Simbolo && (
                                <small className="input-error">
                                    <AlertCircle size={13} />
                                    {errors.TMO_Simbolo}
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
                                ? "Guardando..."
                                : monedaToEdit
                                ? "Guardar cambios"
                                : "Crear moneda"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default TipoMonedaModal;