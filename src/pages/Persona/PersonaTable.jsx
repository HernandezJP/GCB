import React from "react";
import { Eye, Edit2, Trash2 } from "lucide-react";

const getId = (p) =>
  p?.peR_Persona ?? p?.PER_Persona ?? p?.per_Persona ?? p?.per_persona ?? 0;

const getEstado = (p) =>
  p?.peR_Estado ?? p?.PER_Estado ?? p?.per_Estado ?? p?.per_estado ?? "A";

const getNit = (p) =>
  p?.peR_NIT ?? p?.PER_NIT ?? p?.per_NIT ?? p?.per_nit ?? "";

const getDpi = (p) =>
  p?.peR_DPI ?? p?.PER_DPI ?? p?.per_DPI ?? p?.per_dpi ?? "";

const getTipoPersona = (p) =>
  p?.tipoPersonaDescripcion ??
  p?.TipoPersonaDescripcion ??
  p?.tipo_persona_descripcion ??
  "";

const getNombreCompleto = (p) => {
  const nombreApi =
    p?.nombreCompleto ??
    p?.NombreCompleto ??
    p?.nombre_completo ??
    "";

  if (String(nombreApi).trim()) return nombreApi;

  return `${p?.peR_Primer_Nombre ?? p?.PER_Primer_Nombre ?? ""} ${p?.peR_Segundo_Nombre ?? p?.PER_Segundo_Nombre ?? ""} ${p?.peR_Primer_Apellido ?? p?.PER_Primer_Apellido ?? ""} ${p?.peR_Segundo_Apellido ?? p?.PER_Segundo_Apellido ?? ""}`
    .replace(/\s+/g, " ")
    .trim();
};

const PersonaTable = ({ personas, onView, onEdit, onDelete }) => {
  if (!personas || personas.length === 0) {
    return <div className="empty-state">No se encontraron personas.</div>;
  }

  return (
    <div className="table-container">
      <div className="table-scroll">
        <table className="custom-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>NIT</th>
              <th>DPI</th>
              <th>Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {personas.map((p, idx) => {
              const id = getId(p);
              const activo = getEstado(p) === "A";

              return (
                <tr
                  key={id || `row-${idx}`}
                  className={activo ? "row-active" : "row-inactive"}
                  onClick={() => onView && onView(p)}
                  style={{ cursor: "pointer" }}
                >
                  <td style={{ color: "#cbd5e1", fontSize: 11, fontWeight: 600 }}>
                    {idx + 1}
                  </td>

                  <td style={{ fontWeight: 500 }}>
                    {getNombreCompleto(p) || "—"}
                  </td>

                  <td>{getTipoPersona(p) || "—"}</td>
                  <td>{getNit(p) || "—"}</td>
                  <td>{getDpi(p) || "—"}</td>

                  <td>
                    <span className={`status-pill ${activo ? "pill-green" : "pill-red"}`}>
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: activo ? "#22c55e" : "#ef4444",
                          display: "inline-block",
                        }}
                      />
                      {activo ? "Activa" : "Inactiva"}
                    </span>
                  </td>

                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="action-buttons">
                      <button
                        className="icon-btn view"
                        title="Ver detalle"
                        onClick={() => onView && onView(p)}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="icon-btn edit"
                        title="Editar"
                        onClick={() => onEdit && onEdit(p)}
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        className="icon-btn toggle-on"
                        title="Desactivar"
                        onClick={() => onDelete && onDelete(id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PersonaTable;