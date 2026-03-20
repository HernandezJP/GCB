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
import EstadoChequePage from './pages/EstadoCheque/EstadoChequePage';
import EstadoConciliacionPage from './pages/EstadoConciliacion/EstadoConciliacionPage';
import EstadoDetalleConciliacionPage from './pages/EstadoDetalleConciliacion/EstadoDetalleConciliacionPage';

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
          <Route path="/estados-cheque" element={<EstadoChequePage />} />
          <Route path="/estados-conciliacion" element={<EstadoConciliacionPage />} />
          <Route path="/estados-detalle-conciliacion" element={<EstadoDetalleConciliacionPage />} />
        </Routes>
      </main>
    </Router>
  )
}

export default App
