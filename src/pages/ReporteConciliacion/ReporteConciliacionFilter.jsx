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

const getNombreTitular = (cuenta) => {
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

    return [
        primerNombre,
        segundoNombre,
        primerApellido,
        segundoApellido,
    ]
        .filter(Boolean)
        .join(" ");
};

export default function ReporteConciliacionFilter({
    filtros,
    setFiltros,
    cuentas = [],
    estados = [],
    onBuscar,
}) {
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFiltros((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const limpiarFiltros = () => {
        setFiltros({
            cuentaId: "",
            estadoConciliacion: "",
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
                    value={filtros.cuentaId ?? ""}
                    onChange={handleChange}
                >
                    <option value="">Todas las cuentas</option>

                    {cuentas.map((cuenta) => {
                        const id = getValue(cuenta, [
                            "cuB_Cuenta",
                            "cUB_Cuenta",
                            "CUB_Cuenta",
                            "cub_Cuenta",
                            "cub_cuenta",
                        ]);

                        const numero = getValue(cuenta, [
                            "cuB_Numero_Cuenta",
                            "cUB_Numero_Cuenta",
                            "CUB_Numero_Cuenta",
                            "cub_Numero_Cuenta",
                            "cub_numero_cuenta",
                        ]);

                        const banco = getValue(cuenta, [
                            "baN_Nombre",
                            "bAN_Nombre",
                            "BAN_Nombre",
                            "ban_nombre",
                            "banco",
                            "Banco",
                        ]);

                        const tipoCuenta = getValue(cuenta, [
                            "tcU_Descripcion",
                            "tCU_Descripcion",
                            "TCU_Descripcion",
                            "tcu_descripcion",
                            "tipoCuenta",
                        ]);

                        const titular = getNombreTitular(cuenta);

                        return (
                            <option key={id} value={id}>
                                {numero || "Sin cuenta"}
                                {banco ? ` • ${banco}` : ""}
                                {tipoCuenta ? ` • ${tipoCuenta}` : ""}
                                {titular ? ` • ${titular}` : ""}
                            </option>
                        );
                    })}
                </select>
            </div>

            <div className="input-group filtro-select">
                <label>Estado conciliación</label>

                <select
                    name="estadoConciliacion"
                    value={filtros.estadoConciliacion ?? ""}
                    onChange={handleChange}
                >
                    <option value="">Todos los estados</option>

                    {estados.map((estado) => {
                        const id = getValue(estado, [
                            "ecO_Estado_Conciliacion",
                            "eCO_Estado_Conciliacion",
                            "ECO_Estado_Conciliacion",
                            "eco_Estado_Conciliacion",
                            "eco_estado_conciliacion",
                        ]);

                        const descripcion = getValue(estado, [
                            "ecO_Descripcion",
                            "eCO_Descripcion",
                            "ECO_Descripcion",
                            "eco_Descripcion",
                            "eco_descripcion",
                            "descripcion",
                        ]);

                        return (
                            <option key={id} value={descripcion}>
                                {descripcion}
                            </option>
                        );
                    })}
                </select>
            </div>

            <div className="input-group filtro-select">
                <label>Tipo de periodo</label>

                <select
                    name="modoFecha"
                    value={filtros.modoFecha ?? "mes"}
                    onChange={handleChange}
                >
                    <option value="mes">Por mes</option>
                    <option value="rango">Rango personalizado</option>
                </select>
            </div>

            {filtros.modoFecha === "mes" ? (
                <div className="input-group filtro-select">
                    <label>Periodo</label>

                    <input
                        type="month"
                        name="periodo"
                        value={filtros.periodo ?? ""}
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
                            value={filtros.fechaInicio ?? ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="input-group filtro-select">
                        <label>Fecha fin</label>

                        <input
                            type="date"
                            name="fechaFin"
                            value={filtros.fechaFin ?? ""}
                            onChange={handleChange}
                        />
                    </div>
                </>
            )}

            <div className="search-bar reporte-search">
                <Search size={18} className="search-icon" />

                <input
                    type="text"
                    name="busqueda"
                    placeholder="Buscar por cuenta, banco, titular, periodo o estado..."
                    value={filtros.busqueda ?? ""}
                    onChange={handleChange}
                />
            </div>

            <div className="reporte-filter-actions">
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={limpiarFiltros}
                >
                    Limpiar
                </button>

                <button
                    type="button"
                    className="btn-primary"
                    onClick={onBuscar}
                >
                    Buscar
                </button>
            </div>
        </div>
    );
}