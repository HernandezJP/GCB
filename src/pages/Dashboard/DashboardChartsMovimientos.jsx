import { useMemo, useState } from "react";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

const COLORS = {
    navy: "#0B1F3A",
    navy2: "#12335E",
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
    "#64748B",
];

const g = (o, ...ks) => {
    for (const k of ks) {
        const v = o?.[k];
        if (v !== undefined && v !== null) return v;
    }
    return "";
};

const getCuentaId = (x) =>
    String(g(x, "cuB_Cuenta", "cUB_Cuenta", "CUB_Cuenta", "cub_Cuenta", "cub_cuenta"));

const getTipo = (m) =>
    g(m, "tiM_Descripcion", "tIM_Descripcion", "tim_descripcion") || "Sin tipo";

const getMedio = (m) =>
    g(m, "meM_Descripcion", "mEM_Descripcion", "mem_descripcion") || "Sin medio";

const getMonto = (m) =>
    Math.abs(Number(g(m, "moV_Monto", "mOV_Monto", "MOV_Monto", "mov_monto") || 0));

const getSaldo = (m) =>
    Number(g(m, "moV_Saldo", "mOV_Saldo", "MOV_Saldo", "mov_saldo") || 0);

const getRecargo = (m) =>
    Number(g(m, "moV_Recargo", "mOV_Recargo", "mov_recargo") || 0);

const getFecha = (m) =>
    g(m, "moV_Fecha", "mOV_Fecha", "MOV_Fecha", "mov_fecha");

const getDescripcion = (m) =>
    g(m, "moV_Descripcion", "mOV_Descripcion", "MOV_Descripcion", "mov_descripcion") || "—";

const esIngreso = (m) =>
    String(getTipo(m)).trim().toLowerCase() === "ingreso";

const getMonedaTexto = (item) =>
    String(g(item, "tipoMoneda", "TipoMoneda", "tmO_Descripcion", "tMO_Descripcion", "TMO_Descripcion", "moneda", "Moneda") || "Quetzal");

const getMonedaKey = (item) => {
    const moneda = getMonedaTexto(item).toLowerCase();
    return moneda.includes("dólar") || moneda.includes("dolar") || moneda.includes("usd")
        ? "USD"
        : "GTQ";
};

const symbol = (key) => (key === "USD" ? "$" : "Q");

const money = (value, moneda = "GTQ") =>
    `${symbol(moneda)} ${Number(value ?? 0).toLocaleString("es-GT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const formatFecha = (fecha) => {
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return "Sin fecha";
    return d.toLocaleDateString("es-GT", { day: "2-digit", month: "2-digit" });
};

const getPeriodo = (fecha) => {
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export default function DashboardChartsMovimientos({ movimientos = [], cuentas = [] }) {
    const [filtros, setFiltros] = useState({
        moneda: "TODAS",
        tipo: "TODOS",
        medio: "TODOS",
        periodo: "",
    });

    const cuentaById = useMemo(
        () => new Map(cuentas.map((c) => [getCuentaId(c), c])),
        [cuentas]
    );

    const getMonedaMovimiento = (m) => {
        const monedaDirecta = getMonedaTexto(m);
        if (monedaDirecta && monedaDirecta !== "Quetzal") return getMonedaKey(m);

        const cuenta = cuentaById.get(getCuentaId(m));
        return getMonedaKey(cuenta || m);
    };

    const tipos = useMemo(
        () => [...new Set(movimientos.map(getTipo).filter(Boolean))],
        [movimientos]
    );

    const medios = useMemo(
        () => [...new Set(movimientos.map(getMedio).filter(Boolean))],
        [movimientos]
    );

    const dataFiltrada = useMemo(() => {
        return movimientos.filter((m) => {
            const moneda = getMonedaMovimiento(m);
            const periodo = getPeriodo(getFecha(m));

            const okMoneda = filtros.moneda === "TODAS" || moneda === filtros.moneda;
            const okTipo = filtros.tipo === "TODOS" || getTipo(m) === filtros.tipo;
            const okMedio = filtros.medio === "TODOS" || getMedio(m) === filtros.medio;
            const okPeriodo = !filtros.periodo || periodo === filtros.periodo;

            return okMoneda && okTipo && okMedio && okPeriodo;
        });
    }, [movimientos, filtros, cuentaById]);

    if (!movimientos.length) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    No hay información suficiente para mostrar gráficas de movimientos.
                </div>
            </div>
        );
    }

    const resumen = dataFiltrada.reduce(
        (acc, m) => {
            const moneda = getMonedaMovimiento(m);
            const monto = getMonto(m);

            if (esIngreso(m)) acc[`ingresos${moneda}`] += monto;
            else acc[`egresos${moneda}`] += monto;

            acc[`total${moneda}`] += monto;
            acc.totalMovimientos += 1;

            return acc;
        },
        {
            ingresosGTQ: 0,
            ingresosUSD: 0,
            egresosGTQ: 0,
            egresosUSD: 0,
            totalGTQ: 0,
            totalUSD: 0,
            totalMovimientos: 0,
        }
    );

    const flujoPorFecha = Object.values(
        dataFiltrada.reduce((acc, m) => {
            const fecha = formatFecha(getFecha(m));
            const moneda = getMonedaMovimiento(m);

            acc[fecha] = acc[fecha] || {
                fecha,
                ingresosGTQ: 0,
                egresosGTQ: 0,
                ingresosUSD: 0,
                egresosUSD: 0,
            };

            const key = `${esIngreso(m) ? "ingresos" : "egresos"}${moneda}`;
            acc[fecha][key] += getMonto(m);

            return acc;
        }, {})
    );

    const montoPorTipo = Object.values(
        dataFiltrada.reduce((acc, m) => {
            const tipo = getTipo(m);
            const moneda = getMonedaMovimiento(m);
            const key = `${tipo}-${moneda}`;

            acc[key] = acc[key] || {
                tipo: `${tipo} (${moneda})`,
                monto: 0,
                moneda,
            };

            acc[key].monto += getMonto(m);
            return acc;
        }, {})
    );

    const movimientosPorMedio = Object.values(
        dataFiltrada.reduce((acc, m) => {
            const medio = getMedio(m);

            acc[medio] = acc[medio] || {
                name: medio,
                value: 0,
            };

            acc[medio].value += 1;
            return acc;
        }, {})
    );

    const recargosPorMedio = Object.values(
        dataFiltrada.reduce((acc, m) => {
            const medio = getMedio(m);

            acc[medio] = acc[medio] || {
                medio,
                recargo: 0,
            };

            acc[medio].recargo += getRecargo(m);
            return acc;
        }, {})
    );

    const ultimosMovimientos = [...dataFiltrada]
        .sort((a, b) => new Date(getFecha(b)) - new Date(getFecha(a)))
        .slice(0, 8);

    return (
        <div className="analytics-grid">
            <div className="analytics-hero-card">
                <div>
                    <span className="analytics-eyebrow">Cubo financiero</span>
                    <h3>Resumen Ejecutivo de Movimientos</h3>
                    <p>
                        Análisis profesional de ingresos, egresos, medios de pago, recargos,
                        monedas y movimientos recientes.
                    </p>
                </div>

                <div className="dashboard-cube-actions">
                    <select
                        className="dashboard-currency-filter"
                        value={filtros.moneda}
                        onChange={(e) => setFiltros({ ...filtros, moneda: e.target.value })}
                    >
                        <option value="TODAS">Todas las monedas</option>
                        <option value="GTQ">Quetzales GTQ</option>
                        <option value="USD">Dólares USD</option>
                    </select>

                    <select
                        className="dashboard-currency-filter"
                        value={filtros.tipo}
                        onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                    >
                        <option value="TODOS">Todos los tipos</option>
                        {tipos.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>

                    <select
                        className="dashboard-currency-filter"
                        value={filtros.medio}
                        onChange={(e) => setFiltros({ ...filtros, medio: e.target.value })}
                    >
                        <option value="TODOS">Todos los medios</option>
                        {medios.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>

                    <input
                        className="dashboard-currency-filter"
                        type="month"
                        value={filtros.periodo}
                        onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
                    />

                    <button
                        type="button"
                        className="dashboard-clear-filter"
                        onClick={() =>
                            setFiltros({
                                moneda: "TODAS",
                                tipo: "TODOS",
                                medio: "TODOS",
                                periodo: "",
                            })
                        }
                    >
                        Limpiar
                    </button>

                    <div className="analytics-hero-metric">
                        <span>Movimientos</span>
                        <strong>{resumen.totalMovimientos}</strong>
                    </div>
                </div>
            </div>

            <div className="executive-kpi-grid movement-kpi-row">
                {(filtros.moneda === "TODAS" || filtros.moneda === "GTQ") && (
                    <>
                        <div className="executive-kpi-card kpi-blue">
                            <div>
                                <span className="executive-kpi-label">Ingresos GTQ</span>
                                <strong className="executive-kpi-value">{money(resumen.ingresosGTQ, "GTQ")}</strong>
                            </div>
                        </div>

                        <div className="executive-kpi-card kpi-sky">
                            <div>
                                <span className="executive-kpi-label">Egresos GTQ</span>
                                <strong className="executive-kpi-value">{money(resumen.egresosGTQ, "GTQ")}</strong>
                            </div>
                        </div>
                    </>
                )}

                {(filtros.moneda === "TODAS" || filtros.moneda === "USD") && (
                    <>
                        <div className="executive-kpi-card kpi-teal">
                            <div>
                                <span className="executive-kpi-label">Ingresos USD</span>
                                <strong className="executive-kpi-value">{money(resumen.ingresosUSD, "USD")}</strong>
                            </div>
                        </div>

                        <div className="executive-kpi-card kpi-steel">
                            <div>
                                <span className="executive-kpi-label">Egresos USD</span>
                                <strong className="executive-kpi-value">{money(resumen.egresosUSD, "USD")}</strong>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="chart-card chart-card-wide">
                <div className="chart-header">
                    <h3>Ingresos vs Egresos</h3>
                    <span>Comportamiento financiero por fecha y moneda</span>
                </div>

                <ResponsiveContainer width="100%" height={330}>
                    <AreaChart data={flujoPorFecha}>
                        <defs>
                            <linearGradient id="movIngresoGTQ" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.35} />
                                <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0.02} />
                            </linearGradient>

                            <linearGradient id="movEgresoGTQ" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.sky} stopOpacity={0.35} />
                                <stop offset="95%" stopColor={COLORS.sky} stopOpacity={0.02} />
                            </linearGradient>

                            <linearGradient id="movIngresoUSD" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.teal} stopOpacity={0.35} />
                                <stop offset="95%" stopColor={COLORS.teal} stopOpacity={0.02} />
                            </linearGradient>

                            <linearGradient id="movEgresoUSD" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.navy2} stopOpacity={0.35} />
                                <stop offset="95%" stopColor={COLORS.navy2} stopOpacity={0.02} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: COLORS.slate }} />
                        <YAxis tick={{ fontSize: 11, fill: COLORS.slate }} />
                        <Tooltip />
                        <Legend />

                        {(filtros.moneda === "TODAS" || filtros.moneda === "GTQ") && (
                            <>
                                <Area type="monotone" dataKey="ingresosGTQ" name="Ingresos GTQ" stroke={COLORS.blue} strokeWidth={3} fill="url(#movIngresoGTQ)" />
                                <Area type="monotone" dataKey="egresosGTQ" name="Egresos GTQ" stroke={COLORS.sky} strokeWidth={3} fill="url(#movEgresoGTQ)" />
                            </>
                        )}

                        {(filtros.moneda === "TODAS" || filtros.moneda === "USD") && (
                            <>
                                <Area type="monotone" dataKey="ingresosUSD" name="Ingresos USD" stroke={COLORS.teal} strokeWidth={3} fill="url(#movIngresoUSD)" />
                                <Area type="monotone" dataKey="egresosUSD" name="Egresos USD" stroke={COLORS.navy2} strokeWidth={3} fill="url(#movEgresoUSD)" />
                            </>
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card">
                <div className="chart-header">
                    <h3>Monto por Tipo</h3>
                    <span>Total acumulado por tipo de movimiento</span>
                </div>

                <ResponsiveContainer width="100%" height={330}>
                    <BarChart data={montoPorTipo}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="tipo" tick={{ fontSize: 11, fill: COLORS.slate }} />
                        <YAxis tick={{ fontSize: 11, fill: COLORS.slate }} />
                        <Tooltip formatter={(value, _name, props) => money(value, props.payload.moneda)} />
                        <Bar dataKey="monto" name="Monto" fill={COLORS.blue} radius={[10, 10, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card">
                <div className="chart-header">
                    <h3>Movimientos por Medio</h3>
                    <span>Distribución por medio utilizado</span>
                </div>

                <ResponsiveContainer width="100%" height={310}>
                    <PieChart>
                        <Pie
                            data={movimientosPorMedio}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={65}
                            outerRadius={100}
                            paddingAngle={4}
                        >
                            {movimientosPorMedio.map((_, index) => (
                                <Cell key={index} fill={PALETTE[index % PALETTE.length]} />
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
                    <span>Total de recargos asociados a movimientos</span>
                </div>

                <ResponsiveContainer width="100%" height={310}>
                    <BarChart data={recargosPorMedio}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="medio" tick={{ fontSize: 11, fill: COLORS.slate }} />
                        <YAxis tick={{ fontSize: 11, fill: COLORS.slate }} />
                        <Tooltip formatter={(value) => money(value, filtros.moneda === "USD" ? "USD" : "GTQ")} />
                        <Bar dataKey="recargo" name="Recargo" fill={COLORS.navy2} radius={[10, 10, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card chart-card-full">
                <div className="chart-header">
                    <h3>Últimos Movimientos</h3>
                    <span>Detalle ejecutivo de los movimientos recientes</span>
                </div>

                <div className="latest-movements-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Tipo</th>
                                <th>Medio</th>
                                <th>Descripción</th>
                                <th>Monto</th>
                                <th>Saldo</th>
                            </tr>
                        </thead>

                        <tbody>
                            {ultimosMovimientos.map((m, index) => {
                                const moneda = getMonedaMovimiento(m);

                                return (
                                    <tr key={index}>
                                        <td>{formatFecha(getFecha(m))}</td>
                                        <td>
                                            <span className="movement-pill">
                                                {getTipo(m)}
                                            </span>
                                        </td>
                                        <td>{getMedio(m)}</td>
                                        <td>{getDescripcion(m)}</td>
                                        <td className="movement-money">
                                            {money(getMonto(m), moneda)}
                                        </td>
                                        <td className="movement-money">
                                            {money(getSaldo(m), moneda)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}