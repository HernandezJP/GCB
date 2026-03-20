import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Sidebar from './components/Sidebar'
import BancoPage from './pages/Bancos/BancoPage'
import TipoCuentaPage from './pages/TipoCuenta/TipoCuentaPage'
import TipoPersonaPage from './pages/TipoPersona/TipoPersonaPage';
import TipoTelefonoPage from './pages/TipoTelefono/TipoTelefonoPage';
import TipoDireccionPage from './pages/TipoDireccion/TipoDireccionPage';
import EstadoCuentaPage from './pages/EstadoCuenta/EstadoCuentaPage';
import TipoMonedaPage from './pages/TipoMoneda/TipoMonedaPage';
import TipoMovimientoPage from './pages/TipoMovimiento/TipoMovimientoPage';
import MedioMovimientoPage from './pages/MedioMovimiento/MedioMovimientoPage';
import EstadoMovimientoPage from './pages/EstadoMovimiento/EstadoMovimientoPage';
import MovimientoPage from './pages/Movimiento/MovimientoPage';

// Componentes temporales (Mock) para las rutas vacías
const Dashboard = () => <div style={{ padding: '2rem' }}><h1>Dashboard Principal</h1><p>Bienvenido al Sistema de Gestión.</p></div>;
const Perfil = () => <div style={{ padding: '2rem' }}><h1>Mi Perfil</h1><p>Configuraciones de Usuario.</p></div>;

function App() {
  return (
    <Router>
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/bancos" element={<BancoPage />} />
          <Route path="/tipos-cuenta" element={<TipoCuentaPage />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/tipos-persona" element={<TipoPersonaPage />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/tipos-telefono" element={<TipoTelefonoPage />} />
          <Route path="/tipos-direccion" element={<TipoDireccionPage />} />
          <Route path="/estados-cuenta" element={<EstadoCuentaPage />} />
          <Route path="/tipos-moneda" element={<TipoMonedaPage />} />
          <Route path="/tipos-movimiento" element={<TipoMovimientoPage />} />
          <Route path="/medios-movimiento" element={<MedioMovimientoPage />} />
          <Route path="/estados-movimiento" element={<EstadoMovimientoPage />} />
          <Route path="/movimientos" element={<MovimientoPage />} />
        </Routes>
      </main>
    </Router>
  )
}

export default App
