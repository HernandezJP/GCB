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
    LineChart,
    Line,
} from "recharts";

const COLORS = ["#15803d", "#dc2626", "#0284c7", "#d97706", "#7c3aed", "#0891b2"];

const getValue = (obj, keys) => {
    for (const key of keys) {
        if (obj?.[key] !== undefined && obj?.[key] !== null) {
            return obj[key];
        }
    }

    return "";
};

const formatMoney = (value) =>
    `Q ${Number(value ?? 0).toLocaleString("es-GT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const getTipo = (m) =>
    getValue(m, ["tiM_Descripcion", "tIM_Descripcion", "tim_descripcion"]);

const getMedio = (m) =>
    getValue(m, ["meM_Descripcion", "mEM_Descripcion", "mem_descripcion"]);

const getMonto = (m) =>
    Number(getValue(m, ["moV_Monto", "mOV_Monto", "mov_monto"]) || 0);

const getRecargo = (m) =>
    Number(getValue(m, ["moV_Recargo", "mOV_Recargo", "mov_recargo"]) || 0);

const getFecha = (m) =>
    getValue(m, ["moV_Fecha", "mOV_Fecha", "mov_fecha"]);

const esIngreso = (m) =>
    String(getTipo(m)).trim().toLowerCase() === "ingreso";

const formatFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return "Sin fecha";

    return d.toLocaleDateString("es-GT", {
        day: "2-digit",
        month: "2-digit",
    });
};

export default function DashboardChartsMovimientos({ movimientos }) {
    const movimientosPorTipo = Object.values(
        movimientos.reduce((acc, item) => {
            const tipo = getTipo(item) || "Sin tipo";

            acc[tipo] = acc[tipo] || {
                tipo,
                monto: 0,
            };

            acc[tipo].monto += getMonto(item);
            return acc;
        }, {})
    );

    const movimientosPorMedio = Object.values(
        movimientos.reduce((acc, item) => {
            const medio = getMedio(item) || "Sin medio";

            acc[medio] = acc[medio] || {
                name: medio,
                value: 0,
            };

            acc[medio].value += 1;
            return acc;
        }, {})
    );

    const ingresosEgresosPorFecha = Object.values(
        movimientos.reduce((acc, item) => {
            const fecha = formatFecha(getFecha(item));

            acc[fecha] = acc[fecha] || {
                fecha,
                ingresos: 0,
                egresos: 0,
            };

            if (esIngreso(item)) {
                acc[fecha].ingresos += getMonto(item);
            } else {
                acc[fecha].egresos += getMonto(item);
            }

            return acc;
        }, {})
    );

    const recargosPorMedio = Object.values(
        movimientos.reduce((acc, item) => {
            const medio = getMedio(item) || "Sin medio";

            acc[medio] = acc[medio] || {
                medio,
                recargo: 0,
            };

            acc[medio].recargo += getRecargo(item);
            return acc;
        }, {})
    );

    if (!movimientos.length) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    No hay información suficiente para mostrar gráficas de movimientos.
                </div>
            </div>
        );
    }

    return (
        <div className="charts-grid">
            <div className="chart-card">
                <div className="chart-header">
                    <h3>Ingresos y Egresos</h3>
                    <span>Comportamiento de movimientos por fecha</span>
                </div>

                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={ingresosEgresosPorFecha}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(value) => `Q${Number(value).toLocaleString("es-GT")}`} />
                        <Tooltip formatter={(value) => formatMoney(value)} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="ingresos"
                            name="Ingresos"
                            stroke="#15803d"
                            strokeWidth={3}
                        />
                        <Line
                            type="monotone"
                            dataKey="egresos"
                            name="Egresos"
                            stroke="#dc2626"
                            strokeWidth={3}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card">
                <div className="chart-header">
                    <h3>Monto por Tipo</h3>
                    <span>Total acumulado por tipo de movimiento</span>
                </div>

                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={movimientosPorTipo}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="tipo" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(value) => `Q${Number(value).toLocaleString("es-GT")}`} />
                        <Tooltip formatter={(value) => formatMoney(value)} />
                        <Bar dataKey="monto" name="Monto" fill="#0284c7" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card">
                <div className="chart-header">
                    <h3>Movimientos por Medio</h3>
                    <span>Distribución de movimientos por medio utilizado</span>
                </div>

                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={movimientosPorMedio}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={3}
                        >
                            {movimientosPorMedio.map((_, index) => (
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
                    <h3>Recargos por Medio</h3>
                    <span>Total de recargos agrupados por medio</span>
                </div>

                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={recargosPorMedio}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="medio" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(value) => `Q${Number(value).toLocaleString("es-GT")}`} />
                        <Tooltip formatter={(value) => formatMoney(value)} />
                        <Bar dataKey="recargo" name="Recargo" fill="#d97706" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}