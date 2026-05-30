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

const getCuentaId = (item) =>
    String(g(item, "cuB_Cuenta", "cUB_Cuenta", "CUB_Cuenta", "cub_Cuenta", "cub_cuenta"));

const getNumeroCuenta = (item) =>
    g(item, "cuB_Numero_Cuenta", "cUB_Numero_Cuenta", "CUB_Numero_Cuenta") || "Sin cuenta";

const getBanco = (item) =>
    g(item, "banco", "Banco", "bAN_Nombre", "BAN_Nombre") || "Sin banco";

const getTitular = (item) =>
    g(item, "titular", "Titular", "nombreCompleto", "NombreCompleto", "persona", "Persona") || "Sin titular";

const getMonedaTexto = (item) =>
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
    const moneda = getMonedaTexto(item).toLowerCase();

    return moneda.includes("dólar") ||
        moneda.includes("dolar") ||
        moneda.includes("usd")
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
    return d.toLocaleDateString("es-GT", {
        day: "2-digit",
        month: "2-digit",
    });
};

const getPeriodo = (fecha) => {
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
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

const getNumeroCheque = (c) =>
    g(c, "chE_Numero_Cheque", "cHE_Numero_Cheque", "CHE_Numero_Cheque") || "—";

const getBeneficiario = (c) =>
    g(c, "beneficiario", "Beneficiario", "persona", "Persona") || "Sin beneficiario";

const getConcepto = (c) =>
    g(c, "chE_Concepto", "cHE_Concepto", "CHE_Concepto") || "—";

const getMontoCheque = (c) =>
    Math.abs(Number(g(c, "moV_Monto", "mOV_Monto", "MOV_Monto", "mov_monto") || 0));

const getFechaEmision = (c) =>
    g(c, "chE_Fecha_Emision", "cHE_Fecha_Emision", "CHE_Fecha_Emision");

const getFechaCobro = (c) =>
    g(c, "chE_Fecha_Cobro", "cHE_Fecha_Cobro", "CHE_Fecha_Cobro");

const getFechaVencimiento = (c) =>
    g(c, "chE_Fecha_Vencimiento", "cHE_Fecha_Vencimiento", "CHE_Fecha_Vencimiento");

const estadoNormalizado = (estado) => {
    const e = String(estado || "").toLowerCase();

    if (e.includes("cobrado")) return "Cobrado";
    if (e.includes("cancelado") || e.includes("anulado")) return "Cancelado";
    if (e.includes("pendiente")) return "Pendiente";
    if (e.includes("emitido") || e.includes("activo")) return "Emitido";

    return estado || "Sin estado";
};

export default function DashboardChartsCheques({ cheques = [], cuentas = [] }) {
    const [filtros, setFiltros] = useState({
        moneda: "TODAS",
        banco: "TODOS",
        estado: "TODOS",
        periodo: "",
    });

    const cuentaById = useMemo(
        () => new Map(cuentas.map((c) => [getCuentaId(c), c])),
        [cuentas]
    );

    const getCuentaCheque = (cheque) => cuentaById.get(getCuentaId(cheque));

    const getMonedaCheque = (cheque) => {
        const cuenta = getCuentaCheque(cheque);
        return getMonedaKey(cuenta || cheque);
    };

    const bancos = useMemo(
        () => [...new Set(cheques.map((c) => getBanco(getCuentaCheque(c) || c)).filter(Boolean))],
        [cheques, cuentaById]
    );

    const estados = useMemo(
        () => [...new Set(cheques.map((c) => estadoNormalizado(getEstadoCheque(c))).filter(Boolean))],
        [cheques]
    );

    const chequesFiltrados = useMemo(() => {
        return cheques.filter((c) => {
            const cuenta = getCuentaCheque(c);
            const moneda = getMonedaCheque(c);
            const banco = getBanco(cuenta || c);
            const estado = estadoNormalizado(getEstadoCheque(c));
            const periodo = getPeriodo(getFechaEmision(c));

            const okMoneda = filtros.moneda === "TODAS" || moneda === filtros.moneda;
            const okBanco = filtros.banco === "TODOS" || banco === filtros.banco;
            const okEstado = filtros.estado === "TODOS" || estado === filtros.estado;
            const okPeriodo = !filtros.periodo || periodo === filtros.periodo;

            return okMoneda && okBanco && okEstado && okPeriodo;
        });
    }, [cheques, filtros, cuentaById]);

    if (!cheques.length) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    No hay información suficiente para mostrar gráficas de cheques.
                </div>
            </div>
        );
    }

    const resumen = chequesFiltrados.reduce(
        (acc, c) => {
            const moneda = getMonedaCheque(c);
            const estado = estadoNormalizado(getEstadoCheque(c));
            const monto = getMontoCheque(c);

            acc.total += 1;

            if (estado === "Cobrado") acc.cobrados += 1;
            if (estado === "Pendiente" || estado === "Emitido") acc.pendientes += 1;
            if (estado === "Cancelado") acc.cancelados += 1;

            acc[`monto${moneda}`] += monto;

            if (estado === "Cobrado") acc[`cobrado${moneda}`] += monto;
            if (estado === "Pendiente" || estado === "Emitido") acc[`pendiente${moneda}`] += monto;
            if (estado === "Cancelado") acc[`cancelado${moneda}`] += monto;

            return acc;
        },
        {
            total: 0,
            cobrados: 0,
            pendientes: 0,
            cancelados: 0,
            montoGTQ: 0,
            montoUSD: 0,
            cobradoGTQ: 0,
            cobradoUSD: 0,
            pendienteGTQ: 0,
            pendienteUSD: 0,
            canceladoGTQ: 0,
            canceladoUSD: 0,
        }
    );

    const estadoCheques = Object.values(
        chequesFiltrados.reduce((acc, c) => {
            const estado = estadoNormalizado(getEstadoCheque(c));

            acc[estado] = acc[estado] || {
                name: estado,
                value: 0,
            };

            acc[estado].value += 1;

            return acc;
        }, {})
    );

    const montoPorEstado = Object.values(
        chequesFiltrados.reduce((acc, c) => {
            const estado = estadoNormalizado(getEstadoCheque(c));
            const moneda = getMonedaCheque(c);
            const key = `${estado}-${moneda}`;

            acc[key] = acc[key] || {
                estado: `${estado} (${moneda})`,
                monto: 0,
                moneda,
            };

            acc[key].monto += getMontoCheque(c);

            return acc;
        }, {})
    );

    const montoPorBanco = Object.values(
        chequesFiltrados.reduce((acc, c) => {
            const cuenta = getCuentaCheque(c);
            const banco = getBanco(cuenta || c);
            const moneda = getMonedaCheque(c);
            const key = `${banco}-${moneda}`;

            acc[key] = acc[key] || {
                banco: `${banco} (${moneda})`,
                monto: 0,
                moneda,
            };

            acc[key].monto += getMontoCheque(c);

            return acc;
        }, {})
    ).sort((a, b) => b.monto - a.monto);

    const emisionPorFecha = Object.values(
        chequesFiltrados.reduce((acc, c) => {
            const fecha = formatFecha(getFechaEmision(c));
            const moneda = getMonedaCheque(c);

            acc[fecha] = acc[fecha] || {
                fecha,
                gtq: 0,
                usd: 0,
            };

            if (moneda === "USD") acc[fecha].usd += getMontoCheque(c);
            else acc[fecha].gtq += getMontoCheque(c);

            return acc;
        }, {})
    );

    const hoy = new Date();

    const vencimientos = chequesFiltrados.reduce(
        (acc, c) => {
            const estado = estadoNormalizado(getEstadoCheque(c));
            const fecha = new Date(getFechaVencimiento(c));

            if (estado === "Cobrado" || estado === "Cancelado") return acc;
            if (Number.isNaN(fecha.getTime())) return acc;

            const dias = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));

            if (dias < 0) acc.vencidos += 1;
            else if (dias <= 15) acc.proximos += 1;
            else acc.vigentes += 1;

            return acc;
        },
        { vencidos: 0, proximos: 0, vigentes: 0 }
    );

    const vencimientoChart = [
        { name: "Vencidos", value: vencimientos.vencidos },
        { name: "Próximos 15 días", value: vencimientos.proximos },
        { name: "Vigentes", value: vencimientos.vigentes },
    ].filter((x) => x.value > 0);

    const ultimosCheques = [...chequesFiltrados]
        .sort((a, b) => new Date(getFechaEmision(b)) - new Date(getFechaEmision(a)))
        .slice(0, 8);

    return (
        <div className="analytics-grid">
            <div className="analytics-hero-card">
                <div>
                    <span className="analytics-eyebrow">Cubo financiero</span>
                    <h3>Resumen Ejecutivo de Cheques</h3>
                    <p>
                        Control profesional de cheques emitidos, cobrados, pendientes,
                        cancelados, vencimientos, bancos, monedas y beneficiarios.
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
                        value={filtros.banco}
                        onChange={(e) => setFiltros({ ...filtros, banco: e.target.value })}
                    >
                        <option value="TODOS">Todos los bancos</option>
                        {bancos.map((b) => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>

                    <select
                        className="dashboard-currency-filter"
                        value={filtros.estado}
                        onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                    >
                        <option value="TODOS">Todos los estados</option>
                        {estados.map((e) => (
                            <option key={e} value={e}>{e}</option>
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
                                banco: "TODOS",
                                estado: "TODOS",
                                periodo: "",
                            })
                        }
                    >
                        Limpiar
                    </button>

                    <div className="analytics-hero-metric">
                        <span>Total Cheques</span>
                        <strong>{resumen.total}</strong>
                    </div>
                </div>
            </div>

            <div className="executive-kpi-grid movement-kpi-row">
                {(filtros.moneda === "TODAS" || filtros.moneda === "GTQ") && (
                    <>
                        <div className="executive-kpi-card kpi-navy">
                            <div>
                                <span className="executive-kpi-label">Monto Emitido GTQ</span>
                                <strong className="executive-kpi-value">{money(resumen.montoGTQ, "GTQ")}</strong>
                            </div>
                        </div>

                        <div className="executive-kpi-card kpi-blue">
                            <div>
                                <span className="executive-kpi-label">Cobrado GTQ</span>
                                <strong className="executive-kpi-value">{money(resumen.cobradoGTQ, "GTQ")}</strong>
                            </div>
                        </div>

                        <div className="executive-kpi-card kpi-sky">
                            <div>
                                <span className="executive-kpi-label">Pendiente GTQ</span>
                                <strong className="executive-kpi-value">{money(resumen.pendienteGTQ, "GTQ")}</strong>
                            </div>
                        </div>
                    </>
                )}

                {(filtros.moneda === "TODAS" || filtros.moneda === "USD") && (
                    <>
                        <div className="executive-kpi-card kpi-teal">
                            <div>
                                <span className="executive-kpi-label">Monto Emitido USD</span>
                                <strong className="executive-kpi-value">{money(resumen.montoUSD, "USD")}</strong>
                            </div>
                        </div>

                        <div className="executive-kpi-card kpi-soft">
                            <div>
                                <span className="executive-kpi-label">Cobrado USD</span>
                                <strong className="executive-kpi-value">{money(resumen.cobradoUSD, "USD")}</strong>
                            </div>
                        </div>

                        <div className="executive-kpi-card kpi-steel">
                            <div>
                                <span className="executive-kpi-label">Pendiente USD</span>
                                <strong className="executive-kpi-value">{money(resumen.pendienteUSD, "USD")}</strong>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="chart-card chart-half-row">
                <div className="chart-header">
                    <h3>Estado de Cheques</h3>
                    <span>Cantidad de cheques por estado operativo</span>
                </div>

                <ResponsiveContainer width="100%" height={310}>
                    <PieChart>
                        <Pie
                            data={estadoCheques}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={70}
                            outerRadius={105}
                            paddingAngle={4}
                        >
                            {estadoCheques.map((_, index) => (
                                <Cell key={index} fill={PALETTE[index % PALETTE.length]} />
                            ))}
                        </Pie>

                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card chart-half-row">
                <div className="chart-header">
                    <h3>Riesgo por Vencimiento</h3>
                    <span>Cheques vencidos, próximos a vencer y vigentes</span>
                </div>

                <ResponsiveContainer width="100%" height={310}>
                    <PieChart>
                        <Pie
                            data={vencimientoChart}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={70}
                            outerRadius={105}
                            paddingAngle={4}
                        >
                            {vencimientoChart.map((_, index) => (
                                <Cell key={index} fill={PALETTE[index % PALETTE.length]} />
                            ))}
                        </Pie>

                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-two-columns">

              {/* Emisión de Cheques */}
              <div className="chart-card">
                  <div className="chart-header">
                      <h3>Emisión de Cheques por Fecha</h3>
                      <span>Monto emitido separado por moneda</span>
                  </div>

                  <ResponsiveContainer width="100%" height={330}>
                      <BarChart data={emisionPorFecha}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="fecha" />
                          <YAxis />
                          <Tooltip />
                          <Legend />

                          {(filtros.moneda === "TODAS" || filtros.moneda === "GTQ") && (
                              <Bar
                                  dataKey="gtq"
                                  fill={COLORS.blue}
                                  radius={[10, 10, 0, 0]}
                              />
                          )}

                          {(filtros.moneda === "TODAS" || filtros.moneda === "USD") && (
                              <Bar
                                  dataKey="usd"
                                  fill={COLORS.teal}
                                  radius={[10, 10, 0, 0]}
                              />
                          )}
                      </BarChart>
                  </ResponsiveContainer>
              </div>

              {/* Monto por Estado */}
              <div className="chart-card">
                  <div className="chart-header">
                      <h3>Monto por Estado</h3>
                      <span>Total acumulado por estado del cheque</span>
                  </div>

                  <ResponsiveContainer width="100%" height={330}>
                      <BarChart data={montoPorEstado}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="estado" />
                          <YAxis />
                          <Tooltip />
                          <Bar
                              dataKey="monto"
                              fill={COLORS.navy}
                              radius={[10, 10, 0, 0]}
                          />
                      </BarChart>
                  </ResponsiveContainer>
              </div>

          </div>

            <div className="chart-card chart-card-full">
                <div className="chart-header">
                    <h3>Monto Emitido por Banco</h3>
                    <span>Ranking de bancos con mayor volumen en cheques</span>
                </div>

                <ResponsiveContainer width="100%" height={330}>
                    <BarChart
                        data={montoPorBanco}
                        layout="vertical"
                        margin={{ top: 10, right: 25, left: 70, bottom: 10 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                        <XAxis type="number" tick={{ fontSize: 11, fill: COLORS.slate }} />
                        <YAxis type="category" dataKey="banco" width={180} tick={{ fontSize: 11, fill: COLORS.navy }} />
                        <Tooltip formatter={(value, _name, props) => money(value, props.payload.moneda)} />
                        <Bar dataKey="monto" name="Monto emitido" fill={COLORS.blue} radius={[0, 10, 10, 0]} barSize={24} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card chart-card-full">
                <div className="chart-header">
                    <h3>Últimos Cheques</h3>
                    <span>Detalle ejecutivo de cheques recientes</span>
                </div>

                <div className="latest-movements-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Emisión</th>
                                <th>No. Cheque</th>
                                <th>Cuenta</th>
                                <th>Banco</th>
                                <th>Beneficiario</th>
                                <th>Concepto</th>
                                <th>Monto</th>
                                <th>Vencimiento</th>
                                <th>Cobro</th>
                                <th>Estado</th>
                            </tr>
                        </thead>

                        <tbody>
                            {ultimosCheques.map((c, index) => {
                                const cuenta = getCuentaCheque(c);
                                const moneda = getMonedaCheque(c);
                                const estado = estadoNormalizado(getEstadoCheque(c));

                                return (
                                    <tr key={index}>
                                        <td>{formatFecha(getFechaEmision(c))}</td>
                                        <td>{getNumeroCheque(c)}</td>
                                        <td>{getNumeroCuenta(cuenta || c)}</td>
                                        <td>{getBanco(cuenta || c)}</td>
                                        <td>{getBeneficiario(c)}</td>
                                        <td>{getConcepto(c)}</td>
                                        <td className="movement-money">
                                            {money(getMontoCheque(c), moneda)}
                                        </td>
                                        <td>{formatFecha(getFechaVencimiento(c))}</td>
                                        <td>{formatFecha(getFechaCobro(c))}</td>
                                        <td>
                                            <span className="movement-pill">
                                                {estado}
                                            </span>
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