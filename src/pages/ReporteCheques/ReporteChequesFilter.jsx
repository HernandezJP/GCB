import { Search } from "lucide-react";

const g = (o, ...ks) => {
  for (const k of ks) {
    const v = o?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return "";
};

const getPeriodoActual = () => {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
};

const getTitularCuenta = (c) => {
  const directo = g(
    c,
    "titular",
    "Titular",
    "nombreTitular",
    "NombreTitular",
    "nombreCompleto",
    "NombreCompleto",
    "cUB_Nombre_Completo",
    "cuB_Nombre_Completo",
    "CUB_Nombre_Completo",
    "per_Nombre_Completo",
    "peR_Nombre_Completo",
    "PER_Nombre_Completo",
    "persona",
    "Persona",
    "beneficiario",
    "Beneficiario"
  );

  if (directo) return directo;

  return [
    g(c, "primerNombre", "PrimerNombre", "cuB_Primer_Nombre", "cUB_Primer_Nombre", "CUB_Primer_Nombre", "peR_Primer_Nombre", "per_Primer_Nombre", "PER_Primer_Nombre"),
    g(c, "segundoNombre", "SegundoNombre", "cuB_Segundo_Nombre", "cUB_Segundo_Nombre", "CUB_Segundo_Nombre", "peR_Segundo_Nombre", "per_Segundo_Nombre", "PER_Segundo_Nombre"),
    g(c, "primerApellido", "PrimerApellido", "cuB_Primer_Apellido", "cUB_Primer_Apellido", "CUB_Primer_Apellido", "peR_Primer_Apellido", "per_Primer_Apellido", "PER_Primer_Apellido"),
    g(c, "segundoApellido", "SegundoApellido", "cuB_Segundo_Apellido", "cUB_Segundo_Apellido", "CUB_Segundo_Apellido", "peR_Segundo_Apellido", "per_Segundo_Apellido", "PER_Segundo_Apellido"),
  ]
    .filter(Boolean)
    .join(" ");
};

function ReporteChequesFilter({
  filtros,
  setFiltros,
  cuentas = [],
  estadosCheque = [],
  onBuscar,
}) {
  const handleChange = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value,
    });
  };

  const limpiarFiltros = () => {
    setFiltros({
      cuentaId: "",
      estadoChequeId: "",
      modoFecha: "mes",
      periodo: getPeriodoActual(),
      fechaInicio: "",
      fechaFin: "",
      busqueda: "",
    });
  };

  return (
    <div className="toolbar reporte-toolbar">
      <div className="input-group filtro-select">
        <label>Cuenta bancaria</label>

        <select
          name="cuentaId"
          value={filtros.cuentaId}
          onChange={handleChange}
        >
          <option value="">Todas las cuentas</option>

          {cuentas.map((c, idx) => {
            const id = g(c, "cuB_Cuenta", "cUB_Cuenta", "CUB_Cuenta");
            const numero = g(
              c,
              "cuB_Numero_Cuenta",
              "cUB_Numero_Cuenta",
              "CUB_Numero_Cuenta"
            );
            const banco = g(
              c,
              "bAN_Nombre",
              "baN_Nombre",
              "BAN_Nombre",
              "ban_Nombre",
              "banco",
              "Banco"
            );

            const titular = getTitularCuenta(c);

            return (
              <option key={id || idx} value={id}>
                {[numero || "Sin cuenta", banco, titular]
                  .filter(Boolean)
                  .join(" • ")}
              </option>
            );
          })}
        </select>
      </div>

      <div className="input-group filtro-select">
        <label>Tipo de periodo</label>
        <select name="modoFecha" value={filtros.modoFecha} onChange={handleChange}>
          <option value="mes">Por mes</option>
          <option value="rango">Rango personalizado</option>
        </select>
      </div>

      {filtros.modoFecha === "mes" ? (
        <div className="input-group filtro-select">
          <label>Mes</label>
          <input
            type="month"
            name="periodo"
            value={filtros.periodo}
            onChange={handleChange}
          />
        </div>
      ) : (
        <>
          <div className="input-group filtro-select">
            <label>Fecha inicio</label>
            <input
              type="date"
              name="fechaInicio"
              value={filtros.fechaInicio}
              onChange={handleChange}
            />
          </div>

          <div className="input-group filtro-select">
            <label>Fecha fin</label>
            <input
              type="date"
              name="fechaFin"
              value={filtros.fechaFin}
              onChange={handleChange}
            />
          </div>
        </>
      )}

      <div className="input-group filtro-select">
        <label>Estado cheque</label>
        <select
          name="estadoChequeId"
          value={filtros.estadoChequeId}
          onChange={handleChange}
        >
          <option value="">Todos los estados</option>

          {estadosCheque.map((e, idx) => {
            const id = g(
              e,
              "esC_Estado_Cheque",
              "eSC_Estado_Cheque",
              "ESC_Estado_Cheque"
            );

            const desc = g(
              e,
              "esC_Descripcion",
              "eSC_Descripcion",
              "ESC_Descripcion"
            );

            return (
              <option key={id || idx} value={id}>
                {desc || "Sin descripción"}
              </option>
            );
          })}
        </select>
      </div>

      <div className="search-bar reporte-search">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          name="busqueda"
          placeholder="Buscar por cheque, beneficiario, cuenta o concepto..."
          value={filtros.busqueda}
          onChange={handleChange}
        />
      </div>

      <div className="reporte-filter-actions">
        <button className="btn-secondary" onClick={limpiarFiltros} type="button">
          Limpiar
        </button>

        <button className="btn-primary" onClick={onBuscar} type="button">
          Buscar
        </button>
      </div>
    </div>
  );
}

export default ReporteChequesFilter;