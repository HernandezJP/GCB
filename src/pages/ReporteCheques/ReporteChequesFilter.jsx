import { Search } from "lucide-react";

const g = (o, ...ks) => {
  for (const k of ks) {
    const v = o?.[k];
    if (v !== undefined && v !== null) return v;
  }
  return "";
};

const getPeriodoActual = () => {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
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
        <select name="cuentaId" value={filtros.cuentaId} onChange={handleChange}>
          <option value="">Todas las cuentas</option>
          {cuentas.map((c, idx) => {
            const id = g(c, "cuB_Cuenta", "cUB_Cuenta", "CUB_Cuenta");
            const numero = g(c, "cuB_Numero_Cuenta", "cUB_Numero_Cuenta", "CUB_Numero_Cuenta");
            const banco = g(c, "bAN_Nombre", "baN_Nombre", "BAN_Nombre", "banco", "Banco");

            return (
              <option key={id || idx} value={id}>
                {numero || "Sin cuenta"} {banco ? `• ${banco}` : ""}
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
          <input type="month" name="periodo" value={filtros.periodo} onChange={handleChange} />
        </div>
      ) : (
        <>
          <div className="input-group filtro-select">
            <label>Fecha inicio</label>
            <input type="date" name="fechaInicio" value={filtros.fechaInicio} onChange={handleChange} />
          </div>

          <div className="input-group filtro-select">
            <label>Fecha fin</label>
            <input type="date" name="fechaFin" value={filtros.fechaFin} onChange={handleChange} />
          </div>
        </>
      )}

      <div className="input-group filtro-select">
        <label>Estado cheque</label>
        <select name="estadoChequeId" value={filtros.estadoChequeId} onChange={handleChange}>
          <option value="">Todos los estados</option>
          {estadosCheque.map((e, idx) => {
            const id = g(e, "esC_Estado_Cheque", "eSC_Estado_Cheque", "ESC_Estado_Cheque");
            const desc = g(e, "esC_Descripcion", "eSC_Descripcion", "ESC_Descripcion");

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