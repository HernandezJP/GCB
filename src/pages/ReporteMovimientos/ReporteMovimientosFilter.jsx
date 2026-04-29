import { Search } from "lucide-react";

const getValue = (obj, keys) => {
    for (const key of keys) {
        if (obj?.[key] !== undefined && obj?.[key] !== null) {
            return obj[key];
        }
    }

    return "";
};

export default function ReporteMovimientosFilter({
    filtros,
    setFiltros,
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
            tipoMovimientoId: "",
            medioMovimientoId: "",
            estadoMovimientoId: "",
            busqueda: "",
        });
    };

    return (
        <div className="toolbar reporte-toolbar">
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
                            "id",
                        ]);

                        const nombre = getValue(tipo, [
                            "tiM_Descripcion",
                            "tIM_Descripcion",
                            "tim_descripcion",
                            "descripcion",
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
                            "id",
                        ]);

                        const nombre = getValue(medio, [
                            "meM_Descripcion",
                            "mEM_Descripcion",
                            "mem_descripcion",
                            "descripcion",
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
                            "id",
                        ]);

                        const nombre = getValue(estado, [
                            "esM_Descripcion",
                            "eSM_Descripcion",
                            "esm_descripcion",
                            "descripcion",
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
                    placeholder="Buscar por cuenta, persona, descripción, referencia o medio..."
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