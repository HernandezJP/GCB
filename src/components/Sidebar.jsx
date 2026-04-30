import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    Building2, CreditCard, UserSquare2, Menu, ChevronLeft,
    LogOut, LayoutDashboard, Phone, MapPin, Coins, FileText,
    Wallet, FileSignature, Receipt, Shuffle, ArrowLeftRight,
    Tag, X, BookOpen, TrendingUp, Repeat, Zap, ChevronDown,
    ChevronRight, Users, Shield, BarChart3
} from 'lucide-react';
import './Sidebar.css';

const menuGroups = [
    {
        title: 'General',
        collapsible: false,
        items: [
            { title: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
        ]
    },
    {
        title: 'Operaciones',
        collapsible: false,
        items: [
            { title: 'Cuentas Bancarias', icon: <CreditCard size={18} />, path: '/cuentas-bancarias' },
            { title: 'Movimientos', icon: <ArrowLeftRight size={18} />, path: '/movimientos' },
            { title: 'Cheques', icon: <FileSignature size={18} />, path: '/cheques' },
            { title: 'Chequeras', icon: <BookOpen size={18} />, path: '/chequeras' },
            { title: 'Conciliación', icon: <Wallet size={18} />, path: '/conciliacion' },
            { title: 'Personas', icon: <Users size={18} />, path: '/personas' },
        ]
    },
    {
        title: 'Reportes',
        collapsible: true,
        items: [
            {title: 'Reporte Cuentas Bancarias',icon: <BarChart3 size={18} />, path: '/reportes/cuentas-bancarias'},
            {title: 'Reporte Conciliaciones', icon: <Wallet size={18} />, path: '/reportes/conciliaciones'},
            { title: 'Reporte Movimientos', icon: <ArrowLeftRight size={18} />, path: '/reportes/movimientos' },
            { title: 'Reporte Chequeras', icon: <BookOpen size={18} />, path: '/reportes/chequeras' },
        ]
    },
    {
        title: 'Catálogos Bancarios',
        collapsible: true,
        items: [
            { title: 'Bancos', icon: <Building2 size={18} />, path: '/bancos' },
            { title: 'Tipos de Cuenta', icon: <CreditCard size={18} />, path: '/tipos-cuenta' },
            { title: 'Tipos de Moneda', icon: <Coins size={18} />, path: '/tipos-moneda' },
            { title: 'Estados de Cuenta', icon: <FileText size={18} />, path: '/estados-cuenta' },
            { title: 'Estados de Cheque', icon: <FileSignature size={18} />, path: '/estados-cheque' },
        ]
    },
    {
        title: 'Catálogos de Personas',
        collapsible: true,
        items: [
            { title: 'Tipos de Persona', icon: <UserSquare2 size={18} />, path: '/tipos-persona' },
            { title: 'Tipos de Teléfono', icon: <Phone size={18} />, path: '/tipos-telefono' },
            { title: 'Tipos de Dirección', icon: <MapPin size={18} />, path: '/tipos-direccion' },
        ]
    },
    {
        title: 'Catálogos de Movimientos',
        collapsible: true,
        items: [
            { title: 'Tipos de Movimiento', icon: <Shuffle size={18} />, path: '/tipos-movimiento' },
            { title: 'Medios de Movimiento', icon: <ArrowLeftRight size={18} />, path: '/medios-movimiento' },
            { title: 'Estados de Movimiento', icon: <Tag size={18} />, path: '/estados-movimiento' },
        ]
    },
    {
        title: 'Catálogos de Conciliación',
        collapsible: true,
        items: [
            { title: 'Estado Conciliación', icon: <Wallet size={18} />, path: '/estados-conciliacion' },
            { title: 'Estado Detalle Conciliación', icon: <Receipt size={18} />, path: '/estados-detalle-conciliacion' },
        ]
    },
    {
        title: 'Configuración',
        collapsible: true,
        items: [
            { title: 'Tasas de Interés', icon: <TrendingUp size={18} />, path: '/tasas-interes' },
            { title: 'Frecuencia de Interés', icon: <Repeat size={18} />, path: '/interes-frecuencias' },
            { title: 'Conversión de Moneda', icon: <Coins size={18} />, path: '/conversiones-moneda' },
            { title: 'Reglas de Recargo', icon: <Zap size={18} />, path: '/reglas-recargo' },
        ]
    },
    {
        title: 'Seguridad',
        collapsible: true,
        items: [
            { title: 'Roles', icon: <Shield size={18} />, path: '/roles' },
            { title: 'Usuarios', icon: <Users size={18} />, path: '/usuarios' },
        ]
    },
];

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    const [groupOpen, setGroupOpen] = useState(
        Object.fromEntries(
            menuGroups
                .filter(g => g.collapsible)
                .map(g => [g.title, g.title === 'Reportes'])
        )
    );

    const toggleGroup = (title) => {
        setGroupOpen(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const showLabels = isOpen || mobileOpen;

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

                <button className="toggle-control desktop-toggle" onClick={() => setIsOpen(o => !o)}>
                    {isOpen ? <ChevronLeft size={16} /> : <Menu size={16} />}
                </button>

                <button className="toggle-control mobile-close" onClick={() => setMobileOpen(false)}>
                    <X size={16} />
                </button>
            </div>

            <nav className="sidebar-content">
                {menuGroups.map((group, gi) => {
                    const isExpanded = !group.collapsible || groupOpen[group.title];

                    return (
                        <div className="nav-group" key={gi}>
                            {showLabels && (
                                <div
                                    className={`group-title ${group.collapsible ? 'group-collapsible' : ''}`}
                                    onClick={() => group.collapsible && toggleGroup(group.title)}
                                >
                                    <span>{group.title}</span>

                                    {group.collapsible && (
                                        <span className="group-chevron">
                                            {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
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
                                                onClick={() => setMobileOpen(false)}
                                                className={({ isActive }) =>
                                                    isActive ? 'nav-item active' : 'nav-item'
                                                }
                                            >
                                                <span className="icon-wrapper">{item.icon}</span>

                                                {showLabels && (
                                                    <span className="label">{item.title}</span>
                                                )}

                                                {!showLabels && (
                                                    <div className="floating-tooltip">{item.title}</div>
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
                <button className="action-btn logout">
                    <LogOut size={18} />
                    {showLabels && <span>Cerrar sesión</span>}
                    {!showLabels && <div className="floating-tooltip">Salir</div>}
                </button>
            </div>
        </>
    );

    return (
        <>
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(o => !o)}>
                <Menu size={22} />
            </button>

            {mobileOpen && (
                <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
            )}

            <aside className={`sidebar desktop-sidebar ${isOpen ? 'open' : 'closed'}`}>
                <SidebarContent />
            </aside>

            <aside className={`sidebar mobile-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
                <SidebarContent />
            </aside>
        </>
    );
};

export default Sidebar;