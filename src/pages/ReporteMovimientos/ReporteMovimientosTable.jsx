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

const getTipoClass = (tipo) => {
    const value = String(tipo ?? "").toLowerCase();

    if (value.includes("ingreso")) return "pill-green";
    if (value.includes("egreso") || value.includes("retiro")) return "pill-red";
    if (value.includes("transferencia")) return "pill-amber";

    return "pill-gray";
};

const getEstadoClass = (estado) => {
    const value = String(estado ?? "").toLowerCase();

    if (value.includes("activo") || value.includes("aplicado")) return "pill-green";
    if (value.includes("anulado")) return "pill-red";
    if (value.includes("pendiente")) return "pill-amber";

    return "pill-gray";
};

export default function ReporteMovimientosTable({ data }) {
    if (!data.length) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    No se encontraron movimientos.
                </div>
            </div>
        );
    }

    return (
        <div className="table-container">
            <div className="table-scroll">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>No. Cuenta</th>
                            <th>Persona</th>
                            <th>Tipo</th>
                            <th>Medio</th>
                            <th>Descripción</th>
                            <th>Referencia</th>
                            <th>Débito</th>
                            <th>Crédito</th>
                            <th>Recargo</th>
                            <th>Saldo</th>
                            <th>Estado</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((item, index) => {
                            const tipo = getValue(item, ["tipoMovimiento", "TipoMovimiento"]);
                            const estado = getValue(item, ["estadoMovimiento", "EstadoMovimiento"]);

                            const monto = Number(
                                getValue(item, ["moV_Monto", "mOV_Monto", "mov_monto"]) || 0
                            );

                            const esIngreso = String(tipo)
                                .toLowerCase()
                                .includes("ingreso");

                            const debito = esIngreso ? 0 : monto;
                            const credito = esIngreso ? monto : 0;

                            return (
                                <tr
                                    key={
                                        getValue(item, [
                                            "moV_Movimiento",
                                            "mOV_Movimiento",
                                            "mov_movimiento",
                                        ]) || index
                                    }
                                >
                                    <td>
                                        {formatDate(
                                            getValue(item, [
                                                "moV_Fecha",
                                                "mOV_Fecha",
                                                "mov_fecha",
                                            ])
                                        )}
                                    </td>

                                    <td>
                                        <code className="report-code">
                                            {getValue(item, [
                                                "cuB_Numero_Cuenta",
                                                "cUB_Numero_Cuenta",
                                                "cub_numero_cuenta",
                                            ]) || "—"}
                                        </code>
                                    </td>

                                    <td>
                                        {getValue(item, ["persona", "Persona"]) || "—"}
                                    </td>

                                    <td>
                                        <span
                                            className={`status-pill ${getTipoClass(tipo)}`}
                                        >
                                            {tipo || "—"}
                                        </span>
                                    </td>

                                    <td>
                                        {getValue(item, [
                                            "medioMovimiento",
                                            "MedioMovimiento",
                                        ]) || "—"}
                                    </td>

                                    <td className="description-cell">
                                        {getValue(item, [
                                            "moV_Descripcion",
                                            "mOV_Descripcion",
                                            "mov_descripcion",
                                        ]) || "—"}
                                    </td>

                                    <td>
                                        <code className="report-code">
                                            {getValue(item, [
                                                "moV_Numero_Referencia",
                                                "mOV_Numero_Referencia",
                                                "mov_numero_referencia",
                                            ]) || "—"}
                                        </code>
                                    </td>

                                    <td className="money money-red">
                                        {debito > 0
                                            ? formatMoney(debito)
                                            : "—"}
                                    </td>

                                    <td className="money money-green">
                                        {credito > 0
                                            ? formatMoney(credito)
                                            : "—"}
                                    </td>

                                    <td className="money">
                                        {formatMoney(
                                            getValue(item, [
                                                "moV_Recargo",
                                                "mOV_Recargo",
                                                "mov_recargo",
                                            ])
                                        )}
                                    </td>

                                    <td className="money money-strong">
                                        {formatMoney(
                                            getValue(item, [
                                                "moV_Saldo",
                                                "mOV_Saldo",
                                                "mov_saldo",
                                            ])
                                        )}
                                    </td>

                                    <td>
                                        <span
                                            className={`status-pill ${getEstadoClass(
                                                estado
                                            )}`}
                                        >
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