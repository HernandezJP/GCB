import { Search } from "lucide-react";

const getValue = (obj, keys) => {
    for (const key of keys) {
        if (obj?.[key] !== undefined && obj?.[key] !== null) {
            return obj[key];
        }
    }

    return "";
};

const getPeriodoActual = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
};

export default function ReporteMovimientosFilter({
    filtros,
    setFiltros,
    cuentas,
    tiposMovimiento,
    mediosMovimiento,
    estadosMovimiento,
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
            tipoMovimientoId: "",
            medioMovimientoId: "",
            estadoMovimientoId: "",
            personaId: "",
            modoFecha: "mes",
            periodo: getPeriodoActual(),
            fechaInicio: "",
            fechaFin: "",
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
                            "cUB_Cuenta",
                            "cub_cuenta",
                        ]);

                        const numeroCuenta = getValue(cuenta, [
                            "cuB_Numero_Cuenta",
                            "cUB_Numero_Cuenta",
                            "cub_numero_cuenta",
                        ]);

                        const banco = getValue(cuenta, [
                            "baN_Nombre",
                            "bAN_Nombre",
                            "ban_nombre",
                        ]);

                        const tipoCuenta = getValue(cuenta, [
                            "tcU_Descripcion",
                            "tCU_Descripcion",
                            "tcu_descripcion",
                        ]);

                        const primerNombre = getValue(cuenta, [
                            "cuB_Primer_Nombre",
                            "cUB_Primer_Nombre",
                            "cub_primer_nombre",
                        ]);

                        const segundoNombre = getValue(cuenta, [
                            "cuB_Segundo_Nombre",
                            "cUB_Segundo_Nombre",
                            "cub_segundo_nombre",
                        ]);

                        const primerApellido = getValue(cuenta, [
                            "cuB_Primer_Apellido",
                            "cUB_Primer_Apellido",
                            "cub_primer_apellido",
                        ]);

                        const segundoApellido = getValue(cuenta, [
                            "cuB_Segundo_Apellido",
                            "cUB_Segundo_Apellido",
                            "cub_segundo_apellido",
                        ]);

                        const nombreCompleto = [
                            primerNombre,
                            segundoNombre,
                            primerApellido,
                            segundoApellido,
                        ]
                            .filter(Boolean)
                            .join(" ");

                        return (
                            <option key={id} value={id}>
                                {numeroCuenta || "Sin cuenta"}
                                {banco ? ` • ${banco}` : ""}
                                {tipoCuenta ? ` • ${tipoCuenta}` : ""}
                                {nombreCompleto ? ` • ${nombreCompleto}` : ""}
                            </option>
                        );
                    })}
                </select>
            </div>

            <div className="input-group filtro-select">
                <label>Tipo de periodo</label>

                <select
                    name="modoFecha"
                    value={filtros.modoFecha}
                    onChange={handleChange}
                >
                    <option value="mes">Por mes</option>
                    <option value="rango">Rango personalizado</option>
                </select>
            </div>

            {filtros.modoFecha === "mes" ? (
                <div className="input-group filtro-select">
                    <label>Mes del estado</label>

                    <input
                        type="month"
                        name="periodo"
                        value={filtros.periodo}
                        onChange={handleChange}
                    />
                </div>
            ) : (
                <>
                    <div className="input-group filtro-select">
                        <label>Fecha inicio</label>

                        <input
                            type="date"
                            name="fechaInicio"
                            value={filtros.fechaInicio}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="input-group filtro-select">
                        <label>Fecha fin</label>

                        <input
                            type="date"
                            name="fechaFin"
                            value={filtros.fechaFin}
                            onChange={handleChange}
                        />
                    </div>
                </>
            )}

            <div className="input-group filtro-select">
                <label>Tipo movimiento</label>

                <select
                    name="tipoMovimientoId"
                    value={filtros.tipoMovimientoId}
                    onChange={handleChange}
                >
                    <option value="">Todos los tipos</option>

                    {tiposMovimiento.map((tipo) => {
                        const id = getValue(tipo, [
                            "tiM_Tipo_Movimiento",
                            "tIM_Tipo_Movimiento",
                            "tim_tipo_movimiento",
                        ]);

                        const nombre = getValue(tipo, [
                            "tiM_Descripcion",
                            "tIM_Descripcion",
                            "tim_descripcion",
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
                <label>Medio movimiento</label>

                <select
                    name="medioMovimientoId"
                    value={filtros.medioMovimientoId}
                    onChange={handleChange}
                >
                    <option value="">Todos los medios</option>

                    {mediosMovimiento.map((medio) => {
                        const id = getValue(medio, [
                            "meM_Medio_Movimiento",
                            "mEM_Medio_Movimiento",
                            "mem_medio_movimiento",
                        ]);

                        const nombre = getValue(medio, [
                            "meM_Descripcion",
                            "mEM_Descripcion",
                            "mem_descripcion",
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
                <label>Estado movimiento</label>

                <select
                    name="estadoMovimientoId"
                    value={filtros.estadoMovimientoId}
                    onChange={handleChange}
                >
                    <option value="">Todos los estados</option>

                    {estadosMovimiento.map((estado) => {
                        const id = getValue(estado, [
                            "esM_Estado_Movimiento",
                            "eSM_Estado_Movimiento",
                            "esm_estado_movimiento",
                        ]);

                        const nombre = getValue(estado, [
                            "esM_Descripcion",
                            "eSM_Descripcion",
                            "esm_descripcion",
                        ]);

                        return (
                            <option key={id} value={id}>
                                {nombre}
                            </option>
                        );
                    })}
                </select>
            </div>

            <div className="search-bar reporte-search">
                <Search size={18} className="search-icon" />

                <input
                    type="text"
                    name="busqueda"
                    placeholder="Buscar por cuenta, persona, descripción o referencia..."
                    value={filtros.busqueda}
                    onChange={handleChange}
                />
            </div>

            <div className="reporte-filter-actions">
                <button
                    className="btn-secondary"
                    onClick={limpiarFiltros}
                    type="button"
                >
                    Limpiar
                </button>

                <button
                    className="btn-primary"
                    onClick={onBuscar}
                    type="button"
                >
                    Buscar
                </button>
            </div>
        </div>
    );
}