export default function ReporteCuentaBancariaTable({ data }) {
    const formatMoney = (value) => {
        return `Q ${Number(value ?? 0).toFixed(2)}`;
    };

    const getEstadoClass = (estado) => {
        if (!estado) return "pill-gray";

        const value = estado.toLowerCase();

        if (value.includes("activa")) return "pill-green";
        if (value.includes("inactiva")) return "pill-red";
        if (value.includes("bloqueada")) return "pill-amber";

        return "pill-gray";
    };

    const getRegistroClass = (estadoRegistro) => {
        if (estadoRegistro === "A") return "pill-green";
        if (estadoRegistro === "I") return "pill-red";

        return "pill-gray";
    };

    const getRegistroTexto = (estadoRegistro) => {
        if (estadoRegistro === "A") return "Activo";
        if (estadoRegistro === "I") return "Inactivo";

        return "No definido";
    };

    if (!data.length) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    No se encontraron cuentas bancarias.
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
                            <th>Titular</th>
                            <th>Tipo de Cuenta</th>
                            <th>Moneda</th>
                            <th>Saldo Inicial</th>
                            <th>Saldo Actual</th>
                            <th>Estado Cuenta</th>
                            <th>Registro</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((item, index) => (
                            <tr
                                key={item.cuB_Cuenta ?? index}
                                className={
                                    item.cuB_Estado === "I"
                                        ? "row-inactive"
                                        : ""
                                }
                            >
                                <td>{item.cuB_Numero_Cuenta}</td>
                                <td>{item.banco}</td>
                                <td>{item.titular}</td>
                                <td>{item.tipoCuenta}</td>
                                <td>{item.tipoMoneda}</td>
                                <td>{formatMoney(item.cuB_Saldo_Inicial)}</td>
                                <td>{formatMoney(item.cuB_Saldo_Actual)}</td>
                                <td>
                                    <span
                                        className={`status-pill ${getEstadoClass(
                                            item.estadoCuenta
                                        )}`}
                                    >
                                        {item.estadoCuenta}
                                    </span>
                                </td>
                                <td>
                                    <span
                                        className={`status-pill ${getRegistroClass(
                                            item.cuB_Estado
                                        )}`}
                                    >
                                        {getRegistroTexto(item.cuB_Estado)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}