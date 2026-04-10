import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, MapPin, Check } from "lucide-react";

const getTipoDireccionId = (t) =>
  t?.tdI_Tipo_Direccion ?? t?.TDI_Tipo_Direccion ?? t?.tdi_Tipo_Direccion ?? 0;

const getTipoDireccionDesc = (t) =>
  t?.tdI_Descripcion ?? t?.TDI_Descripcion ?? t?.tdi_Descripcion ?? "";

const AddDireccionModal = ({ isOpen, onClose, onSave, tiposDireccion = [] }) => {
  const [form, setForm] = useState({
    TDI_Tipo_Direccion: "",
    DIR_Departamento: "",
    DIR_Municipio: "",
    DIR_Colonia: "",
    DIR_Zona: "",
    DIR_Numero_Casa: "",
    DIR_Detalle: "",
    DIR_Principal: "N"
  });

  useEffect(() => {
    if (isOpen) {
      setForm({
        TDI_Tipo_Direccion: tiposDireccion[0] ? getTipoDireccionId(tiposDireccion[0]) : "",
        DIR_Departamento: "",
        DIR_Municipio: "",
        DIR_Colonia: "",
        DIR_Zona: "",
        DIR_Numero_Casa: "",
        DIR_Detalle: "",
        DIR_Principal: "N"
      });
    }
  }, [isOpen, tiposDireccion]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    await onSave({
      ...form,
      TDI_Tipo_Direccion: Number(form.TDI_Tipo_Direccion)
    });

    setForm({
      TDI_Tipo_Direccion: tiposDireccion[0] ? getTipoDireccionId(tiposDireccion[0]) : "",
      DIR_Departamento: "",
      DIR_Municipio: "",
      DIR_Colonia: "",
      DIR_Zona: "",
      DIR_Numero_Casa: "",
      DIR_Detalle: "",
      DIR_Principal: "N"
    });
  };

  return createPortal(
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon"><MapPin size={20} /></div>
            <div>
              <h2>Agregar dirección</h2>
              <p>Nueva dirección para la persona</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="input-group">
              <label>Tipo dirección *</label>
              <select
                value={form.TDI_Tipo_Direccion}
                onChange={(e) =>
                  setForm({ ...form, TDI_Tipo_Direccion: e.target.value })
                }
              >
                <option value="">Seleccionar...</option>
                {tiposDireccion.map((td) => (
                  <option
                    key={getTipoDireccionId(td)}
                    value={getTipoDireccionId(td)}
                  >
                    {getTipoDireccionDesc(td)}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Principal *</label>
              <select
                value={form.DIR_Principal}
                onChange={(e) =>
                  setForm({ ...form, DIR_Principal: e.target.value })
                }
              >
                <option value="N">No</option>
                <option value="S">Sí</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Departamento *</label>
              <input
                value={form.DIR_Departamento}
                onChange={(e) =>
                  setForm({ ...form, DIR_Departamento: e.target.value })
                }
              />
            </div>

            <div className="input-group">
              <label>Municipio</label>
              <input
                value={form.DIR_Municipio}
                onChange={(e) =>
                  setForm({ ...form, DIR_Municipio: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Colonia</label>
              <input
                value={form.DIR_Colonia}
                onChange={(e) =>
                  setForm({ ...form, DIR_Colonia: e.target.value })
                }
              />
            </div>

            <div className="input-group">
              <label>Zona</label>
              <input
                value={form.DIR_Zona}
                onChange={(e) =>
                  setForm({ ...form, DIR_Zona: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Número casa</label>
              <input
                value={form.DIR_Numero_Casa}
                onChange={(e) =>
                  setForm({ ...form, DIR_Numero_Casa: e.target.value })
                }
              />
            </div>

            <div className="input-group">
              <label>Detalle</label>
              <input
                value={form.DIR_Detalle}
                onChange={(e) =>
                  setForm({ ...form, DIR_Detalle: e.target.value })
                }
              />
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

export default AddDireccionModal;