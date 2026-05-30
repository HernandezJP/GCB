export default function ReporteConciliacionTable({ data }) {
    const formatMoney = (value) =>
        `Q ${Number(value ?? 0).toFixed(2)}`;

    const formatDate = (value) => {
        if (!value) return "-";
        return new Date(value).toLocaleString("es-GT");
    };

    const getEstadoClass = (estado) => {
        if (!estado) return "pill-gray";

        const value = estado.toLowerCase();

        if (value.includes("conciliada") || value.includes("cerrada")) {
            return "pill-green";
        }

        if (value.includes("diferencia")) {
            return "pill-red";
        }

        if (value.includes("pendiente") || value.includes("proceso")) {
            return "pill-amber";
        }

        return "pill-gray";
    };

    if (!data.length) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    No se encontraron conciliaciones.
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
                            <th>No. Cuenta</th>
                            <th>Banco</th>
                            <th>Periodo</th>
                            <th>Saldo Banco</th>
                            <th>Saldo Libros</th>
                            <th>Diferencia</th>
                            <th>Estado</th>
                            <th>Conciliados</th>
                            <th>Pend. Banco</th>
                            <th>Pend. Libros</th>
                            <th>En Tránsito</th>
                            <th>Diferencias</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((item, index) => (
                            <tr key={item.coN_Conciliacion ?? index}>
                                <td>{item.cuB_Numero_Cuenta}</td>
                                <td>{item.banco}</td>
                                <td>{item.coN_Periodo}</td>
                                <td>{formatMoney(item.coN_Saldo_Banco)}</td>
                                <td>{formatMoney(item.coN_Saldo_Libros)}</td>
                                <td>{formatMoney(item.coN_Diferencia)}</td>
                                <td>
                                    <span
                                        className={`status-pill ${getEstadoClass(
                                            item.estadoConciliacion
                                        )}`}
                                    >
                                        {item.estadoConciliacion}
                                    </span>
                                </td>
                                <td>{item.totalConciliados}</td>
                                <td>{item.totalPendientesBanco}</td>
                                <td>{item.totalPendientesLibros}</td>
                                <td>{item.totalEnTransito}</td>
                                <td>{item.totalDiferencias}</td>
                                <td>{formatDate(item.coN_Fecha_Conciliacion)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}