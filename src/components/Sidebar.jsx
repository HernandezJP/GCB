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
    Settings,
    HelpCircle
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);

    const mainMenuItems = [
        { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
        { title: 'Bancos', icon: <Building2 size={20} />, path: '/bancos' },
        { title: 'Tipos de Cuenta', icon: <CreditCard size={20} />, path: '/tipos-cuenta' },
        { title: 'Tipos de Persona', icon: <UserSquare2 size={20} />, path: '/tipos-persona' },
    ];

    const secondaryMenuItems = [
        { title: 'Configuración', icon: <Settings size={20} />, path: '/settings' },
        { title: 'Ayuda', icon: <HelpCircle size={20} />, path: '/ayuda' },
    ];

    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                <div className="logo-section">
                    <div className="logo-icon">M</div>
                    {isOpen && <span className="logo-text">Core<span className="dot">Bank</span></span>}
                </div>
                <button className="toggle-control" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
                </button>
            </div>

            <nav className="sidebar-content">
                <div className="nav-group">
                    {isOpen && <p className="group-title">Principal</p>}
                    <ul className="nav-list">
                        {mainMenuItems.map((item, index) => (
                            <li key={index}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                                >
                                    <span className="icon-wrapper">{item.icon}</span>
                                    {isOpen && <span className="label">{item.title}</span>}
                                    {!isOpen && <div className="floating-tooltip">{item.title}</div>}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            <div className="sidebar-footer">
                <button className="action-btn logout">
                    <LogOut size={20} />
                    {isOpen && <span>Cerrar sesión</span>}
                    {!isOpen && <div className="floating-tooltip">Salir</div>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;