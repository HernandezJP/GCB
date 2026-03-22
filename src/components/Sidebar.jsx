import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';
import './Sidebar.css';

const menuGroups = [
    {
        title: 'General',
        items: [
            { title: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
        ]
    },
    {
        title: 'Catálogos Bancarios',
        items: [
            { title: 'Bancos',           icon: <Building2 size={18} />,     path: '/bancos' },
            { title: 'Tipos de Cuenta',  icon: <CreditCard size={18} />,    path: '/tipos-cuenta' },
            { title: 'Tipos de Moneda',  icon: <Coins size={18} />,         path: '/tipos-moneda' },
            { title: 'Estados de Cuenta',icon: <FileText size={18} />,      path: '/estados-cuenta' },
            { title: 'Estados de Cheque',icon: <FileSignature size={18} />, path: '/estados-cheque' },
        ]
    },
    {
        title: 'Catálogos de Personas',
        items: [
            { title: 'Tipos de Persona',    icon: <UserSquare2 size={18} />, path: '/tipos-persona' },
            { title: 'Tipos de Teléfono',   icon: <Phone size={18} />,       path: '/tipos-telefono' },
            { title: 'Tipos de Dirección',  icon: <MapPin size={18} />,      path: '/tipos-direccion' },
        ]
    },
    {
        title: 'Catálogos de Movimientos',
        items: [
            { title: 'Tipos de Movimiento',  icon: <Shuffle size={18} />,       path: '/tipos-movimiento' },
            { title: 'Medios de Movimiento', icon: <ArrowLeftRight size={18} />, path: '/medios-movimiento' },
            { title: 'Estados de Movimiento',icon: <Tag size={18} />,            path: '/estados-movimiento' },
        ]
    },
    {
        title: 'Conciliación',
        items: [
            { title: 'Estado Conciliación',         icon: <Wallet size={18} />,  path: '/estados-conciliacion' },
            { title: 'Estado Detalle Conciliación', icon: <Receipt size={18} />, path: '/estados-detalle-conciliacion' },
        ]
    },
];

const Sidebar = () => {
    const [isOpen,       setIsOpen]       = useState(true);
    const [mobileOpen,   setMobileOpen]   = useState(false);

    const toggleDesktop = () => setIsOpen(o => !o);
    const toggleMobile  = () => setMobileOpen(o => !o);

    const SidebarContent = () => (
        <>
            <div className="sidebar-header">
                <div className="logo-section">
                    <div className="logo-icon">
                        <Building2 size={16} />
                    </div>
                    {(isOpen || mobileOpen) && (
                        <span className="logo-text">Core<span className="dot">Bank</span></span>
                    )}
                </div>
                {/* Desktop toggle */}
                <button className="toggle-control desktop-toggle" onClick={toggleDesktop}>
                    {isOpen ? <ChevronLeft size={16} /> : <Menu size={16} />}
                </button>
                {/* Mobile close */}
                <button className="toggle-control mobile-close" onClick={() => setMobileOpen(false)}>
                    <X size={16} />
                </button>
            </div>

            <nav className="sidebar-content">
                {menuGroups.map((group, gi) => (
                    <div className="nav-group" key={gi}>
                        {(isOpen || mobileOpen) && (
                            <p className="group-title">{group.title}</p>
                        )}
                        <ul className="nav-list">
                            {group.items.map((item, ii) => (
                                <li key={ii}>
                                    <NavLink
                                        to={item.path}
                                        onClick={() => setMobileOpen(false)}
                                        className={({ isActive }) =>
                                            isActive ? 'nav-item active' : 'nav-item'
                                        }
                                    >
                                        <span className="icon-wrapper">{item.icon}</span>
                                        {(isOpen || mobileOpen) && (
                                            <span className="label">{item.title}</span>
                                        )}
                                        {!isOpen && !mobileOpen && (
                                            <div className="floating-tooltip">{item.title}</div>
                                        )}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="action-btn logout">
                    <LogOut size={18} />
                    {(isOpen || mobileOpen) && <span>Cerrar sesión</span>}
                    {!isOpen && !mobileOpen && (
                        <div className="floating-tooltip">Salir</div>
                    )}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Botón hamburguesa móvil */}
            <button className="mobile-menu-btn" onClick={toggleMobile}>
                <Menu size={22} />
            </button>

            {/* Overlay móvil */}
            {mobileOpen && (
                <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
            )}

            {/* Sidebar desktop */}
            <aside className={`sidebar desktop-sidebar ${isOpen ? 'open' : 'closed'}`}>
                <SidebarContent />
            </aside>

            {/* Sidebar móvil */}
            <aside className={`sidebar mobile-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
                <SidebarContent />
            </aside>
        </>
    );
};

export default Sidebar;