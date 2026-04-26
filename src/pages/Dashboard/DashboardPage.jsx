import { useEffect, useMemo, useState } from "react";
import DashboardKpis from "./DashboardKpis";
import DashboardCharts from "./DashboardChartsCuentasBancarias";
import DashboardConciliacionCharts from "./DashboardChartsConciliacion";
import {
    getDashboardCuentas,
    getDashboardConciliaciones,
} from "../../services/DashboardService";
import "./Dashboard.css";

export default function DashboardPage() {
    const [cuentas, setCuentas] = useState([]);
    const [conciliaciones, setConciliaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const cargarDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const [cuentasData, conciliacionesData] = await Promise.all([
                getDashboardCuentas(),
                getDashboardConciliaciones(),
            ]);

            setCuentas(cuentasData);
            setConciliaciones(conciliacionesData);
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
        };
    }, [cuentas, conciliaciones]);

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

                    <div className="dashboard-section dashboard-disabled">
                        <div className="dashboard-section-header">
                            <h2>Movimientos</h2>
                            <span>Próximamente: ingresos, egresos y comportamiento mensual</span>
                        </div>
                    </div>

                    <div className="dashboard-section dashboard-disabled">
                        <div className="dashboard-section-header">
                            <h2>Cheques</h2>
                            <span>Próximamente: pendientes, cobrados, anulados y emitidos</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}