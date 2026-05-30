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

const getTipoCuenta = (item) =>
    g(item, "tipoCuenta", "TipoCuenta", "tcU_Descripcion", "TCU_Descripcion") || "Sin tipo";

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

const getSaldoActual = (item) =>
    Number(g(item, "cuB_Saldo_Actual", "CUB_Saldo_Actual") || 0);

const getSaldoInicial = (item) =>
    Number(g(item, "cuB_Saldo_Inicial", "CUB_Saldo_Inicial") || 0);

const getTipoMovimiento = (m) =>
    String(g(m, "tiM_Descripcion", "tIM_Descripcion", "tim_descripcion")).toLowerCase();

const getMontoMovimiento = (m) =>
    Math.abs(Number(g(m, "moV_Monto", "mOV_Monto", "MOV_Monto", "mov_monto") || 0));

const getSaldoMovimiento = (m) =>
    Number(g(m, "moV_Saldo", "mOV_Saldo", "MOV_Saldo", "mov_saldo") || 0);

const getDescripcionMovimiento = (m) =>
    g(m, "moV_Descripcion", "mOV_Descripcion", "MOV_Descripcion", "mov_descripcion") || "—";

const getFechaMovimiento = (m) =>
    g(m, "moV_Fecha", "mOV_Fecha", "MOV_Fecha", "mov_fecha");

const esIngreso = (m) => getTipoMovimiento(m) === "ingreso";

const formatFechaCorta = (fecha) => {
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return "Sin fecha";
    return d.toLocaleDateString("es-GT", { day: "2-digit", month: "2-digit" });
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

const getChequeMonto = (c) =>
    Math.abs(Number(g(c, "moV_Monto", "mOV_Monto", "MOV_Monto", "mov_monto") || 0));

const getChequeFechaVencimiento = (c) =>
    g(c, "chE_Fecha_Vencimiento", "cHE_Fecha_Vencimiento", "CHE_Fecha_Vencimiento");

const getCuentaFromMovimiento = (m, cuentaById) => cuentaById.get(getCuentaId(m));
const getCuentaFromCheque = (c, cuentaById) => cuentaById.get(getCuentaId(c));

const unique = (arr) => [...new Set(arr.filter(Boolean))];

export default function DashboardChartsCuentasBancarias({
    cuentas = [],
    movimientos = [],
    cheques = [],
    conciliaciones = [],
    filtros,
    setFiltros,
    cubo,
}) {
    const cuentasFiltradas = cubo?.cuentasFiltradas ?? cuentas;
    const movimientosFiltrados = cubo?.movimientosFiltrados ?? movimientos;
    const chequesFiltrados = cubo?.chequesFiltrados ?? cheques;

    if (!cuentas.length) {
        return (
            <div className="table-container">
                <div className="empty-state">
                    No hay información suficiente para mostrar gráficas de cuentas bancarias.
                </div>
            </div>
        );
    }

    const cuentaById = new Map(cuentas.map((c) => [getCuentaId(c), c]));

    const bancos = unique(cuentas.map(getBanco));
    const tiposCuenta = unique(cuentas.map(getTipoCuenta));

    const cuentasOpciones = cuentas
        .filter((c) => {
            const monedaOk =
                filtros.moneda === "TODAS" || getMonedaKey(c) === filtros.moneda;
            const bancoOk =
                filtros.banco === "TODOS" || getBanco(c) === filtros.banco;
            const tipoOk =
                filtros.tipoCuenta === "TODOS" || getTipoCuenta(c) === filtros.tipoCuenta;

            return monedaOk && bancoOk && tipoOk;
        })
        .map((c) => ({
            id: getCuentaId(c),
            label: `${getNumeroCuenta(c)} · ${getBanco(c)} · ${getTitular(c)}`,
        }));

    const handleFiltro = (name, value) => {
        setFiltros((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "moneda" || name === "banco" || name === "tipoCuenta"
                ? { cuenta: "TODAS" }
                : {}),
        }));
    };

    const monedaVisual = filtros.moneda === "USD" ? "USD" : "GTQ";

    const saldoPorBanco = Object.values(
        cuentasFiltradas.reduce((acc, item) => {
            const banco = getBanco(item);
            const moneda = getMonedaKey(item);
            const key = `${banco}-${moneda}`;

            acc[key] = acc[key] || {
                banco,
                moneda,
                saldo: 0,
                cuentas: 0,
            };

            acc[key].saldo += getSaldoActual(item);
            acc[key].cuentas += 1;

            return acc;
        }, {})
    ).sort((a, b) => b.saldo - a.saldo);

    const fondosPorBanco = saldoPorBanco.map((x) => ({
        name: `${x.banco} (${x.moneda})`,
        value: x.saldo,
        moneda: x.moneda,
    }));

    const fondosPorMoneda = Object.values(
        cuentasFiltradas.reduce((acc, item) => {
            const key = getMonedaKey(item);
            const name = key === "USD" ? "Dólar estadounidense" : "Quetzal";

            acc[key] = acc[key] || { name, key, value: 0, cuentas: 0 };
            acc[key].value += getSaldoActual(item);
            acc[key].cuentas += 1;

            return acc;
        }, {})
    );

    const flujoPorFecha = Object.values(
        movimientosFiltrados.reduce((acc, item) => {
            const cuenta = getCuentaFromMovimiento(item, cuentaById);
            const moneda = getMonedaKey(cuenta);
            const fecha = formatFechaCorta(getFechaMovimiento(item));

            acc[fecha] = acc[fecha] || {
                fecha,
                ingresosGTQ: 0,
                egresosGTQ: 0,
                ingresosUSD: 0,
                egresosUSD: 0,
            };

            const key = `${esIngreso(item) ? "ingresos" : "egresos"}${moneda}`;
            acc[fecha][key] += getMontoMovimiento(item);

            return acc;
        }, {})
    );

    const estadoCheques = Object.values(
        chequesFiltrados.reduce((acc, item) => {
            const estado = getEstadoCheque(item);

            acc[estado] = acc[estado] || { name: estado, value: 0 };
            acc[estado].value += 1;

            return acc;
        }, {})
    );

    const montoChequesPorEstado = Object.values(
        chequesFiltrados.reduce((acc, item) => {
            const cuenta = getCuentaFromCheque(item, cuentaById);
            const moneda = getMonedaKey(cuenta);
            const estado = getEstadoCheque(item);
            const key = `${estado}-${moneda}`;

            acc[key] = acc[key] || {
                estado: `${estado} (${moneda})`,
                monto: 0,
                moneda,
            };

            acc[key].monto += getChequeMonto(item);

            return acc;
        }, {})
    );

    const topCuentas = [...cuentasFiltradas]
        .sort((a, b) => getSaldoActual(b) - getSaldoActual(a))
        .slice(0, 8);

    const ultimosMovimientos = [...movimientosFiltrados]
        .sort((a, b) => new Date(getFechaMovimiento(b)) - new Date(getFechaMovimiento(a)))
        .slice(0, 7);

    const totalSaldo = cuentasFiltradas.reduce((acc, item) => acc + getSaldoActual(item), 0);
    const totalInicial = cuentasFiltradas.reduce((acc, item) => acc + getSaldoInicial(item), 0);

    const variacion =
        totalInicial > 0 ? ((totalSaldo - totalInicial) / totalInicial) * 100 : 0;

    const totalGeneralMoneda = fondosPorMoneda.reduce((acc, x) => acc + x.value, 0);

    const conciliacionResumen = {
        conciliados: conciliaciones.reduce((acc, x) => acc + Number(x.totalConciliados ?? 0), 0),
        pendientesBanco: conciliaciones.reduce((acc, x) => acc + Number(x.totalPendientesBanco ?? 0), 0),
        pendientesLibros: conciliaciones.reduce((acc, x) => acc + Number(x.totalPendientesLibros ?? 0), 0),
        diferencias: conciliaciones.reduce((acc, x) => acc + Number(x.totalDiferencias ?? 0), 0),
    };

    const conciliacionChart = [
        { name: "Conciliados", value: conciliacionResumen.conciliados },
        { name: "Pend. Banco", value: conciliacionResumen.pendientesBanco },
        { name: "Pend. Libros", value: conciliacionResumen.pendientesLibros },
        { name: "Diferencias", value: conciliacionResumen.diferencias },
    ].filter((x) => x.value > 0);

    const hoy = new Date();
    const proximosVencer = chequesFiltrados.filter((c) => {
        const estado = getEstadoCheque(c).toLowerCase();
        const fecha = new Date(getChequeFechaVencimiento(c));
        if (Number.isNaN(fecha.getTime())) return false;

        const dias = (fecha - hoy) / (1000 * 60 * 60 * 24);

        return dias >= 0 && dias <= 15 && !estado.includes("cobrado") && !estado.includes("cancelado");
    }).length;

    return (
        <div className="analytics-grid">
            <div className="analytics-hero-card">
                <div>
                    <span className="analytics-eyebrow">Cubo financiero</span>
                    <h3>Resumen Ejecutivo de Cuentas Bancarias</h3>
                    <p>
                        Vista consolidada de liquidez, bancos, monedas, cuentas, movimientos,
                        cheques, conciliaciones y comportamiento financiero.
                    </p>
                </div>

                <div className="dashboard-cube-actions">
                    <select
                        className="dashboard-currency-filter"
                        value={filtros.moneda}
                        onChange={(e) => handleFiltro("moneda", e.target.value)}
                    >
                        <option value="TODAS">Todas las monedas</option>
                        <option value="GTQ">Quetzales GTQ</option>
                        <option value="USD">Dólares USD</option>
                    </select>

                    <select
                        className="dashboard-currency-filter"
                        value={filtros.banco}
                        onChange={(e) => handleFiltro("banco", e.target.value)}
                    >
                        <option value="TODOS">Todos los bancos</option>
                        {bancos.map((b) => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>

                    <select
                        className="dashboard-currency-filter"
                        value={filtros.tipoCuenta}
                        onChange={(e) => handleFiltro("tipoCuenta", e.target.value)}
                    >
                        <option value="TODOS">Todos los tipos</option>
                        {tiposCuenta.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>

                    <select
                        className="dashboard-currency-filter dashboard-account-filter"
                        value={filtros.cuenta}
                        onChange={(e) => handleFiltro("cuenta", e.target.value)}
                    >
                        <option value="TODAS">Todas las cuentas</option>
                        {cuentasOpciones.map((c) => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                    </select>

                    <input
                        className="dashboard-currency-filter"
                        type="month"
                        value={filtros.periodo}
                        onChange={(e) => handleFiltro("periodo", e.target.value)}
                    />

                    <button
                        type="button"
                        className="dashboard-clear-filter"
                        onClick={() =>
                            setFiltros({
                                moneda: "TODAS",
                                banco: "TODOS",
                                cuenta: "TODAS",
                                tipoCuenta: "TODOS",
                                periodo: "",
                            })
                        }
                    >
                        Limpiar
                    </button>

                    <div className="analytics-hero-metric">
                        <span>Variación Global</span>
                        <strong>{variacion.toFixed(2)}%</strong>
                    </div>
                </div>
            </div>

            <div className="chart-card chart-card-wide">
                <div className="chart-header">
                    <h3>Evolución Financiera</h3>
                    <span>Ingresos y egresos separados por moneda y fecha</span>
                </div>

                <ResponsiveContainer width="100%" height={330}>
                    <AreaChart data={flujoPorFecha}>
                        <defs>
                            <linearGradient id="ingresosGTQ" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.35} />
                                <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0.02} />
                            </linearGradient>
                            <linearGradient id="egresosGTQ" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.sky} stopOpacity={0.35} />
                                <stop offset="95%" stopColor={COLORS.sky} stopOpacity={0.02} />
                            </linearGradient>
                            <linearGradient id="ingresosUSD" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.teal} stopOpacity={0.35} />
                                <stop offset="95%" stopColor={COLORS.teal} stopOpacity={0.02} />
                            </linearGradient>
                            <linearGradient id="egresosUSD" x1="0" y1="0" x2="0" y2="1">
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
                                <Area type="monotone" dataKey="ingresosGTQ" name="Ingresos GTQ" stroke={COLORS.blue} strokeWidth={3} fill="url(#ingresosGTQ)" />
                                <Area type="monotone" dataKey="egresosGTQ" name="Egresos GTQ" stroke={COLORS.sky} strokeWidth={3} fill="url(#egresosGTQ)" />
                            </>
                        )}

                        {(filtros.moneda === "TODAS" || filtros.moneda === "USD") && (
                            <>
                                <Area type="monotone" dataKey="ingresosUSD" name="Ingresos USD" stroke={COLORS.teal} strokeWidth={3} fill="url(#ingresosUSD)" />
                                <Area type="monotone" dataKey="egresosUSD" name="Egresos USD" stroke={COLORS.navy2} strokeWidth={3} fill="url(#egresosUSD)" />
                            </>
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card">
                <div className="chart-header">
                    <h3>Distribución de Fondos</h3>
                    <span>Participación del saldo por banco y moneda</span>
                </div>

                <ResponsiveContainer width="100%" height={330}>
                    <PieChart>
                        <Pie data={fondosPorBanco} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105} paddingAngle={4}>
                            {fondosPorBanco.map((_, index) => (
                                <Cell key={index} fill={PALETTE[index % PALETTE.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value, _name, props) => money(value, props.payload.moneda)} />
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
                    <BarChart data={saldoPorBanco} layout="vertical" margin={{ top: 10, right: 25, left: 35, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                        <XAxis type="number" tick={{ fontSize: 11, fill: COLORS.slate }} />
                        <YAxis type="category" dataKey="banco" width={120} tick={{ fontSize: 11, fill: COLORS.navy }} />
                        <Tooltip formatter={(value, _name, props) => money(value, props.payload.moneda)} />
                        <Bar dataKey="saldo" name="Saldo actual" fill={COLORS.blue} radius={[0, 10, 10, 0]} barSize={24} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card">
                <div className="chart-header">
                    <h3>Saldos por Moneda</h3>
                    <span>Totales financieros GTQ / USD sin mezclar monedas</span>
                </div>

                <div className="currency-summary">
                    {fondosPorMoneda.map((m, index) => (
                        <div className="currency-row" key={m.key}>
                            <div>
                                <span>{m.name}</span>
                                <strong>{money(m.value, m.key)}</strong>
                            </div>
                            <div className="currency-bar">
                                <div
                                    style={{
                                        width: `${totalGeneralMoneda > 0 ? (m.value / totalGeneralMoneda) * 100 : 0}%`,
                                        background: PALETTE[index % PALETTE.length],
                                    }}
                                />
                            </div>
                        </div>
                    ))}

                    <div className="mini-alert-card">
                        <strong>{proximosVencer}</strong>
                        <span>cheques próximos a vencer en 15 días</span>
                    </div>
                </div>
            </div>

            <div className="chart-card chart-half-row">
                <div className="chart-header">
                    <h3>Estado de Cheques</h3>
                    <span>Cheques cobrados, emitidos, pendientes y cancelados</span>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={estadoCheques} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} paddingAngle={4}>
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
                    <h3>Últimos Movimientos</h3>
                    <span>Movimientos recientes con cuenta, banco, tipo y saldo</span>
                </div>

                <div className="latest-movements-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Cuenta</th>
                                <th>Banco</th>
                                <th>Tipo</th>
                                <th>Monto</th>
                                <th>Saldo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ultimosMovimientos.map((m, index) => {
                                const cuenta = getCuentaFromMovimiento(m, cuentaById);
                                const moneda = getMonedaKey(cuenta);

                                return (
                                    <tr key={index}>
                                        <td>{formatFechaCorta(getFechaMovimiento(m))}</td>
                                        <td>{getNumeroCuenta(cuenta)}</td>
                                        <td>{getBanco(cuenta)}</td>
                                        <td>
                                            <span className="movement-pill">
                                                {g(m, "tiM_Descripcion", "tIM_Descripcion", "tim_descripcion") || "Sin tipo"}
                                            </span>
                                        </td>
                                        <td className="movement-money">
                                            {money(getMontoMovimiento(m), moneda)}
                                        </td>
                                        <td className="movement-money">
                                            {money(getSaldoMovimiento(m), moneda)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="chart-card chart-half-row">
                <div className="chart-header">
                    <h3>Conciliación Bancaria</h3>
                    <span>Conciliados, pendientes banco, pendientes libros y diferencias</span>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={conciliacionChart} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} paddingAngle={4}>
                            {conciliacionChart.map((_, index) => (
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
                    <h3>Monto de Cheques por Estado</h3>
                    <span>Importe total agrupado por estado del cheque</span>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={montoChequesPorEstado}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="estado" tick={{ fontSize: 11, fill: COLORS.slate }} />
                        <YAxis tick={{ fontSize: 11, fill: COLORS.slate }} />
                        <Tooltip formatter={(value, _name, props) => money(value, props.payload.moneda)} />
                        <Bar dataKey="monto" name="Monto" fill={COLORS.navy2} radius={[10, 10, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-card chart-card-full">
                <div className="chart-header">
                    <h3>Top Cuentas con Mayor Saldo</h3>
                    <span>Ranking por liquidez disponible, cuenta, banco, titular y moneda</span>
                </div>

                <div className="latest-movements-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Cuenta</th>
                                <th>Titular</th>
                                <th>Banco</th>
                                <th>Tipo</th>
                                <th>Moneda</th>
                                <th>Saldo Actual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topCuentas.map((c, index) => {
                                const moneda = getMonedaKey(c);

                                return (
                                    <tr key={index}>
                                        <td>{getNumeroCuenta(c)}</td>
                                        <td>{getTitular(c)}</td>
                                        <td>{getBanco(c)}</td>
                                        <td>{getTipoCuenta(c)}</td>
                                        <td>
                                            <span className="movement-pill">
                                                {moneda}
                                            </span>
                                        </td>
                                        <td className="movement-money">
                                            {money(getSaldoActual(c), moneda)}
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