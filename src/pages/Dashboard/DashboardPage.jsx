import { useEffect, useMemo, useState } from "react";

import DashboardKpis from "./DashboardKpis";
import DashboardChartsCuentasBancarias from "./DashboardChartsCuentasBancarias";
import DashboardChartsMovimientos from "./DashboardChartsMovimientos";
import DashboardChartsCheques from "./DashboardChartsCheques";

import {
    getDashboardCuentas,
    getDashboardConciliaciones,
} from "../../services/DashboardService";

import { getMovimientos } from "../../services/MovimientoService";
import { getCheques } from "../../services/ChequeService";

import "./Dashboard.css";

const g = (o, ...ks) => {
    for (const k of ks) {
        const v = o?.[k];
        if (v !== undefined && v !== null) return v;
    }
    return "";
};

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

const getBanco = (item) =>
    g(item, "banco", "Banco", "bAN_Nombre", "BAN_Nombre") || "Sin banco";

const getTipoCuenta = (item) =>
    g(item, "tipoCuenta", "TipoCuenta", "tcU_Descripcion", "TCU_Descripcion") || "Sin tipo";

const getTipoMovimiento = (m) =>
    String(g(m, "tiM_Descripcion", "tIM_Descripcion", "tim_descripcion")).toLowerCase();

const getMontoMovimiento = (m) =>
    Math.abs(Number(g(m, "moV_Monto", "mOV_Monto", "MOV_Monto", "mov_monto") || 0));

const esIngreso = (m) => getTipoMovimiento(m) === "ingreso";

const getEstadoCheque = (c) =>
    String(
        g(
            c,
            "estadoCheque",
            "EstadoCheque",
            "esC_Descripcion",
            "eSC_Descripcion",
            "ESC_Descripcion"
        )
    ).toLowerCase();

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
        )
    ).toLowerCase();

const getMonedaKey = (item) => {
    const moneda = getMonedaTexto(item);

    if (
        moneda.includes("dólar") ||
        moneda.includes("dolar") ||
        moneda.includes("usd")
    ) {
        return "USD";
    }

    return "GTQ";
};

const getFechaMovimiento = (m) =>
    g(m, "moV_Fecha", "mOV_Fecha", "MOV_Fecha", "mov_fecha");

const getFechaCheque = (c) =>
    g(c, "chE_Fecha_Emision", "cHE_Fecha_Emision", "CHE_Fecha_Emision");

const getPeriodoFecha = (fecha) => {
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return "";

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export default function DashboardPage() {
    const [cuentas, setCuentas] = useState([]);
    const [conciliaciones, setConciliaciones] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [cheques, setCheques] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [filtros, setFiltros] = useState({
        moneda: "TODAS",
        banco: "TODOS",
        cuenta: "TODAS",
        tipoCuenta: "TODOS",
        periodo: "",
    });

    const cargarDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                cuentasData,
                conciliacionesData,
                movimientosData,
                chequesData,
            ] = await Promise.all([
                getDashboardCuentas(),
                getDashboardConciliaciones(),
                getMovimientos(),
                getCheques(),
            ]);

            setCuentas(Array.isArray(cuentasData) ? cuentasData : []);
            setConciliaciones(Array.isArray(conciliacionesData) ? conciliacionesData : []);
            setMovimientos(Array.isArray(movimientosData) ? movimientosData : []);
            setCheques(Array.isArray(chequesData) ? chequesData : []);
        } catch (error) {
            console.error("Error al cargar dashboard:", error);
            setError("No se pudo cargar el dashboard.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDashboard();
    }, []);

    const cubo = useMemo(() => {
        let cuentasFiltradas = [...cuentas];

        if (filtros.moneda !== "TODAS") {
            cuentasFiltradas = cuentasFiltradas.filter(
                (c) => getMonedaKey(c) === filtros.moneda
            );
        }

        if (filtros.banco !== "TODOS") {
            cuentasFiltradas = cuentasFiltradas.filter(
                (c) => getBanco(c) === filtros.banco
            );
        }

        if (filtros.tipoCuenta !== "TODOS") {
            cuentasFiltradas = cuentasFiltradas.filter(
                (c) => getTipoCuenta(c) === filtros.tipoCuenta
            );
        }

        if (filtros.cuenta !== "TODAS") {
            cuentasFiltradas = cuentasFiltradas.filter(
                (c) => getCuentaId(c) === String(filtros.cuenta)
            );
        }

        const cuentasIds = new Set(cuentasFiltradas.map(getCuentaId).filter(Boolean));

        let movimientosFiltrados =
            filtros.moneda === "TODAS" &&
            filtros.banco === "TODOS" &&
            filtros.cuenta === "TODAS" &&
            filtros.tipoCuenta === "TODOS"
                ? [...movimientos]
                : movimientos.filter((m) => cuentasIds.has(getCuentaId(m)));

        let chequesFiltrados =
            filtros.moneda === "TODAS" &&
            filtros.banco === "TODOS" &&
            filtros.cuenta === "TODAS" &&
            filtros.tipoCuenta === "TODOS"
                ? [...cheques]
                : cheques.filter((c) => cuentasIds.has(getCuentaId(c)));

        if (filtros.periodo) {
            movimientosFiltrados = movimientosFiltrados.filter(
                (m) => getPeriodoFecha(getFechaMovimiento(m)) === filtros.periodo
            );

            chequesFiltrados = chequesFiltrados.filter(
                (c) => getPeriodoFecha(getFechaCheque(c)) === filtros.periodo
            );
        }

        return {
            cuentasFiltradas,
            movimientosFiltrados,
            chequesFiltrados,
        };
    }, [cuentas, movimientos, cheques, filtros]);

    const metricas = useMemo(() => {
        const { cuentasFiltradas, movimientosFiltrados, chequesFiltrados } = cubo;

        const cuentaById = new Map(
            cuentasFiltradas.map((c) => [getCuentaId(c), c])
        );

        const saldoGTQ = cuentasFiltradas
            .filter((c) => getMonedaKey(c) === "GTQ")
            .reduce(
                (acc, item) =>
                    acc + Number(g(item, "cuB_Saldo_Actual", "CUB_Saldo_Actual") || 0),
                0
            );

        const saldoUSD = cuentasFiltradas
            .filter((c) => getMonedaKey(c) === "USD")
            .reduce(
                (acc, item) =>
                    acc + Number(g(item, "cuB_Saldo_Actual", "CUB_Saldo_Actual") || 0),
                0
            );

        const ingresosGTQ = movimientosFiltrados
            .filter((m) => {
                const cuenta = cuentaById.get(getCuentaId(m));
                return esIngreso(m) && getMonedaKey(cuenta) === "GTQ";
            })
            .reduce((acc, item) => acc + getMontoMovimiento(item), 0);

        const ingresosUSD = movimientosFiltrados
            .filter((m) => {
                const cuenta = cuentaById.get(getCuentaId(m));
                return esIngreso(m) && getMonedaKey(cuenta) === "USD";
            })
            .reduce((acc, item) => acc + getMontoMovimiento(item), 0);

        const egresosGTQ = movimientosFiltrados
            .filter((m) => {
                const cuenta = cuentaById.get(getCuentaId(m));
                return !esIngreso(m) && getMonedaKey(cuenta) === "GTQ";
            })
            .reduce((acc, item) => acc + getMontoMovimiento(item), 0);

        const egresosUSD = movimientosFiltrados
            .filter((m) => {
                const cuenta = cuentaById.get(getCuentaId(m));
                return !esIngreso(m) && getMonedaKey(cuenta) === "USD";
            })
            .reduce((acc, item) => acc + getMontoMovimiento(item), 0);

        const cuentasActivas = cuentasFiltradas.filter(
            (x) => g(x, "cuB_Estado", "CUB_Estado") === "A"
        ).length;

        const chequesPendientes = chequesFiltrados.filter((c) => {
            const estado = getEstadoCheque(c);
            return (
                estado.includes("emitido") ||
                estado.includes("pendiente") ||
                estado.includes("activo")
            );
        }).length;

        const movimientosConciliados = conciliaciones.reduce(
            (acc, item) => acc + Number(item.totalConciliados ?? 0),
            0
        );

        const pendientesBanco = conciliaciones.reduce(
            (acc, item) => acc + Number(item.totalPendientesBanco ?? 0),
            0
        );

        const pendientesLibros = conciliaciones.reduce(
            (acc, item) => acc + Number(item.totalPendientesLibros ?? 0),
            0
        );

        const totalMovConciliacion =
            movimientosConciliados + pendientesBanco + pendientesLibros;

        const porcentajeConciliacion =
            totalMovConciliacion > 0
                ? (movimientosConciliados / totalMovConciliacion) * 100
                : 0;

        return {
            saldoGTQ,
            saldoUSD,
            ingresosGTQ,
            ingresosUSD,
            egresosGTQ,
            egresosUSD,
            cuentasActivas,
            chequesPendientes,
            porcentajeConciliacion,
        };
    }, [cubo, conciliaciones]);

    return (
        <div className="dashboard-container">
            <div className="page-header dashboard-main-header">
                <div className="page-header-left">
                    <h1>Dashboard Ejecutivo GCB</h1>
                    <span className="record-count">
                        Cubo financiero de cuentas bancarias
                    </span>
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loading ? (
                <div className="loading-state">Cargando dashboard...</div>
            ) : (
                <>
                    <DashboardKpis
                        metricas={metricas}
                        filtros={filtros}
                    />

                    <div className="dashboard-section">
                        <div className="dashboard-section-header">
                            <h2>Cubo de Cuentas Bancarias</h2>
                            <span>
                                Análisis ejecutivo por moneda, banco, cuenta, tipo de cuenta y período
                            </span>
                        </div>

                        <DashboardChartsCuentasBancarias
                            cuentas={cuentas}
                            movimientos={movimientos}
                            cheques={cheques}
                            conciliaciones={conciliaciones}
                            filtros={filtros}
                            setFiltros={setFiltros}
                            cubo={cubo}
                        />

                        <div className="dashboard-section">
                            <div className="dashboard-section-header">
                                <h2>Cubo de Movimientos</h2>
                                <span>
                                    Análisis ejecutivo de ingresos, egresos, medios de movimiento,
                                    recargos y comportamiento financiero
                                </span>
                            </div>

                            <DashboardChartsMovimientos
                                movimientos={movimientos}
                                cuentas={cuentas}
                            />
                        </div>
                        <div className="dashboard-section">
                            <div className="dashboard-section-header">
                                <h2>Cubo de Cheques</h2>
                                <span>
                                    Análisis ejecutivo de cheques emitidos, cobrados, pendientes,
                                    vencimientos, bancos y monedas
                                </span>
                            </div>

                            <DashboardChartsCheques
                                cheques={cheques}
                                cuentas={cuentas}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}