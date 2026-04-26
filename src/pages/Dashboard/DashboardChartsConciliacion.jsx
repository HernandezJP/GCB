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

const COLORS = ["#15803d", "#d97706", "#dc2626", "#0284c7"];

const formatMoney = (value) =>
    `Q ${Number(value ?? 0).toLocaleString("es-GT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export default function DashboardConciliacionCharts({ conciliaciones }) {
    const diferenciasPorBanco = Object.values(
        conciliaciones.reduce((acc, item) => {
            const banco = item.banco || "Sin banco";

            acc[banco] = acc[banco] || {
                banco,
                diferencia: 0,
            };

            acc[banco].diferencia += Number(item.coN_Diferencia ?? 0);
            return acc;
        }, {})
    );

    const movimientosConciliacion = [
        {
            name: "Conciliados",
            value: conciliaciones.reduce(
                (acc, item) => acc + Number(item.totalConciliados ?? 0),
                0
            ),
        },
        {
            name: "Pendientes Banco",
            value: conciliaciones.reduce(
                (acc, item) => acc + Number(item.totalPendientesBanco ?? 0),
                0
            ),
        },
        {
            name: "Pendientes Libros",
            value: conciliaciones.reduce(
                (acc, item) => acc + Number(item.totalPendientesLibros ?? 0),
                0
            ),
        },
        {
            name: "Diferencias",
            value: conciliaciones.reduce(
                (acc, item) => acc + Number(item.totalDiferencias ?? 0),
                0
            ),
        },
    ];

    const conciliacionesPorEstado = Object.values(
        conciliaciones.reduce((acc, item) => {
            const estado = item.estadoConciliacion || "Sin estado";

            acc[estado] = acc[estado] || {
                name: estado,
                value: 0,
            };

            acc[estado].value += 1;
            return acc;
        }, {})
    );

    if (!conciliaciones.length) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    No hay información suficiente para mostrar gráficas de conciliación.
                </div>
            </div>
        );
    }

    return (
        <div className="charts-grid">
            <div className="chart-card">
                <div className="chart-header">
                    <h3>Diferencias por Banco</h3>
                    <span>Diferencia acumulada entre saldo banco y saldo libros</span>
                </div>

                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={diferenciasPorBanco}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="banco" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(value) => `Q${Number(value).toLocaleString("es-GT")}`} />
                        <Tooltip formatter={(value) => formatMoney(value)} />
                        <Bar
                            dataKey="diferencia"
                            name="Diferencia"
                            fill="#dc2626"
                            radius={[8, 8, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card">
                <div className="chart-header">
                    <h3>Movimientos de Conciliación</h3>
                    <span>Conciliados, pendientes y diferencias detectadas</span>
                </div>

                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={movimientosConciliacion}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={3}
                        >
                            {movimientosConciliacion.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card">
                <div className="chart-header">
                    <h3>Conciliaciones por Estado</h3>
                    <span>Cantidad de conciliaciones por estado actual</span>
                </div>

                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={conciliacionesPorEstado}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={3}
                        >
                            {conciliacionesPorEstado.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}