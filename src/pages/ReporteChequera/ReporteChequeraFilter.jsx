import { Search } from "lucide-react";

export default function ReporteChequeraFilter({
    filtros,
    setFiltros,
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
            estado: "",
            busqueda: "",
        });
    };

    return (
        <div className="toolbar reporte-toolbar">
            <div className="input-group filtro-select">
                <label>Cuenta ID</label>
                <input
                    type="number"
                    name="cuentaId"
                    placeholder="Ej. 1"
                    value={filtros.cuentaId}
                    onChange={handleChange}
                />
            </div>

            <div className="input-group filtro-select">
                <label>Estado</label>
                <select
                    name="estado"
                    value={filtros.estado}
                    onChange={handleChange}
                >
                    <option value="">Todos los estados</option>
                    <option value="A">Activa (A)</option>
                    <option value="I">Inactiva (I)</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Activa">Activa</option>
                    <option value="Agotada">Agotada</option>
                    <option value="Anulada">Anulada</option>
                </select>
            </div>

            <div className="search-bar reporte-search">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    name="busqueda"
                    placeholder="Buscar por ID, cuenta, serie o estado..."
                    value={filtros.busqueda}
                    onChange={handleChange}
                />
            </div>

            <div className="reporte-filter-actions">
                <button className="btn-secondary" onClick={limpiarFiltros} type="button">
                    Limpiar
                </button>

                <button className="btn-primary" onClick={onBuscar} type="button">
                    Buscar
                </button>
            </div>
        </div>
    );
}