import { Search } from "lucide-react";

const getValue = (obj, keys) => {
    for (const key of keys) {
        if (obj?.[key] !== undefined && obj?.[key] !== null) {
            return obj[key];
        }
    }

    return "";
};

export default function ReporteConciliacionFilter({
    filtros,
    setFiltros,
    cuentas,
    estados,
    onBuscar,
}) {
    const handleChange = (e) => {
        setFiltros({
            ...filtros,
            [e.target.name]: e.target.value,
        });
    };

    const limpiarFiltros = () => {
        setFiltros({
            cuentaId: "",
            estadoConciliacion: "",
            periodo: "",
            busqueda: "",
        });
    };

    return (
        <div className="toolbar reporte-toolbar">
            <div className="input-group filtro-select">
                <label>Cuenta bancaria</label>

                <select
                    name="cuentaId"
                    value={filtros.cuentaId}
                    onChange={handleChange}
                >
                    <option value="">Todas las cuentas</option>

                    {cuentas.map((cuenta) => {
                        const id = getValue(cuenta, [
                            "cuB_Cuenta",
                            "CUB_Cuenta",
                            "cub_Cuenta",
                        ]);

                        const numero = getValue(cuenta, [
                            "cuB_Numero_Cuenta",
                            "CUB_Numero_Cuenta",
                            "cub_Numero_Cuenta",
                        ]);

                        const banco = getValue(cuenta, [
                            "banco",
                            "BAN_Nombre",
                            "baN_Nombre",
                        ]);

                        return (
                            <option key={id} value={id}>
                                {numero} {banco ? `- ${banco}` : ""}
                            </option>
                        );
                    })}
                </select>
            </div>

            <div className="input-group filtro-select">
                <label>Estado conciliación</label>

                <select
                    name="estadoConciliacion"
                    value={filtros.estadoConciliacion}
                    onChange={handleChange}
                >
                    <option value="">Todos los estados</option>

                    {estados.map((estado) => (
                        <option key={estado} value={estado}>
                            {estado}
                        </option>
                    ))}
                </select>
            </div>

            <div className="input-group filtro-select">
                <label>Periodo</label>

                <input
                    type="month"
                    name="periodo"
                    value={filtros.periodo}
                    onChange={handleChange}
                />
            </div>

            <div className="search-bar reporte-search">
                <Search size={18} className="search-icon" />

                <input
                    type="text"
                    name="busqueda"
                    placeholder="Buscar por cuenta, banco, periodo o estado..."
                    value={filtros.busqueda}
                    onChange={handleChange}
                />
            </div>

            <div className="reporte-filter-actions">
                <button className="btn-secondary" onClick={limpiarFiltros}>
                    Limpiar
                </button>

                <button className="btn-primary" onClick={onBuscar}>
                    Buscar
                </button>
            </div>
        </div>
    );
}