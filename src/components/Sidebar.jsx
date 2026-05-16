import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

import {
    Building2,
    CreditCard,
    UserSquare2,
    Menu,
    ChevronLeft,
    LogOut,
    LayoutDashboard,
    Phone,
    MapPin,
    Coins,
    FileText,
    Wallet,
    FileSignature,
    Receipt,
    Shuffle,
    ArrowLeftRight,
    Tag,
    X,
    BookOpen,
    TrendingUp,
    Repeat,
    Zap,
    ChevronDown,
    ChevronRight,
    Users,
    Shield,
    BarChart3,
} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";

import "./Sidebar.css";

const menuGroups = [
    {
        title: "General",
        collapsible: false,
        roles: ["Administrador", "Auxiliar", "Contador"],
        items: [
            {
                title: "Dashboard",
                icon: <LayoutDashboard size={18} />,
                path: "/",
                roles: ["Administrador", "Auxiliar", "Contador"],
            },
        ],
    },
    {
        title: "Operaciones",
        collapsible: false,
        roles: ["Administrador", "Auxiliar", "Contador"],
        items: [
            {
                title: "Cuentas Bancarias",
                icon: <CreditCard size={18} />,
                path: "/cuentas-bancarias",
                roles: ["Administrador", "Auxiliar", "Contador"],
            },
            {
                title: "Movimientos",
                icon: <ArrowLeftRight size={18} />,
                path: "/movimientos",
                roles: ["Administrador", "Auxiliar", "Contador"],
            },
            {
                title: "Cheques",
                icon: <FileSignature size={18} />,
                path: "/cheques",
                roles: ["Administrador", "Auxiliar", "Contador"],
            },
            {
                title: "Chequeras",
                icon: <BookOpen size={18} />,
                path: "/chequeras",
                roles: ["Administrador", "Auxiliar", "Contador"],
            },
            {
                title: "Conciliación",
                icon: <Wallet size={18} />,
                path: "/conciliacion",
                roles: ["Administrador", "Contador"],
            },
            {
                title: "Personas",
                icon: <Users size={18} />,
                path: "/personas",
                roles: ["Administrador", "Auxiliar", "Contador"],
            },
        ],
    },
    {
        title: "Reportes",
        collapsible: true,
        roles: ["Administrador", "Contador"],
        items: [
            {
                title: "Reporte Cuentas Bancarias",
                icon: <BarChart3 size={18} />,
                path: "/reportes/cuentas-bancarias",
                roles: ["Administrador", "Contador"],
            },
            {
                title: "Reporte Conciliaciones",
                icon: <Wallet size={18} />,
                path: "/reportes/conciliaciones",
                roles: ["Administrador", "Contador"],
            },
            {
                title: "Reporte Movimientos",
                icon: <ArrowLeftRight size={18} />,
                path: "/reportes/movimientos",
                roles: ["Administrador", "Contador"],
            },
            {
                title: "Reporte Cheques",
                icon: <FileText size={18} />,
                path: "/reportes/cheques",
                roles: ["Administrador", "Contador"],
            },
        ],
    },
    {
        title: "Catálogos Bancarios",
        collapsible: true,
        roles: ["Administrador"],
        items: [
            {
                title: "Bancos",
                icon: <Building2 size={18} />,
                path: "/bancos",
                roles: ["Administrador"],
            },
            {
                title: "Tipos de Cuenta",
                icon: <CreditCard size={18} />,
                path: "/tipos-cuenta",
                roles: ["Administrador"],
            },
            {
                title: "Tipos de Moneda",
                icon: <Coins size={18} />,
                path: "/tipos-moneda",
                roles: ["Administrador"],
            },
            {
                title: "Estados de Cuenta",
                icon: <FileText size={18} />,
                path: "/estados-cuenta",
                roles: ["Administrador"],
            },
            {
                title: "Estados de Cheque",
                icon: <FileSignature size={18} />,
                path: "/estados-cheque",
                roles: ["Administrador"],
            },
        ],
    },
    {
        title: "Catálogos de Personas",
        collapsible: true,
        roles: ["Administrador"],
        items: [
            {
                title: "Tipos de Persona",
                icon: <UserSquare2 size={18} />,
                path: "/tipos-persona",
                roles: ["Administrador"],
            },
            {
                title: "Tipos de Teléfono",
                icon: <Phone size={18} />,
                path: "/tipos-telefono",
                roles: ["Administrador"],
            },
            {
                title: "Tipos de Dirección",
                icon: <MapPin size={18} />,
                path: "/tipos-direccion",
                roles: ["Administrador"],
            },
        ],
    },
    {
        title: "Catálogos de Movimientos",
        collapsible: true,
        roles: ["Administrador"],
        items: [
            {
                title: "Tipos de Movimiento",
                icon: <Shuffle size={18} />,
                path: "/tipos-movimiento",
                roles: ["Administrador"],
            },
            {
                title: "Medios de Movimiento",
                icon: <ArrowLeftRight size={18} />,
                path: "/medios-movimiento",
                roles: ["Administrador"],
            },
            {
                title: "Estados de Movimiento",
                icon: <Tag size={18} />,
                path: "/estados-movimiento",
                roles: ["Administrador"],
            },
        ],
    },
    {
        title: "Catálogos de Conciliación",
        collapsible: true,
        roles: ["Administrador"],
        items: [
            {
                title: "Estado Conciliación",
                icon: <Wallet size={18} />,
                path: "/estados-conciliacion",
                roles: ["Administrador"],
            },
            {
                title: "Estado Detalle Conciliación",
                icon: <Receipt size={18} />,
                path: "/estados-detalle-conciliacion",
                roles: ["Administrador"],
            },
        ],
    },
    {
        title: "Configuración",
        collapsible: true,
        roles: ["Administrador"],
        items: [
            {
                title: "Tasas de Interés",
                icon: <TrendingUp size={18} />,
                path: "/tasas-interes",
                roles: ["Administrador"],
            },
            {
                title: "Frecuencia de Interés",
                icon: <Repeat size={18} />,
                path: "/interes-frecuencias",
                roles: ["Administrador"],
            },
            {
                title: "Conversión de Moneda",
                icon: <Coins size={18} />,
                path: "/conversiones-moneda",
                roles: ["Administrador"],
            },
            {
                title: "Reglas de Recargo",
                icon: <Zap size={18} />,
                path: "/reglas-recargo",
                roles: ["Administrador"],
            },
        ],
    },
    {
        title: "Seguridad",
        collapsible: true,
        roles: ["Administrador"],
        items: [
            {
                title: "Roles",
                icon: <Shield size={18} />,
                path: "/rol",
                roles: ["Administrador"],
            },
            {
                title: "Usuarios",
                icon: <Users size={18} />,
                path: "/usuario",
                roles: ["Administrador"],
            },
        ],
    },
];

const canAccess = (rol, roles = []) => {
    if (!roles || roles.length === 0) return true;
    return roles.includes(rol);
};

const Sidebar = () => {
    const { rol, logout } = useAuth();

    const [isOpen, setIsOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    const filteredGroups = useMemo(() => {
        return menuGroups
            .filter((group) => canAccess(rol, group.roles))
            .map((group) => ({
                ...group,
                items: group.items.filter((item) =>
                    canAccess(rol, item.roles)
                ),
            }))
            .filter((group) => group.items.length > 0);
    }, [rol]);

    const [groupOpen, setGroupOpen] = useState(
        Object.fromEntries(
            menuGroups
                .filter((g) => g.collapsible)
                .map((g) => [g.title, g.title === "Reportes"])
        )
    );

    const toggleGroup = (title) => {
        setGroupOpen((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    const showLabels = isOpen || mobileOpen;

    const handleLogout = () => {
        logout();
    };

    const SidebarContent = () => (
        <>
            <div className="sidebar-header">
                <div className="logo-section">
                    <div className="logo-icon">
                        <Building2 size={16} />
                    </div>

                    {showLabels && (
                        <span className="logo-text">
                            Core<span className="dot">Bank</span>
                        </span>
                    )}
                </div>

                <button
                    type="button"
                    className="toggle-control desktop-toggle"
                    onClick={() => setIsOpen((open) => !open)}
                >
                    {isOpen ? (
                        <ChevronLeft size={16} />
                    ) : (
                        <Menu size={16} />
                    )}
                </button>

                <button
                    type="button"
                    className="toggle-control mobile-close"
                    onClick={() => setMobileOpen(false)}
                >
                    <X size={16} />
                </button>
            </div>

            <nav className="sidebar-content">
                {filteredGroups.map((group, gi) => {
                    const isExpanded =
                        !group.collapsible || groupOpen[group.title];

                    return (
                        <div className="nav-group" key={gi}>
                            {showLabels && (
                                <div
                                    className={`group-title ${
                                        group.collapsible
                                            ? "group-collapsible"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        group.collapsible &&
                                        toggleGroup(group.title)
                                    }
                                >
                                    <span>{group.title}</span>

                                    {group.collapsible && (
                                        <span className="group-chevron">
                                            {isExpanded ? (
                                                <ChevronDown size={11} />
                                            ) : (
                                                <ChevronRight size={11} />
                                            )}
                                        </span>
                                    )}
                                </div>
                            )}

                            {(isExpanded || !showLabels) && (
                                <ul className="nav-list">
                                    {group.items.map((item, ii) => (
                                        <li key={ii}>
                                            <NavLink
                                                to={item.path}
                                                onClick={() =>
                                                    setMobileOpen(false)
                                                }
                                                className={({ isActive }) =>
                                                    isActive
                                                        ? "nav-item active"
                                                        : "nav-item"
                                                }
                                            >
                                                <span className="icon-wrapper">
                                                    {item.icon}
                                                </span>

                                                {showLabels && (
                                                    <span className="label">
                                                        {item.title}
                                                    </span>
                                                )}

                                                {!showLabels && (
                                                    <div className="floating-tooltip">
                                                        {item.title}
                                                    </div>
                                                )}
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <button
                    type="button"
                    className="action-btn logout"
                    onClick={handleLogout}
                >
                    <LogOut size={18} />

                    {showLabels && <span>Cerrar sesión</span>}

                    {!showLabels && (
                        <div className="floating-tooltip">Salir</div>
                    )}
                </button>
            </div>
        </>
    );

    return (
        <>
            <button
                type="button"
                className="mobile-menu-btn"
                onClick={() => setMobileOpen((open) => !open)}
            >
                <Menu size={22} />
            </button>

            {mobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={`sidebar desktop-sidebar ${
                    isOpen ? "open" : "closed"
                }`}
            >
                <SidebarContent />
            </aside>

            <aside
                className={`sidebar mobile-sidebar ${
                    mobileOpen ? "mobile-open" : ""
                }`}
            >
                <SidebarContent />
            </aside>
        </>
    );
};

export default Sidebar;