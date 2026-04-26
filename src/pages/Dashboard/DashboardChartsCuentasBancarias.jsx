import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    CartesianGrid,
} from "recharts";

const COLORS = ["#0284c7", "#15803d", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];

const formatMoney = (value) =>
    `Q ${Number(value ?? 0).toLocaleString("es-GT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export default function DashboardCharts({ cuentas }) {
    const cuentasPorBanco = Object.values(
        cuentas.reduce((acc, item) => {
            const banco = item.banco || "Sin banco";

            acc[banco] = acc[banco] || {
                banco,
                total: 0,
            };

            acc[banco].total += 1;
            return acc;
        }, {})
    );

    const saldoPorBanco = Object.values(
        cuentas.reduce((acc, item) => {
            const banco = item.banco || "Sin banco";

            acc[banco] = acc[banco] || {
                banco,
                saldo: 0,
            };

            acc[banco].saldo += Number(item.cuB_Saldo_Actual ?? 0);
            return acc;
        }, {})
    );

    const tiposCuenta = Object.values(
        cuentas.reduce((acc, item) => {
            const tipo = item.tipoCuenta || "Sin tipo";

            acc[tipo] = acc[tipo] || {
                name: tipo,
                value: 0,
            };

            acc[tipo].value += 1;
            return acc;
        }, {})
    );

    const estadosRegistro = [
        {
            name: "Activas",
            value: cuentas.filter(x => x.cuB_Estado === "A").length,
        },
        {
            name: "Inactivas",
            value: cuentas.filter(x => x.cuB_Estado === "I").length,
        },
    ];

    if (!cuentas.length) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    No hay información suficiente para mostrar gráficas.
                </div>
            </div>
        );
    }

    return (
        <div className="charts-grid">
            <div className="chart-card">
                <div className="chart-header">
                    <h3>Cuentas por Banco</h3>
                    <span>Cantidad de cuentas registradas por banco</span>
                </div>

                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={cuentasPorBanco}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="banco" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="total" name="Cuentas" fill="#0284c7" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card">
                <div className="chart-header">
                    <h3>Saldo por Banco</h3>
                    <span>Saldo actual acumulado por banco</span>
                </div>

                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={saldoPorBanco}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="banco" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(value) => `Q${Number(value).toLocaleString("es-GT")}`} />
                        <Tooltip formatter={(value) => formatMoney(value)} />
                        <Bar dataKey="saldo" name="Saldo" fill="#15803d" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card">
                <div className="chart-header">
                    <h3>Tipos de Cuenta</h3>
                    <span>Distribución por tipo de cuenta bancaria</span>
                </div>

                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={tiposCuenta}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={3}
                        >
                            {tiposCuenta.map((_, index) => (
                                <Cell
                                    key={index}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card">
                <div className="chart-header">
                    <h3>Estado de Registro</h3>
                    <span>Cuentas activas e inactivas en el sistema</span>
                </div>

                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={estadosRegistro}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={4}
                        >
                            <Cell fill="#15803d" />
                            <Cell fill="#dc2626" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}