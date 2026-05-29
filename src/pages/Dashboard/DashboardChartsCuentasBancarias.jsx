import { useMemo } from "react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from "recharts";

const COLORS = {
    navy: "#0B1F3A",
    blue: "#1E5EFF",
    sky: "#38BDF8",
    teal: "#0F766E",
    slate: "#64748B",
};

const PALETTE = [
    "#0B1F3A",
    "#12335E",
    "#1E5EFF",
    "#2563EB",
    "#38BDF8",
    "#0F766E",
];

const g = (o, ...ks) => {
    for (const k of ks) {
        const v = o?.[k];
        if (v !== undefined && v !== null) return v;
    }
    return "";
};

const getMoneda = (item) =>
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
        ) || "Quetzal"
    );

const getMonedaKey = (item) => {
    const m = getMoneda(item).toLowerCase();

    if (
        m.includes("dólar") ||
        m.includes("dolar") ||
        m.includes("usd")
    ) {
        return "USD";
    }

    return "GTQ";
};

const getSymbolByKey = (key) => (key === "USD" ? "$" : "Q");

const money = (value, monedaKey = "GTQ") =>
    `${getSymbolByKey(monedaKey)} ${Number(value ?? 0).toLocaleString("es-GT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const getSaldoActual = (item) =>
    Number(g(item, "cuB_Saldo_Actual", "CUB_Saldo_Actual") || 0);

const getSaldoInicial = (item) =>
    Number(g(item, "cuB_Saldo_Inicial", "CUB_Saldo_Inicial") || 0);

const getTipoMovimiento = (m) =>
    String(g(m, "tiM_Descripcion", "tIM_Descripcion", "tim_descripcion")).toLowerCase();

const getMontoMovimiento = (m) =>
    Math.abs(Number(g(m, "moV_Monto", "mOV_Monto", "MOV_Monto", "mov_monto") || 0));

const getFechaMovimiento = (m) =>
    g(m, "moV_Fecha", "mOV_Fecha", "MOV_Fecha", "mov_fecha");

const esIngreso = (m) => getTipoMovimiento(m) === "ingreso";

const formatFechaCorta = (fecha) => {
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return "Sin fecha";

    return d.toLocaleDateString("es-GT", {
        day: "2-digit",
        month: "2-digit",
    });
};

const getEstadoCheque = (c) =>
    String(
        g(
            c,
            "estadoCheque",
            "EstadoCheque",
            "esC_Descripcion",
            "eSC_Descripcion",
            "ESC_Descripcion"
        ) || "Sin estado"
    );

const getCuentaId = (item) =>
    String(
        g(
            item,
            "cuB_Cuenta",
            "cUB_Cuenta",
            "CUB_Cuenta",
            "cub_Cuenta",
            "cub_cuenta"
        )
    );

export default function DashboardChartsCuentasBancarias({
    cuentas = [],
    movimientos = [],
    cheques = [],
    monedaFiltro = "TODAS",
    setMonedaFiltro,
}) {
    const cuentasFiltradas = useMemo(() => {
        if (monedaFiltro === "TODAS") return cuentas;
        return cuentas.filter((c) => getMonedaKey(c) === monedaFiltro);
    }, [cuentas, monedaFiltro]);

    const cuentasIdsFiltradas = useMemo(
        () => new Set(cuentasFiltradas.map(getCuentaId).filter(Boolean)),
        [cuentasFiltradas]
    );

    const movimientosFiltrados = useMemo(() => {
        if (monedaFiltro === "TODAS") return movimientos;

        return movimientos.filter((m) =>
            cuentasIdsFiltradas.has(getCuentaId(m))
        );
    }, [movimientos, monedaFiltro, cuentasIdsFiltradas]);

    const chequesFiltrados = useMemo(() => {
        if (monedaFiltro === "TODAS") return cheques;

        return cheques.filter((c) =>
            cuentasIdsFiltradas.has(getCuentaId(c))
        );
    }, [cheques, monedaFiltro, cuentasIdsFiltradas]);

    if (!cuentas.length) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    No hay información suficiente para mostrar gráficas de cuentas bancarias.
                </div>
            </div>
        );
    }

    const monedaVisual = monedaFiltro === "TODAS" ? "GTQ" : monedaFiltro;

    const saldoPorBanco = Object.values(
        cuentasFiltradas.reduce((acc, item) => {
            const banco =
                g(item, "banco", "Banco", "bAN_Nombre", "BAN_Nombre") || "Sin banco";

            acc[banco] = acc[banco] || {
                banco,
                saldo: 0,
                cuentas: 0,
            };

            acc[banco].saldo += getSaldoActual(item);
            acc[banco].cuentas += 1;

            return acc;
        }, {})
    ).sort((a, b) => b.saldo - a.saldo);

    const fondosPorBanco = saldoPorBanco.map((x) => ({
        name: x.banco,
        value: x.saldo,
    }));

    const fondosPorMoneda = Object.values(
        cuentas.reduce((acc, item) => {
            const key = getMonedaKey(item);
            const name = key === "USD" ? "Dólar estadounidense" : "Quetzal";

            acc[key] = acc[key] || {
                name,
                key,
                value: 0,
            };

            acc[key].value += getSaldoActual(item);

            return acc;
        }, {})
    );

    const flujoPorFecha = Object.values(
        movimientosFiltrados.reduce((acc, item) => {
            const fecha = formatFechaCorta(getFechaMovimiento(item));

            acc[fecha] = acc[fecha] || {
                fecha,
                ingresos: 0,
                egresos: 0,
            };

            if (esIngreso(item)) {
                acc[fecha].ingresos += getMontoMovimiento(item);
            } else {
                acc[fecha].egresos += getMontoMovimiento(item);
            }

            return acc;
        }, {})
    );

    const estadoCheques = Object.values(
        chequesFiltrados.reduce((acc, item) => {
            const estado = getEstadoCheque(item);

            acc[estado] = acc[estado] || {
                name: estado,
                value: 0,
            };

            acc[estado].value += 1;

            return acc;
        }, {})
    );

    const ultimosMovimientos = [...movimientosFiltrados]
        .sort(
            (a, b) =>
                new Date(getFechaMovimiento(b)) -
                new Date(getFechaMovimiento(a))
        )
        .slice(0, 6);

    const totalSaldo = cuentasFiltradas.reduce(
        (acc, item) => acc + getSaldoActual(item),
        0
    );

    const totalInicial = cuentasFiltradas.reduce(
        (acc, item) => acc + getSaldoInicial(item),
        0
    );

    const variacion =
        totalInicial > 0 ? ((totalSaldo - totalInicial) / totalInicial) * 100 : 0;

    return (
        <div className="analytics-grid">
            <div className="analytics-hero-card">
                <div>
                    <span className="analytics-eyebrow">Cubo financiero</span>
                    <h3>Resumen Ejecutivo de Cuentas Bancarias</h3>
                    <p>
                        Vista consolidada de liquidez, bancos, monedas, flujo financiero, cheques y movimientos recientes.
                    </p>
                </div>

                <div className="dashboard-cube-actions">
                    <select
                        className="dashboard-currency-filter"
                        value={monedaFiltro}
                        onChange={(e) => setMonedaFiltro(e.target.value)}
                    >
                        <option value="TODAS">Todas las monedas</option>
                        <option value="GTQ">Quetzales GTQ</option>
                        <option value="USD">Dólares USD</option>
                    </select>

                    <div className="analytics-hero-metric">
                        <span>Variación Global</span>
                        <strong>{variacion.toFixed(2)}%</strong>
                    </div>
                </div>
            </div>

            <div className="chart-card chart-card-wide">
                <div className="chart-header">
                    <h3>Evolución Financiera</h3>
                    <span>Ingresos y egresos agrupados por fecha</span>
                </div>

                <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={flujoPorFecha}>
                        <defs>
                            <linearGradient id="ingresosColor" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.35} />
                                <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0.02} />
                            </linearGradient>

                            <linearGradient id="egresosColor" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.sky} stopOpacity={0.35} />
                                <stop offset="95%" stopColor={COLORS.sky} stopOpacity={0.02} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />

                        <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: COLORS.slate }} />

                        <YAxis
                            tickFormatter={(value) => money(value, monedaVisual)}
                            tick={{ fontSize: 11, fill: COLORS.slate }}
                        />

                        <Tooltip formatter={(value) => money(value, monedaVisual)} />

                        <Legend />

                        <Area
                            type="monotone"
                            dataKey="ingresos"
                            name="Ingresos"
                            stroke={COLORS.blue}
                            strokeWidth={3}
                            fill="url(#ingresosColor)"
                        />

                        <Area
                            type="monotone"
                            dataKey="egresos"
                            name="Egresos"
                            stroke={COLORS.sky}
                            strokeWidth={3}
                            fill="url(#egresosColor)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card">
                <div className="chart-header">
                    <h3>Distribución de Fondos</h3>
                    <span>Participación del saldo por banco</span>
                </div>

                <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                        <Pie
                            data={fondosPorBanco}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={70}
                            outerRadius={105}
                            paddingAngle={4}
                        >
                            {fondosPorBanco.map((_, index) => (
                                <Cell
                                    key={index}
                                    fill={PALETTE[index % PALETTE.length]}
                                />
                            ))}
                        </Pie>

                        <Tooltip formatter={(value) => money(value, monedaVisual)} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card">
                <div className="chart-header">
                    <h3>Saldo por Banco</h3>
                    <span>Ranking ejecutivo por saldo actual</span>
                </div>

                <ResponsiveContainer width="100%" height={310}>
                    <BarChart
                        data={saldoPorBanco}
                        layout="vertical"
                        margin={{ top: 10, right: 25, left: 35, bottom: 10 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />

                        <XAxis
                            type="number"
                            tickFormatter={(value) => money(value, monedaVisual)}
                            tick={{ fontSize: 11, fill: COLORS.slate }}
                        />

                        <YAxis
                            type="category"
                            dataKey="banco"
                            width={120}
                            tick={{ fontSize: 11, fill: COLORS.navy }}
                        />

                        <Tooltip formatter={(value) => money(value, monedaVisual)} />

                        <Bar
                            dataKey="saldo"
                            name="Saldo actual"
                            fill={COLORS.blue}
                            radius={[0, 10, 10, 0]}
                            barSize={24}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card">
                <div className="chart-header">
                    <h3>Saldos por Moneda</h3>
                    <span>Distribución general GTQ / USD</span>
                </div>

                <div className="currency-summary">
                    {fondosPorMoneda.map((m, index) => {
                        const totalGeneral = fondosPorMoneda.reduce(
                            (acc, x) => acc + x.value,
                            0
                        );

                        return (
                            <div className="currency-row" key={m.key}>
                                <div>
                                    <span>{m.name}</span>
                                    <strong>{money(m.value, m.key)}</strong>
                                </div>

                                <div className="currency-bar">
                                    <div
                                        style={{
                                            width: `${totalGeneral > 0 ? (m.value / totalGeneral) * 100 : 0}%`,
                                            background: PALETTE[index % PALETTE.length],
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="chart-card chart-half-row">
                <div className="chart-header">
                    <h3>Estado de Cheques</h3>
                    <span>Cheques cobrados, emitidos, pendientes y cancelados</span>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={estadoCheques}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={4}
                        >
                            {estadoCheques.map((_, index) => (
                                <Cell
                                    key={index}
                                    fill={PALETTE[index % PALETTE.length]}
                                />
                            ))}
                        </Pie>

                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card chart-half-row">
                <div className="chart-header">
                    <h3>Últimos Movimientos</h3>
                    <span>Movimientos recientes registrados en el sistema</span>
                </div>

                <div className="latest-movements-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Tipo</th>
                                <th>Descripción</th>
                                <th>Monto</th>
                            </tr>
                        </thead>

                        <tbody>
                            {ultimosMovimientos.map((m, index) => (
                                <tr key={index}>
                                    <td>{formatFechaCorta(getFechaMovimiento(m))}</td>

                                    <td>
                                        <span className="movement-pill">
                                            {g(
                                                m,
                                                "tiM_Descripcion",
                                                "tIM_Descripcion",
                                                "tim_descripcion"
                                            ) || "Sin tipo"}
                                        </span>
                                    </td>

                                    <td>
                                        {g(
                                            m,
                                            "moV_Descripcion",
                                            "mOV_Descripcion",
                                            "MOV_Descripcion",
                                            "mov_descripcion"
                                        ) || "—"}
                                    </td>

                                    <td className="movement-money">
                                        {money(getMontoMovimiento(m), monedaVisual)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}