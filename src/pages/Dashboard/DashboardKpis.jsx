import {
    CreditCard,
    Wallet,
    Building2,
    CheckCircle,
    XCircle,
    Landmark,
    Scale,
    AlertTriangle,
    Clock,
} from "lucide-react";

const formatMoney = (value) =>
    `Q ${Number(value ?? 0).toLocaleString("es-GT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export default function DashboardKpis({ metricas }) {
    return (
        <div className="kpi-grid">
            <div className="kpi-card kpi-blue">
                <div>
                    <div className="kpi-label">Total Cuentas</div>
                    <div className="kpi-value">{metricas.totalCuentas}</div>
                </div>
                <div className="kpi-icon icon-blue">
                    <CreditCard size={24} />
                </div>
            </div>

            <div className="kpi-card kpi-green">
                <div>
                    <div className="kpi-label">Saldo Actual</div>
                    <div className="kpi-value">{formatMoney(metricas.saldoTotal)}</div>
                </div>
                <div className="kpi-icon icon-green">
                    <Wallet size={24} />
                </div>
            </div>

            <div className="kpi-card kpi-amber">
                <div>
                    <div className="kpi-label">Saldo Inicial</div>
                    <div className="kpi-value">{formatMoney(metricas.saldoInicial)}</div>
                </div>
                <div className="kpi-icon icon-amber">
                    <Building2 size={24} />
                </div>
            </div>

            <div className="kpi-card kpi-green">
                <div>
                    <div className="kpi-label">Cuentas Activas</div>
                    <div className="kpi-value">{metricas.cuentasActivas}</div>
                </div>
                <div className="kpi-icon icon-green">
                    <CheckCircle size={24} />
                </div>
            </div>

            <div className="kpi-card kpi-red">
                <div>
                    <div className="kpi-label">Cuentas Inactivas</div>
                    <div className="kpi-value">{metricas.cuentasInactivas}</div>
                </div>
                <div className="kpi-icon icon-red">
                    <XCircle size={24} />
                </div>
            </div>

            <div className="kpi-card kpi-blue">
                <div>
                    <div className="kpi-label">Bancos Utilizados</div>
                    <div className="kpi-value">{metricas.bancosUtilizados}</div>
                </div>
                <div className="kpi-icon icon-blue">
                    <Landmark size={24} />
                </div>
            </div>

            <div className="kpi-card kpi-blue">
                <div>
                    <div className="kpi-label">Conciliaciones</div>
                    <div className="kpi-value">{metricas.totalConciliaciones}</div>
                </div>
                <div className="kpi-icon icon-blue">
                    <Scale size={24} />
                </div>
            </div>

            <div className="kpi-card kpi-red">
                <div>
                    <div className="kpi-label">Diferencia Conciliación</div>
                    <div className="kpi-value">{formatMoney(metricas.diferenciaConciliacion)}</div>
                </div>
                <div className="kpi-icon icon-red">
                    <AlertTriangle size={24} />
                </div>
            </div>

            <div className="kpi-card kpi-green">
                <div>
                    <div className="kpi-label">Mov. Conciliados</div>
                    <div className="kpi-value">{metricas.movimientosConciliados}</div>
                </div>
                <div className="kpi-icon icon-green">
                    <CheckCircle size={24} />
                </div>
            </div>

            <div className="kpi-card kpi-amber">
                <div>
                    <div className="kpi-label">Pendientes Conciliación</div>
                    <div className="kpi-value">{metricas.pendientesConciliacion}</div>
                </div>
                <div className="kpi-icon icon-amber">
                    <Clock size={24} />
                </div>
            </div>
        </div>
    );
}