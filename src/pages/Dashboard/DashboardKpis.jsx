import {
    Wallet,
    TrendingUp,
    TrendingDown,
    CreditCard,
    FileText,
    BadgeCheck,
} from "lucide-react";

const getSymbol = (monedaFiltro) => {
    if (monedaFiltro === "USD") return "$";
    return "Q";
};

const formatMoney = (value, monedaFiltro = "GTQ") =>
    `${getSymbol(monedaFiltro)} ${Number(value ?? 0).toLocaleString("es-GT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const KpiCard = ({ label, value, icon, type = "blue" }) => {
    return (
        <div className={`executive-kpi-card kpi-${type}`}>
            <div>
                <span className="executive-kpi-label">{label}</span>
                <strong className="executive-kpi-value">{value}</strong>
            </div>

            <div className="executive-kpi-icon">
                {icon}
            </div>
        </div>
    );
};

export default function DashboardKpis({ metricas, monedaFiltro = "TODAS" }) {
    const monedaVisual = monedaFiltro === "TODAS" ? "GTQ" : monedaFiltro;

    return (
        <div className="executive-kpi-grid">
            <KpiCard
                label="Saldo Total Disponible"
                value={formatMoney(metricas.saldoTotal, monedaVisual)}
                icon={<Wallet size={24} />}
                type="navy"
            />

            <KpiCard
                label="Ingresos del Mes"
                value={formatMoney(metricas.totalIngresosMes, monedaVisual)}
                icon={<TrendingUp size={24} />}
                type="blue"
            />

            <KpiCard
                label="Egresos del Mes"
                value={formatMoney(metricas.totalEgresosMes, monedaVisual)}
                icon={<TrendingDown size={24} />}
                type="sky"
            />

            <KpiCard
                label="Cuentas Activas"
                value={metricas.cuentasActivas}
                icon={<CreditCard size={24} />}
                type="soft"
            />

            <KpiCard
                label="Cheques Pendientes"
                value={metricas.chequesPendientes}
                icon={<FileText size={24} />}
                type="steel"
            />

            <KpiCard
                label="% Conciliación"
                value={`${Number(metricas.porcentajeConciliacion ?? 0).toFixed(1)}%`}
                icon={<BadgeCheck size={24} />}
                type="teal"
            />
        </div>
    );
}