import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Sidebar from './components/Sidebar'
import BancoPage from './pages/Bancos/BancoPage'
import TipoCuentaPage from './pages/TipoCuenta/TipoCuentaPage'
import TipoPersonaPage from './pages/TipoPersona/TipoPersonaPage';

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
        </Routes>
      </main>
    </Router>
  )
}

export default App
