const getValue = (obj, keys) => {
    for (const key of keys) {
        if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
    }
    return "";
};

const formatMoney = (value) => {
    return `Q ${Number(value ?? 0).toFixed(2)}`;
};

const formatDate = (fecha) => {
    if (!fecha) return "";

    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("es-GT");
};

const getEstadoClass = (estado) => {
    const value = String(estado ?? "").toLowerCase();

    if (value.includes("cobrado") || value.includes("activo")) return "pill-green";
    if (value.includes("cancelado") || value.includes("anulado")) return "pill-red";
    if (value.includes("pendiente")) return "pill-amber";

    return "pill-gray";
};

export default function ReporteChequesTable({ data }) {
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
                            <th>ID</th>
                            <th>Cuenta</th>
                            <th>Chequera</th>
                            <th>No. Cheque</th>
                            <th>Beneficiario</th>
                            <th>Monto</th>
                            <th>Monto Letras</th>
                            <th>Concepto</th>
                            <th>Estado</th>
                            <th>F. Emisión</th>
                            <th>F. Cobro</th>
                            <th>F. Vencimiento</th>
                            <th>Saldo</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((item, index) => {
                            const estado = getValue(item, ["estadoCheque", "EstadoCheque"]);

                            return (
                                <tr key={getValue(item, ["chE_Cheque", "CHE_Cheque"]) || index}>
                                    <td>{getValue(item, ["chE_Cheque", "CHE_Cheque"]) || "—"}</td>

                                    <td>
                                        <code className="report-code">
                                            {getValue(item, ["cuB_Cuenta", "CUB_Cuenta"]) || "—"}
                                        </code>
                                    </td>

                                    <td>{getValue(item, ["chQ_Chequera", "CHQ_Chequera"]) || "—"}</td>

                                    <td>
                                        <code className="report-code">
                                            {getValue(item, ["chE_Numero_Cheque", "CHE_Numero_Cheque"]) || "—"}
                                        </code>
                                    </td>

                                    <td>{getValue(item, ["beneficiario", "Beneficiario"]) || "—"}</td>

                                    <td>{formatMoney(getValue(item, ["moV_Monto", "MOV_Monto"]))}</td>

                                    <td>{getValue(item, ["chE_Monto_Letras", "CHE_Monto_Letras"]) || "—"}</td>

                                    <td>{getValue(item, ["chE_Concepto", "CHE_Concepto"]) || "—"}</td>

                                    <td>
                                        <span className={`status-pill ${getEstadoClass(estado)}`}>
                                            {estado || "—"}
                                        </span>
                                    </td>

                                    <td>{formatDate(getValue(item, ["chE_Fecha_Emision", "CHE_Fecha_Emision"])) || "—"}</td>
                                    <td>{formatDate(getValue(item, ["chE_Fecha_Cobro", "CHE_Fecha_Cobro"])) || "—"}</td>
                                    <td>{formatDate(getValue(item, ["chE_Fecha_Vencimiento", "CHE_Fecha_Vencimiento"])) || "—"}</td>

                                    <td>{formatMoney(getValue(item, ["moV_Saldo", "MOV_Saldo"]))}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}