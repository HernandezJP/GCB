import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Phone, Check } from "lucide-react";

const getTipoTelefonoId = (t) =>
  t?.tiT_Tipo_Telefono ?? t?.TIT_Tipo_Telefono ?? t?.tit_Tipo_Telefono ?? 0;

const getTipoTelefonoDesc = (t) =>
  t?.tiT_Descripcion ?? t?.TIT_Descripcion ?? t?.tit_Descripcion ?? "";

const AddTelefonoModal = ({ isOpen, onClose, onSave, tiposTelefono = [] }) => {
  const [form, setForm] = useState({
    TIT_Tipo_Telefono: "",
    TEP_Numero: "",
    TEP_Principal: "N",
    TEP_Estado: "A"
  });

  useEffect(() => {
    if (isOpen) {
      setForm({
        TIT_Tipo_Telefono: tiposTelefono[0] ? getTipoTelefonoId(tiposTelefono[0]) : "",
        TEP_Numero: "",
        TEP_Principal: "N",
        TEP_Estado: "A"
      });
    }
  }, [isOpen, tiposTelefono]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    await onSave({
      ...form,
      TIT_Tipo_Telefono: Number(form.TIT_Tipo_Telefono)
    });

    setForm({
      TIT_Tipo_Telefono: tiposTelefono[0] ? getTipoTelefonoId(tiposTelefono[0]) : "",
      TEP_Numero: "",
      TEP_Principal: "N",
      TEP_Estado: "A"
    });
  };

  return createPortal(
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon"><Phone size={20} /></div>
            <div>
              <h2>Agregar teléfono</h2>
              <p>Nuevo teléfono para la persona</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="input-group">
              <label>Tipo teléfono *</label>
              <select
                value={form.TIT_Tipo_Telefono}
                onChange={(e) =>
                  setForm({ ...form, TIT_Tipo_Telefono: e.target.value })
                }
              >
                <option value="">Seleccionar...</option>
                {tiposTelefono.map((tt) => (
                  <option
                    key={getTipoTelefonoId(tt)}
                    value={getTipoTelefonoId(tt)}
                  >
                    {getTipoTelefonoDesc(tt)}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Principal *</label>
              <select
                value={form.TEP_Principal}
                onChange={(e) =>
                  setForm({ ...form, TEP_Principal: e.target.value })
                }
              >
                <option value="N">No</option>
                <option value="S">Sí</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Número *</label>
              <input
                value={form.TEP_Numero}
                onChange={(e) =>
                  setForm({ ...form, TEP_Numero: e.target.value })
                }
                placeholder="Ingrese el número"
              />
            </div>

            <div className="input-group">
              <label>Estado *</label>
              <select
                value={form.TEP_Estado}
                onChange={(e) =>
                  setForm({ ...form, TEP_Estado: e.target.value })
                }
              >
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-save" onClick={handleSubmit}>
            <Check size={14} />
            Guardar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddTelefonoModal;