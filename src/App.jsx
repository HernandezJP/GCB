import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import "./App.css";
import "./global.css";

import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/Auth/LoginPage";

import BancoPage from "./pages/Bancos/BancoPage";
import TipoCuentaPage from "./pages/TipoCuenta/TipoCuentaPage";
import TipoPersonaPage from "./pages/TipoPersona/TipoPersonaPage";
import TipoTelefonoPage from "./pages/TipoTelefono/TipoTelefonoPage";
import TipoDireccionPage from "./pages/TipoDireccion/TipoDireccionPage";
import EstadoCuentaPage from "./pages/EstadoCuenta/EstadoCuentaPage";
import TipoMonedaPage from "./pages/TipoMoneda/TipoMonedaPage";
import EstadoChequePage from "./pages/EstadoCheque/EstadoChequePage";
import EstadoConciliacionPage from "./pages/EstadoConciliacion/EstadoConciliacionPage";
import EstadoDetalleConciliacionPage from "./pages/EstadoDetalleConciliacion/EstadoDetalleConciliacionPage";
import TipoMovimientoPage from "./pages/TipoMovimiento/TipoMovimientoPage";
import MedioMovimientoPage from "./pages/MedioMovimiento/MedioMovimientoPage";
import EstadoMovimientoPage from "./pages/EstadoMovimiento/EstadoMovimientoPage";

import CuentaBancariaPage from "./pages/CuentaBancaria/CuentaBancariaPage";
import PersonaPage from "./pages/Persona/PersonaPage";
import MovimientoPage from "./pages/Movimiento/MovimientoPage";
import TasaInteresPage from "./pages/TasaInteres/TasaInteresPage";
import InteresFrecuenciaPage from "./pages/InteresFrecuencia/InteresFrecuenciaPage";
import ConversionMonedaPage from "./pages/ConversionMoneda/ConversionMonedaPage";
import ReglaRecargoPage from "./pages/ReglaRecargo/ReglaRecargoPage";
import ChequeraPage from "./pages/Chequera/ChequeraPage";
import ChequePage from "./pages/Cheques/ChequePage";
import ConciliacionPage from "./pages/Conciliacion/ConciliacionPage";

import ReporteCuentaBancariaPage from "./pages/ReporteCuentaBancaria/ReporteCuentaBancariaPage";
import ReporteConciliacionPage from "./pages/ReporteConciliacion/ReporteConciliacionPage";
import ReporteMovimientosPage from "./pages/ReporteMovimientos/ReporteMovimientosPage";

import DashboardPage from "./pages/Dashboard/DashboardPage";
import RolPage from "./pages/Rol/RolPage";
import UsuarioPage from "./pages/Usuario/UsuarioPage";
import ReporteChequesPage from "./pages/ReporteCheques/ReporteChequesPage";

const Perfil = () => (
    <div style={{ padding: "2rem" }}>
        <h1>Mi Perfil</h1>
        <p>Configuraciones de Usuario.</p>
    </div>
);

function AppContent() {
    const location = useLocation();
    const isLogin = location.pathname === "/login";

    return (
        <>
            {!isLogin && <Sidebar />}

            <main className={isLogin ? "" : "main-content"}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/cuentas-bancarias"
                        element={
                            <ProtectedRoute roles={["Administrador", "Contador", "Auxiliar"]}>
                                <CuentaBancariaPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/cuentas-bancarias/:id"
                        element={
                            <ProtectedRoute roles={["Administrador", "Contador", "Auxiliar"]}>
                                <CuentaBancariaPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/personas"
                        element={
                            <ProtectedRoute roles={["Administrador", "Contador", "Auxiliar"]}>
                                <PersonaPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/movimientos"
                        element={
                            <ProtectedRoute roles={["Administrador", "Contador", "Auxiliar"]}>
                                <MovimientoPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/chequeras"
                        element={
                            <ProtectedRoute roles={["Administrador", "Contador", "Auxiliar"]}>
                                <ChequeraPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/cheques"
                        element={
                            <ProtectedRoute roles={["Administrador", "Contador", "Auxiliar"]}>
                                <ChequePage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/conciliacion"
                        element={
                            <ProtectedRoute roles={["Administrador", "Contador", "Auxiliar"]}>
                                <ConciliacionPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/reportes/cuentas-bancarias"
                        element={
                            <ProtectedRoute roles={["Administrador", "Contador"]}>
                                <ReporteCuentaBancariaPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/reportes/conciliaciones"
                        element={
                            <ProtectedRoute roles={["Administrador", "Contador"]}>
                                <ReporteConciliacionPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/reportes/movimientos"
                        element={
                            <ProtectedRoute roles={["Administrador", "Contador"]}>
                                <ReporteMovimientosPage />
                            </ProtectedRoute>
                        }
                    />
                        <Route
                            path="/reportes/cheques"
                            element={
                                <ProtectedRoute roles={["Administrador", "Contador"]}>
                                    <ReporteChequesPage />
                                </ProtectedRoute>
                            }
                        />


                    <Route
                        path="/rol"
                        element={
                            <ProtectedRoute roles={["Administrador"]}>
                                <RolPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/usuario"
                        element={
                            <ProtectedRoute roles={["Administrador"]}>
                                <UsuarioPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/bancos"
                        element={
                            <ProtectedRoute roles={["Administrador"]}>
                                <BancoPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/tipos-cuenta"
                        element={
                            <ProtectedRoute roles={["Administrador"]}>
                                <TipoCuentaPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/tipos-persona"
                        element={
                            <ProtectedRoute roles={["Administrador"]}>
                                <TipoPersonaPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/tipos-telefono"
                        element={
                            <ProtectedRoute roles={["Administrador"]}>
                                <TipoTelefonoPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/tipos-direccion"
                        element={
                            <ProtectedRoute roles={["Administrador"]}>
                                <TipoDireccionPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/estados-cuenta"
                        element={
                            <ProtectedRoute roles={["Administrador"]}>
                                <EstadoCuentaPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/tipos-moneda"
                        element={
                            <ProtectedRoute roles={["Administrador"]}>
                                <TipoMonedaPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/estados-cheque"
                        element={
                            <ProtectedRoute roles={["Administrador"]}>
                                <EstadoChequePage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/estados-conciliacion"
                        element={
                            <ProtectedRoute roles={["Administrador"]}>
                                <EstadoConciliacionPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/estados-detalle-conciliacion"
                        element={
                            <ProtectedRoute roles={["Administrador"]}>
                                <EstadoDetalleConciliacionPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/tipos-movimiento"
                        element={
                            <ProtectedRoute roles={["Administrador"]}>
                                <TipoMovimientoPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/medios-movimiento"
                        element={
                            <ProtectedRoute roles={["Administrador"]}>
                                <MedioMovimientoPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/estados-movimiento"
                        element={
                            <ProtectedRoute roles={["Administrador"]}>
                                <EstadoMovimientoPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/tasas-interes"
                        element={
                            <ProtectedRoute roles={["Administrador"]}>
                                <TasaInteresPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/interes-frecuencias"
                        element={
                            <ProtectedRoute roles={["Administrador"]}>
                                <InteresFrecuenciaPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/conversiones-moneda"
                        element={
                            <ProtectedRoute roles={["Administrador"]}>
                                <ConversionMonedaPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/reglas-recargo"
                        element={
                            <ProtectedRoute roles={["Administrador"]}>
                                <ReglaRecargoPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/perfil"
                        element={
                            <ProtectedRoute>
                                <Perfil />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>
        </>
    );
}

export default function App() {
    return <AppContent />;
}