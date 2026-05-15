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
  Legend,
  CartesianGrid,
} from "recharts";

const COLORS = ["#0284c7", "#15803d", "#d97706", "#dc2626", "#7c3aed"];

const getValue = (obj, keys) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
  }
  return "";
};

const formatMoney = (value) =>
  `Q ${Number(value ?? 0).toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getEstado = (c) =>
  getValue(c, [
    "estadoCheque",
    "EstadoCheque",
    "esC_Descripcion",
    "eSC_Descripcion",
    "ESC_Descripcion",
  ]) || "Sin estado";

const getMonto = (c) =>
  Math.abs(
    Number(
      getValue(c, ["moV_Monto", "mOV_Monto", "MOV_Monto", "mov_monto"]) || 0
    )
  );

const getCuentaIdCheque = (c) =>
  getValue(c, [
    "cuB_Cuenta",
    "cUB_Cuenta",
    "CUB_Cuenta",
    "cub_Cuenta",
    "cub_cuenta",
  ]);

const getCuentaId = (c) =>
  getValue(c, [
    "cuB_Cuenta",
    "cUB_Cuenta",
    "CUB_Cuenta",
    "cub_Cuenta",
    "cub_cuenta",
  ]);

const getBancoCuenta = (c) =>
  getValue(c, [
    "banco",
    "Banco",
    "bancoNombre",
    "BancoNombre",
    "baN_Nombre",
    "bAN_Nombre",
    "BAN_Nombre",
    "ban_nombre",
  ]);

const getBanco = (cheque, cuentas = []) => {
  const bancoDirecto = getValue(cheque, [
    "banco",
    "Banco",
    "bancoNombre",
    "BancoNombre",
    "baN_Nombre",
    "bAN_Nombre",
    "BAN_Nombre",
    "ban_nombre",
  ]);

  if (bancoDirecto) return bancoDirecto;

  const cuentaId = getCuentaIdCheque(cheque);

  const cuenta = cuentas.find(
    (c) => String(getCuentaId(c)) === String(cuentaId)
  );

  return getBancoCuenta(cuenta) || "Sin banco";
};

export default function DashboardChartsCheques({ cheques, cuentas = [] }) {
  if (!cheques?.length) {
    return (
      <div className="table-container">
        <div className="empty-state">
          No hay información suficiente para mostrar gráficas de cheques.
        </div>
      </div>
    );
  }

  const chequesPorEstado = Object.values(
    cheques.reduce((acc, item) => {
      const estado = getEstado(item);
      acc[estado] = acc[estado] || { name: estado, value: 0 };
      acc[estado].value += 1;
      return acc;
    }, {})
  );

  const montoPorEstado = Object.values(
    cheques.reduce((acc, item) => {
      const estado = getEstado(item);
      acc[estado] = acc[estado] || { estado, monto: 0 };
      acc[estado].monto += getMonto(item);
      return acc;
    }, {})
  );

  const chequesPorBanco = Object.values(
    cheques.reduce((acc, item) => {
      const banco = getBanco(item, cuentas);
      acc[banco] = acc[banco] || { banco, total: 0 };
      acc[banco].total += 1;
      return acc;
    }, {})
  );

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <div className="chart-header">
          <h3>Cheques por Estado</h3>
          <span>Emitidos, cobrados, cancelados y rechazados</span>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chequesPorEstado}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
            >
              {chequesPorEstado.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h3>Monto por Estado</h3>
          <span>Total monetario agrupado por estado del cheque</span>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={montoPorEstado}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="estado" tick={{ fontSize: 11 }} />
            <YAxis
              tickFormatter={(value) =>
                `Q${Number(value).toLocaleString("es-GT")}`
              }
            />
            <Tooltip formatter={(value) => formatMoney(value)} />
            <Bar
              dataKey="monto"
              name="Monto"
              fill="#0284c7"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h3>Cheques por Banco</h3>
          <span>Cantidad de cheques emitidos por banco</span>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chequesPorBanco}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="banco" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar
              dataKey="total"
              name="Cheques"
              fill="#15803d"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}