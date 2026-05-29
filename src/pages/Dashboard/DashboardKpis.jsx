import {
    Wallet,
    TrendingUp,
    TrendingDown,
    CreditCard,
    FileText,
    BadgeCheck,
} from "lucide-react";

const money = (value, symbol) =>
    `${symbol} ${Number(value ?? 0).toLocaleString("es-GT", {
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

export default function DashboardKpis({ metricas, filtros }) {
    const mostrarGTQ = filtros.moneda === "TODAS" || filtros.moneda === "GTQ";
    const mostrarUSD = filtros.moneda === "TODAS" || filtros.moneda === "USD";

    return (
        <div className="executive-kpi-grid">
            {mostrarGTQ && (
                <KpiCard
                    label="Saldo Total GTQ"
                    value={money(metricas.saldoGTQ, "Q")}
                    icon={<Wallet size={24} />}
                    type="navy"
                />
            )}

            {mostrarUSD && (
                <KpiCard
                    label="Saldo Total USD"
                    value={money(metricas.saldoUSD, "$")}
                    icon={<Wallet size={24} />}
                    type="blue"
                />
            )}

            {mostrarGTQ && (
                <KpiCard
                    label="Ingresos GTQ"
                    value={money(metricas.ingresosGTQ, "Q")}
                    icon={<TrendingUp size={24} />}
                    type="soft"
                />
            )}

            {mostrarUSD && (
                <KpiCard
                    label="Ingresos USD"
                    value={money(metricas.ingresosUSD, "$")}
                    icon={<TrendingUp size={24} />}
                    type="soft"
                />
            )}

            {mostrarGTQ && (
                <KpiCard
                    label="Egresos GTQ"
                    value={money(metricas.egresosGTQ, "Q")}
                    icon={<TrendingDown size={24} />}
                    type="sky"
                />
            )}

            {mostrarUSD && (
                <KpiCard
                    label="Egresos USD"
                    value={money(metricas.egresosUSD, "$")}
                    icon={<TrendingDown size={24} />}
                    type="sky"
                />
            )}

            <KpiCard
                label="Cuentas Activas"
                value={metricas.cuentasActivas}
                icon={<CreditCard size={24} />}
                type="steel"
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