const getValue = (obj, keys) => {
    for (const key of keys) {
        if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
    }
    return "";
};

const formatDate = (fecha) => {
    if (!fecha) return "";

    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("es-GT");
};

const getEstadoClass = (estado) => {
    const value = String(estado ?? "").toLowerCase();

    if (value === "a" || value.includes("activa")) return "pill-green";
    if (value === "i" || value.includes("anulada") || value.includes("inactiva")) return "pill-red";
    if (value.includes("pendiente")) return "pill-amber";
    if (value.includes("agotada")) return "pill-red";

    return "pill-gray";
};

const getEstadoTexto = (estado) => {
    if (estado === "A") return "Activa";
    if (estado === "I") return "Inactiva";
    return estado || "—";
};

export default function ReporteChequeraTable({ data }) {
    if (!data.length) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    No se encontraron chequeras.
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
                            <th>ID</th>
                            <th>Cuenta</th>
                            <th>Serie</th>
                            <th>Desde</th>
                            <th>Hasta</th>
                            <th>Último Usado</th>
                            <th>Total</th>
                            <th>Usados</th>
                            <th>Disponibles</th>
                            <th>Estado</th>
                            <th>F. Recepción</th>
                            <th>F. Creación</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((item, index) => {
                            const estado = getValue(item, [
                                "chQ_Estado",
                                "CHQ_Estado",
                                "estadoChequera",
                                "EstadoChequera",
                            ]);

                            return (
                                <tr
                                    key={
                                        getValue(item, [
                                            "chQ_Chequera",
                                            "CHQ_Chequera",
                                        ]) || index
                                    }
                                >
                                    <td>
                                        {getValue(item, [
                                            "chQ_Chequera",
                                            "CHQ_Chequera",
                                        ]) || "—"}
                                    </td>

                                    <td>
                                        <code className="report-code">
                                            {getValue(item, [
                                                "cuB_Cuenta",
                                                "CUB_Cuenta",
                                            ]) || "—"}
                                        </code>
                                    </td>

                                    <td>
                                        {getValue(item, [
                                            "chQ_Serie",
                                            "CHQ_Serie",
                                        ]) || "—"}
                                    </td>

                                    <td>
                                        {getValue(item, [
                                            "chQ_Numero_Desde",
                                            "CHQ_Numero_Desde",
                                        ]) || "—"}
                                    </td>

                                    <td>
                                        {getValue(item, [
                                            "chQ_Numero_Hasta",
                                            "CHQ_Numero_Hasta",
                                        ]) || "—"}
                                    </td>

                                    <td>
                                        {getValue(item, [
                                            "chQ_Ultimo_Usado",
                                            "CHQ_Ultimo_Usado",
                                        ]) || "0"}
                                    </td>

                                    <td>
                                        {getValue(item, [
                                            "totalCheques",
                                            "TotalCheques",
                                        ]) || "0"}
                                    </td>

                                    <td>
                                        {getValue(item, [
                                            "chequesUsados",
                                            "ChequesUsados",
                                        ]) || "0"}
                                    </td>

                                    <td>
                                        {getValue(item, [
                                            "chequesDisponibles",
                                            "ChequesDisponibles",
                                        ]) || "0"}
                                    </td>

                                    <td>
                                        <span className={`status-pill ${getEstadoClass(estado)}`}>
                                            {getEstadoTexto(estado)}
                                        </span>
                                    </td>

                                    <td>
                                        {formatDate(
                                            getValue(item, [
                                                "chQ_Fecha_Recepcion",
                                                "CHQ_Fecha_Recepcion",
                                            ])
                                        ) || "—"}
                                    </td>

                                    <td>
                                        {formatDate(
                                            getValue(item, [
                                                "chQ_Fecha_Creacion",
                                                "CHQ_Fecha_Creacion",
                                            ])
                                        ) || "—"}
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