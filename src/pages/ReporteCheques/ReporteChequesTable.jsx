const g = (o, ...ks) => {
  for (const k of ks) {
    const v = o?.[k];
    if (v !== undefined && v !== null) return v;
  }
  return "";
};

const getMonedaTexto = (item) =>
  String(
    g(
      item,
      "tipoMoneda",
      "TipoMoneda",
      "tmO_Descripcion",
      "tMO_Descripcion",
      "TMO_Descripcion",
      "moneda",
      "Moneda"
    )
  ).toLowerCase();

const getSimboloMoneda = (item) => {
  const moneda = getMonedaTexto(item);

  if (
    moneda.includes("dólar") ||
    moneda.includes("dolar") ||
    moneda.includes("usd")
  ) {
    return "$";
  }

  return "Q";
};

const formatMoney = (value, item = {}) =>
  `${getSimboloMoneda(item)} ${Number(value ?? 0).toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (fecha) => {
  if (!fecha) return "—";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-GT");
};

const estadoClass = (estado) => {
  const e = String(estado || "").toLowerCase();

  if (e.includes("cobrado") || e.includes("depositado")) return "pill-green";
  if (e.includes("cancelado") || e.includes("rechazado")) return "pill-red";
  if (e.includes("emitido") || e.includes("activo")) return "pill-blue";
  if (e.includes("pendiente")) return "pill-amber";

  return "pill-gray";
};

function ReporteChequesTable({ data = [] }) {
  if (!data.length) {
    return (
      <div className="table-container">
        <div className="empty-state">No se encontraron cheques.</div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-scroll">
        <table className="custom-table">
          <thead>
            <tr>
              <th>#</th>
              <th>No. Cheque</th>
              <th>Cuenta</th>
              <th>Beneficiario</th>
              <th>Concepto</th>
              <th>Monto</th>
              <th>Emisión</th>
              <th>Vencimiento</th>
              <th>Cobro</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => {
              const estado = g(
                item,
                "estadoCheque",
                "EstadoCheque",
                "esC_Descripcion",
                "eSC_Descripcion",
                "ESC_Descripcion"
              );

              return (
                <tr key={g(item, "chE_Cheque", "cHE_Cheque", "CHE_Cheque") || index}>
                  <td style={{ color: "#cbd5e1", fontSize: 11, fontWeight: 600 }}>
                    {index + 1}
                  </td>

                  <td>
                    <code className="report-code">
                      {g(item, "chE_Numero_Cheque", "cHE_Numero_Cheque", "CHE_Numero_Cheque") || "—"}
                    </code>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600 }}>
                      {g(item, "cuentaTexto") || "—"}
                    </div>
                  </td>

                  <td>{g(item, "beneficiario", "Beneficiario", "persona", "Persona") || "—"}</td>

                  <td className="description-cell">
                    {g(item, "chE_Concepto", "cHE_Concepto", "CHE_Concepto") || "—"}
                  </td>

                  <td className="money money-red">
                    {formatMoney(
                      Math.abs(
                        Number(
                          g(item, "moV_Monto", "mOV_Monto", "MOV_Monto") || 0
                        )
                      ),
                      item
                    )}
                  </td>

                  <td>{formatDate(g(item, "chE_Fecha_Emision", "cHE_Fecha_Emision", "CHE_Fecha_Emision"))}</td>

                  <td>{formatDate(g(item, "chE_Fecha_Vencimiento", "cHE_Fecha_Vencimiento", "CHE_Fecha_Vencimiento"))}</td>

                  <td>{formatDate(g(item, "chE_Fecha_Cobro", "cHE_Fecha_Cobro", "CHE_Fecha_Cobro"))}</td>

                  <td>
                    <span className={`status-pill ${estadoClass(estado)}`}>
                      {estado || "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReporteChequesTable;