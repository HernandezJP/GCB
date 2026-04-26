import { Search } from "lucide-react";

const getValue = (obj, keys) => {
    for (const key of keys) {
        if (obj?.[key] !== undefined && obj?.[key] !== null) {
            return obj[key];
        }
    }

    return "";
};

export default function ReporteCuentaBancariaFilter({
    filtros,
    setFiltros,
    bancos,
    tiposCuenta,
    tiposMoneda,
    estadosCuenta,
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
            bancoId: "",
            tipoCuentaId: "",
            tipoMonedaId: "",
            estadoCuentaId: "",
            estadoRegistro: "",
            busqueda: "",
        });
    };

    return (
        <div className="toolbar reporte-toolbar">
            <div className="input-group filtro-select">
                <label>Banco</label>
                <select
                    name="bancoId"
                    value={filtros.bancoId}
                    onChange={handleChange}
                >
                    <option value="">Todos los bancos</option>

                    {bancos.map((banco) => {
                        const id = getValue(banco, [
                            "baN_Banco",
                            "BAN_Banco",
                            "ban_Banco",
                            "id",
                        ]);

                        const nombre = getValue(banco, [
                            "baN_Nombre",
                            "BAN_Nombre",
                            "ban_Nombre",
                            "nombre",
                            "banco",
                        ]);

                        return (
                            <option key={id} value={id}>
                                {nombre}
                            </option>
                        );
                    })}
                </select>
            </div>

            <div className="input-group filtro-select">
                <label>Tipo de cuenta</label>
                <select
                    name="tipoCuentaId"
                    value={filtros.tipoCuentaId}
                    onChange={handleChange}
                >
                    <option value="">Todos los tipos</option>

                    {tiposCuenta.map((tipo) => {
                        const id = getValue(tipo, [
                            "tcU_Tipo_Cuenta",
                            "TCU_Tipo_Cuenta",
                            "tcu_Tipo_Cuenta",
                            "id",
                        ]);

                        const nombre = getValue(tipo, [
                            "tcU_Descripcion",
                            "TCU_Descripcion",
                            "tcu_Descripcion",
                            "Descripcion",
                            "tipoCuenta",
                        ]);

                        return (
                            <option key={id} value={id}>
                                {nombre}
                            </option>
                        );
                    })}
                </select>
            </div>

            <div className="input-group filtro-select">
                <label>Moneda</label>
                <select
                    name="tipoMonedaId"
                    value={filtros.tipoMonedaId}
                    onChange={handleChange}
                >
                    <option value="">Todas las monedas</option>

                    {tiposMoneda.map((moneda) => {
                        const id = getValue(moneda, [
                            "tmO_Tipo_Moneda",
                            "TMO_Tipo_Moneda",
                            "tmo_Tipo_Moneda",
                            "id",
                        ]);

                        const nombre = getValue(moneda, [
                            "tmO_Descripcion",
                            "TMO_Descripcion",
                            "tmo_Descripcion",
                            "Descripcion",
                            "tipoMoneda",
                        ]);

                        return (
                            <option key={id} value={id}>
                                {nombre}
                            </option>
                        );
                    })}
                </select>
            </div>

            <div className="input-group filtro-select">
                <label>Estado cuenta</label>
                <select
                    name="estadoCuentaId"
                    value={filtros.estadoCuentaId}
                    onChange={handleChange}
                >
                    <option value="">Todos los estados</option>

                    {estadosCuenta.map((estado) => {
                        const id = getValue(estado, [
                            "esC_Estado_Cuenta",
                            "ESC_Estado_Cuenta",
                            "esc_Estado_Cuenta",
                            "id",
                        ]);

                        const nombre = getValue(estado, [
                            "esC_Descripcion",
                            "ESC_Descripcion",
                            "esc_Descripcion",
                            "Descripcion",
                            "estadoCuenta",
                        ]);

                        return (
                            <option key={id} value={id}>
                                {nombre}
                            </option>
                        );
                    })}
                </select>
            </div>

            <div className="input-group filtro-select">
                <label>Estado registro</label>
                <select
                    name="estadoRegistro"
                    value={filtros.estadoRegistro}
                    onChange={handleChange}
                >
                    <option value="">Todos</option>
                    <option value="A">Activos</option>
                    <option value="I">Inactivos</option>
                </select>
            </div>

            <div className="search-bar reporte-search">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    name="busqueda"
                    placeholder="Buscar por cuenta, banco, titular, moneda o estado..."
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