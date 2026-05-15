import { useEffect, useMemo, useState } from "react";
import DashboardKpis from "./DashboardKpis";
import DashboardCharts from "./DashboardChartsCuentasBancarias";
import DashboardConciliacionCharts from "./DashboardChartsConciliacion";
import DashboardChartsMovimientos from "./DashboardChartsMovimientos";
import {
    getDashboardCuentas,
    getDashboardConciliaciones,
} from "../../services/DashboardService";
import { getMovimientos } from "../../services/MovimientoService";
import "./Dashboard.css";

import DashboardChartsCheques from "./DashboardChartsCheques";
import { getCheques } from "../../services/ChequeService";

export default function DashboardPage() {
    const [cuentas, setCuentas] = useState([]);
    const [conciliaciones, setConciliaciones] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [cheques, setCheques] = useState([]);

    const cargarDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const [
            cuentasData,
            conciliacionesData,
            movimientosData,
            chequesData
        ] = await Promise.all([
            getDashboardCuentas(),
            getDashboardConciliaciones(),
            getMovimientos(),
            getCheques(),
        ]);

            setCuentas(cuentasData);
            setConciliaciones(conciliacionesData);
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
        const totalCuentas = cuentas.length;

        const saldoTotal = cuentas.reduce(
            (acc, item) => acc + Number(item.cuB_Saldo_Actual ?? 0),
            0
        );

        const saldoInicial = cuentas.reduce(
            (acc, item) => acc + Number(item.cuB_Saldo_Inicial ?? 0),
            0
        );

        const cuentasActivas = cuentas.filter(x => x.cuB_Estado === "A").length;
        const cuentasInactivas = cuentas.filter(x => x.cuB_Estado === "I").length;

        const bancosUtilizados = new Set(
            cuentas.map(x => x.banco).filter(Boolean)
        ).size;

        const totalConciliaciones = conciliaciones.length;

        const diferenciaConciliacion = conciliaciones.reduce(
            (acc, item) => acc + Number(item.coN_Diferencia ?? 0),
            0
        );

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

        const totalCheques = cheques.length;

        const chequesCobrados = cheques.filter((c) =>
        String(c.estadoCheque ?? c.EstadoCheque ?? "").toLowerCase().includes("cobrado")
        ).length;

        const chequesCancelados = cheques.filter((c) =>
        String(c.estadoCheque ?? c.EstadoCheque ?? "").toLowerCase().includes("cancelado")
        ).length;

        return {
            totalCuentas,
            saldoTotal,
            saldoInicial,
            cuentasActivas,
            cuentasInactivas,
            bancosUtilizados,
            totalConciliaciones,
            diferenciaConciliacion,
            movimientosConciliados,
            pendientesConciliacion,
            totalCheques,
            chequesCobrados,
            chequesCancelados,
        };
    }, [cuentas, conciliaciones, cheques]);

    return (
        <div className="dashboard-container">
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Dashboard General GCB</h1>
                    <span className="record-count">
                        Resumen financiero del sistema
                    </span>
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loading ? (
                <div className="loading-state">Cargando dashboard...</div>
            ) : (
                <>
                    <DashboardKpis metricas={metricas} />

                    <div className="dashboard-section">
                        <div className="dashboard-section-header">
                            <h2>Cuentas Bancarias</h2>
                            <span>Análisis general de cuentas, bancos, saldos y estados</span>
                        </div>

                        <DashboardCharts cuentas={cuentas} />
                    </div>

                    <div className="dashboard-section">
                        <div className="dashboard-section-header">
                            <h2>Conciliación Bancaria</h2>
                            <span>Resumen de conciliaciones, diferencias y movimientos pendientes</span>
                        </div>

                        <DashboardConciliacionCharts conciliaciones={conciliaciones} />
                    </div>

                    <div className="dashboard-section">
                        <div className="dashboard-section-header">
                            <h2>Movimientos</h2>
                            <span>Ingresos, egresos, medios y recargos registrados</span>
                        </div>

                        <DashboardChartsMovimientos movimientos={movimientos} />
                    </div>

                    <div className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h2>Cheques</h2>
                        <span>Resumen de cheques emitidos, cobrados, cancelados y rechazados</span>
                    </div>

                    <DashboardChartsCheques cheques={cheques} />
                    </div>
                </>
            )}
        </div>
    );
}