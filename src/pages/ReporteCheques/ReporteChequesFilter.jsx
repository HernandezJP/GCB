import { Search } from "lucide-react";

export default function ReporteChequesFilter({ filtros, setFiltros, onBuscar }) {
    const handleChange = (e) => {
        setFiltros({
            ...filtros,
            [e.target.name]: e.target.value,
        });
    };

    const limpiarFiltros = () => {
        setFiltros({
            cuentaId: "",
            estadoChequeId: "",
            chequeraId: "",
            personaId: "",
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
                <label>Estado Cheque ID</label>
                <input
                    type="number"
                    name="estadoChequeId"
                    placeholder="Ej. 1"
                    value={filtros.estadoChequeId}
                    onChange={handleChange}
                />
            </div>

            <div className="input-group filtro-select">
                <label>Chequera ID</label>
                <input
                    type="number"
                    name="chequeraId"
                    placeholder="Ej. 1"
                    value={filtros.chequeraId}
                    onChange={handleChange}
                />
            </div>

            <div className="input-group filtro-select">
                <label>Persona ID</label>
                <input
                    type="number"
                    name="personaId"
                    placeholder="Ej. 1"
                    value={filtros.personaId}
                    onChange={handleChange}
                />
            </div>

            <div className="search-bar reporte-search">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    name="busqueda"
                    placeholder="Buscar por cheque, cuenta, beneficiario, concepto o estado..."
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