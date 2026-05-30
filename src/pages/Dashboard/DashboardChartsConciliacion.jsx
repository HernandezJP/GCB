import { useMemo, useState } from "react";
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
    CartesianGrid,
    Legend,
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

const money = (value) =>
    `Q ${Number(value ?? 0).toLocaleString("es-GT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const getCuenta = (item) =>
    g(item, "cuenta", "Cuenta", "cuB_Numero_Cuenta", "CUB_Numero_Cuenta") || "Sin cuenta";

const getBanco = (item) =>
    g(item, "banco", "Banco", "bAN_Nombre", "BAN_Nombre") || "Sin banco";

const getEstado = (item) =>
    g(
        item,
        "estadoConciliacion",
        "EstadoConciliacion",
        "ecO_Descripcion",
        "ECO_Descripcion",
        "estado"
    ) || "Sin estado";

const getPeriodo = (item) =>
    g(item, "coN_Periodo", "cON_Periodo", "CON_Periodo", "periodo") || "Sin período";

const getSaldoBanco = (item) =>
    Number(g(item, "coN_Saldo_Banco", "cON_Saldo_Banco", "CON_Saldo_Banco", "saldoBanco") || 0);

const getSaldoLibros = (item) =>
    Number(g(item, "coN_Saldo_Libros", "cON_Saldo_Libros", "CON_Saldo_Libros", "saldoLibros") || 0);

const getDiferencia = (item) =>
    Number(g(item, "coN_Diferencia", "cON_Diferencia", "CON_Diferencia", "diferencia") || 0);

const getConciliados = (item) =>
    Number(g(item, "totalConciliados", "conciliados") || 0);

const getPendientesBanco = (item) =>
    Number(g(item, "totalPendientesBanco", "pendientesBanco") || 0);

const getPendientesLibros = (item) =>
    Number(g(item, "totalPendientesLibros", "pendientesLibros") || 0);

export default function DashboardChartsConciliaciones({ conciliaciones = [] }) {
    const [filtros, setFiltros] = useState({
        banco: "TODOS",
        estado: "TODOS",
        periodo: "",
    });

    const bancos = useMemo(
        () => [...new Set(conciliaciones.map(getBanco).filter(Boolean))],
        [conciliaciones]
    );

    const estados = useMemo(
        () => [...new Set(conciliaciones.map(getEstado).filter(Boolean))],
        [conciliaciones]
    );

    const dataFiltrada = useMemo(() => {
        return conciliaciones.filter((item) => {
            const okBanco = filtros.banco === "TODOS" || getBanco(item) === filtros.banco;
            const okEstado = filtros.estado === "TODOS" || getEstado(item) === filtros.estado;
            const okPeriodo =
                !filtros.periodo ||
                String(getPeriodo(item)).includes(filtros.periodo) ||
                String(getPeriodo(item)).startsWith(filtros.periodo);

            return okBanco && okEstado && okPeriodo;
        });
    }, [conciliaciones, filtros]);

    if (!conciliaciones.length) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    No hay información suficiente para mostrar gráficas de conciliaciones.
                </div>
            </div>
        );
    }

    const resumen = dataFiltrada.reduce(
        (acc, item) => {
            acc.total += 1;
            acc.saldoBanco += getSaldoBanco(item);
            acc.saldoLibros += getSaldoLibros(item);
            acc.diferencia += Math.abs(getDiferencia(item));
            acc.conciliados += getConciliados(item);
            acc.pendientesBanco += getPendientesBanco(item);
            acc.pendientesLibros += getPendientesLibros(item);
            return acc;
        },
        {
            total: 0,
            saldoBanco: 0,
            saldoLibros: 0,
            diferencia: 0,
            conciliados: 0,
            pendientesBanco: 0,
            pendientesLibros: 0,
        }
    );

    const totalMovimientos =
        resumen.conciliados + resumen.pendientesBanco + resumen.pendientesLibros;

    const porcentajeConciliado =
        totalMovimientos > 0 ? (resumen.conciliados / totalMovimientos) * 100 : 0;

    const estadoChart = Object.values(
        dataFiltrada.reduce((acc, item) => {
            const estado = getEstado(item);

            acc[estado] = acc[estado] || {
                name: estado,
                value: 0,
            };

            acc[estado].value += 1;
            return acc;
        }, {})
    );

    const movimientosChart = [
        { name: "Conciliados", value: resumen.conciliados },
        { name: "Pend. Banco", value: resumen.pendientesBanco },
        { name: "Pend. Libros", value: resumen.pendientesLibros },
    ].filter((x) => x.value > 0);

    const diferenciaPorBanco = Object.values(
        dataFiltrada.reduce((acc, item) => {
            const banco = getBanco(item);

            acc[banco] = acc[banco] || {
                banco,
                diferencia: 0,
                saldoBanco: 0,
                saldoLibros: 0,
            };

            acc[banco].diferencia += Math.abs(getDiferencia(item));
            acc[banco].saldoBanco += getSaldoBanco(item);
            acc[banco].saldoLibros += getSaldoLibros(item);

            return acc;
        }, {})
    ).sort((a, b) => b.diferencia - a.diferencia);

    const saldoComparativo = dataFiltrada.map((item) => ({
        cuenta: getCuenta(item),
        banco: getBanco(item),
        saldoBanco: getSaldoBanco(item),
        saldoLibros: getSaldoLibros(item),
        diferencia: Math.abs(getDiferencia(item)),
    }));

    const ultimasConciliaciones = [...dataFiltrada].slice(0, 8);

    return (
        <div className="analytics-grid">
            <div className="analytics-hero-card">
                <div>
                    <span className="analytics-eyebrow">Cubo financiero</span>
                    <h3>Resumen Ejecutivo de Conciliaciones</h3>
                    <p>
                        Control profesional de saldos bancarios, saldos en libros,
                        diferencias, pendientes y porcentaje de conciliación.
                    </p>
                </div>

                <div className="dashboard-cube-actions">
                    <select
                        className="dashboard-currency-filter"
                        value={filtros.banco}
                        onChange={(e) =>
                            setFiltros({ ...filtros, banco: e.target.value })
                        }
                    >
                        <option value="TODOS">Todos los bancos</option>
                        {bancos.map((b) => (
                            <option key={b} value={b}>
                                {b}
                            </option>
                        ))}
                    </select>

                    <select
                        className="dashboard-currency-filter"
                        value={filtros.estado}
                        onChange={(e) =>
                            setFiltros({ ...filtros, estado: e.target.value })
                        }
                    >
                        <option value="TODOS">Todos los estados</option>
                        {estados.map((e) => (
                            <option key={e} value={e}>
                                {e}
                            </option>
                        ))}
                    </select>

                    <input
                        className="dashboard-currency-filter"
                        type="month"
                        value={filtros.periodo}
                        onChange={(e) =>
                            setFiltros({ ...filtros, periodo: e.target.value })
                        }
                    />

                    <button
                        type="button"
                        className="dashboard-clear-filter"
                        onClick={() =>
                            setFiltros({
                                banco: "TODOS",
                                estado: "TODOS",
                                periodo: "",
                            })
                        }
                    >
                        Limpiar
                    </button>

                    <div className="analytics-hero-metric">
                        <span>% Conciliado</span>
                        <strong>{porcentajeConciliado.toFixed(1)}%</strong>
                    </div>
                </div>
            </div>

            <div className="executive-kpi-grid movement-kpi-row">
                <div className="executive-kpi-card kpi-navy">
                    <div>
                        <span className="executive-kpi-label">Conciliaciones</span>
                        <strong className="executive-kpi-value">{resumen.total}</strong>
                    </div>
                </div>

                <div className="executive-kpi-card kpi-blue">
                    <div>
                        <span className="executive-kpi-label">Saldo Banco</span>
                        <strong className="executive-kpi-value">
                            {money(resumen.saldoBanco)}
                        </strong>
                    </div>
                </div>

                <div className="executive-kpi-card kpi-soft">
                    <div>
                        <span className="executive-kpi-label">Saldo Libros</span>
                        <strong className="executive-kpi-value">
                            {money(resumen.saldoLibros)}
                        </strong>
                    </div>
                </div>

                <div className="executive-kpi-card kpi-sky">
                    <div>
                        <span className="executive-kpi-label">Diferencia Total</span>
                        <strong className="executive-kpi-value">
                            {money(resumen.diferencia)}
                        </strong>
                    </div>
                </div>

                <div className="executive-kpi-card kpi-teal">
                    <div>
                        <span className="executive-kpi-label">Mov. Conciliados</span>
                        <strong className="executive-kpi-value">
                            {resumen.conciliados}
                        </strong>
                    </div>
                </div>

                <div className="executive-kpi-card kpi-steel">
                    <div>
                        <span className="executive-kpi-label">Pendientes</span>
                        <strong className="executive-kpi-value">
                            {resumen.pendientesBanco + resumen.pendientesLibros}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="chart-card chart-half-row">
                <div className="chart-header">
                    <h3>Estado de Conciliaciones</h3>
                    <span>Distribución por estado del proceso</span>
                </div>

                <ResponsiveContainer width="100%" height={310}>
                    <PieChart>
                        <Pie
                            data={estadoChart}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={70}
                            outerRadius={105}
                            paddingAngle={4}
                        >
                            {estadoChart.map((_, index) => (
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
                    <h3>Detalle de Movimientos</h3>
                    <span>Conciliados, pendientes banco y pendientes libros</span>
                </div>

                <ResponsiveContainer width="100%" height={310}>
                    <PieChart>
                        <Pie
                            data={movimientosChart}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={70}
                            outerRadius={105}
                            paddingAngle={4}
                        >
                            {movimientosChart.map((_, index) => (
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
                    <h3>Diferencias por Banco</h3>
                    <span>Riesgo financiero detectado por institución bancaria</span>
                </div>

                <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                        data={diferenciaPorBanco}
                        layout="vertical"
                        margin={{ top: 10, right: 25, left: 70, bottom: 10 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                        <XAxis type="number" tick={{ fontSize: 11, fill: COLORS.slate }} />
                        <YAxis
                            type="category"
                            dataKey="banco"
                            width={150}
                            tick={{ fontSize: 11, fill: COLORS.navy }}
                        />
                        <Tooltip formatter={(value) => money(value)} />
                        <Bar
                            dataKey="diferencia"
                            name="Diferencia"
                            fill={COLORS.blue}
                            radius={[0, 10, 10, 0]}
                            barSize={24}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card chart-half-row">
                <div className="chart-header">
                    <h3>Banco vs Libros</h3>
                    <span>Comparativo de saldos por cuenta bancaria</span>
                </div>

                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={saldoComparativo}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="cuenta" tick={{ fontSize: 11, fill: COLORS.slate }} />
                        <YAxis tick={{ fontSize: 11, fill: COLORS.slate }} />
                        <Tooltip formatter={(value) => money(value)} />
                        <Legend />
                        <Bar
                            dataKey="saldoBanco"
                            name="Saldo Banco"
                            fill={COLORS.blue}
                            radius={[10, 10, 0, 0]}
                        />
                        <Bar
                            dataKey="saldoLibros"
                            name="Saldo Libros"
                            fill={COLORS.teal}
                            radius={[10, 10, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card chart-card-full">
                <div className="chart-header">
                    <h3>Últimas Conciliaciones</h3>
                    <span>Detalle ejecutivo de conciliaciones recientes</span>
                </div>

                <div className="latest-movements-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Período</th>
                                <th>Cuenta</th>
                                <th>Banco</th>
                                <th>Saldo Banco</th>
                                <th>Saldo Libros</th>
                                <th>Diferencia</th>
                                <th>Conciliados</th>
                                <th>Pend. Banco</th>
                                <th>Pend. Libros</th>
                                <th>Estado</th>
                            </tr>
                        </thead>

                        <tbody>
                            {ultimasConciliaciones.map((item, index) => (
                                <tr key={index}>
                                    <td>{getPeriodo(item)}</td>
                                    <td>{getCuenta(item)}</td>
                                    <td>{getBanco(item)}</td>
                                    <td className="movement-money">
                                        {money(getSaldoBanco(item))}
                                    </td>
                                    <td className="movement-money">
                                        {money(getSaldoLibros(item))}
                                    </td>
                                    <td className="movement-money">
                                        {money(Math.abs(getDiferencia(item)))}
                                    </td>
                                    <td>{getConciliados(item)}</td>
                                    <td>{getPendientesBanco(item)}</td>
                                    <td>{getPendientesLibros(item)}</td>
                                    <td>
                                        <span className="movement-pill">
                                            {getEstado(item)}
                                        </span>
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