import { useEffect, useMemo, useState } from "react";

import DashboardKpis from "./DashboardKpis";
import DashboardChartsCuentasBancarias from "./DashboardChartsCuentasBancarias";

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
    String(g(item, "cuB_Cuenta", "cUB_Cuenta", "CUB_Cuenta", "cub_Cuenta", "cub_cuenta"));

const getTipoMovimiento = (m) =>
    String(g(m, "tiM_Descripcion", "tIM_Descripcion", "tim_descripcion")).toLowerCase();

const getMonto = (m) =>
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

export default function DashboardPage() {
    const [cuentas, setCuentas] = useState([]);
    const [conciliaciones, setConciliaciones] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [cheques, setCheques] = useState([]);
    const [monedaFiltro, setMonedaFiltro] = useState("TODAS");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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

    const metricas = useMemo(() => {
        const cuentasFiltradas =
            monedaFiltro === "TODAS"
                ? cuentas
                : cuentas.filter((c) => getMonedaKey(c) === monedaFiltro);

        const cuentasIdsFiltradas = new Set(
            cuentasFiltradas.map(getCuentaId).filter(Boolean)
        );

        const movimientosFiltrados =
            monedaFiltro === "TODAS"
                ? movimientos
                : movimientos.filter((m) =>
                    cuentasIdsFiltradas.has(getCuentaId(m))
                );

        const chequesFiltrados =
            monedaFiltro === "TODAS"
                ? cheques
                : cheques.filter((c) =>
                    cuentasIdsFiltradas.has(getCuentaId(c))
                );

        const saldoTotal = cuentasFiltradas.reduce(
            (acc, item) =>
                acc + Number(g(item, "cuB_Saldo_Actual", "CUB_Saldo_Actual") || 0),
            0
        );

        const saldoInicial = cuentasFiltradas.reduce(
            (acc, item) =>
                acc + Number(g(item, "cuB_Saldo_Inicial", "CUB_Saldo_Inicial") || 0),
            0
        );

        const totalIngresosMes = movimientosFiltrados
            .filter(esIngreso)
            .reduce((acc, item) => acc + getMonto(item), 0);

        const totalEgresosMes = movimientosFiltrados
            .filter((m) => !esIngreso(m))
            .reduce((acc, item) => acc + getMonto(item), 0);

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

        const pendientesConciliacion = conciliaciones.reduce(
            (acc, item) =>
                acc +
                Number(item.totalPendientesBanco ?? 0) +
                Number(item.totalPendientesLibros ?? 0),
            0
        );

        const totalMovConciliacion = movimientosConciliados + pendientesConciliacion;

        const porcentajeConciliacion =
            totalMovConciliacion > 0
                ? (movimientosConciliados / totalMovConciliacion) * 100
                : 0;

        return {
            saldoTotal,
            saldoInicial,
            totalIngresosMes,
            totalEgresosMes,
            cuentasActivas,
            chequesPendientes,
            porcentajeConciliacion,
            monedaFiltro,
        };
    }, [cuentas, movimientos, cheques, conciliaciones, monedaFiltro]);

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
                        monedaFiltro={monedaFiltro}
                    />

                    <div className="dashboard-section">
                        <div className="dashboard-section-header">
                            <h2>Cubo de Cuentas Bancarias</h2>
                            <span>
                                Análisis ejecutivo de saldos, bancos, monedas, movimientos y cheques
                            </span>
                        </div>

                        <DashboardChartsCuentasBancarias
                            cuentas={cuentas}
                            movimientos={movimientos}
                            cheques={cheques}
                            conciliaciones={conciliaciones}
                            monedaFiltro={monedaFiltro}
                            setMonedaFiltro={setMonedaFiltro}
                        />
                    </div>
                </>
            )}
        </div>
    );
}