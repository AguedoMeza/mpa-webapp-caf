import React, { useLayoutEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { NavBar } from 'mpa-shared-components';
import type { MenuItem } from 'mpa-shared-components';
import Bienvenida from './components/Inicio/Bienvenida';
import ProtectedRoute from './layouts/ProtectedRoute';  
import FormatoCO from './components/Inicio/CAF/FormatoCO';
import FormatoOC from './components/Inicio/CAF/FormatoOC';
import FormatoPD from './components/Inicio/CAF/FormatoPD';
import FormatoFD from './components/Inicio/CAF/FormatoFD';
import FormatoOS from './components/Inicio/CAF/FormatoOS';
import Login from './components/Login/Login';
import { AuthService } from './services/AuthService';
import { useAuth } from './hooks/useAuth';

// Configuración del menú personalizado
const customMenu: MenuItem[] = [
  {
    id: '1',
    menu: 'Inicio',
    description: 'Página principal',
    icon: 'house',
    path: 'https://webapplication.mpagroup.mx/#/',
    level: 1,
    order: 1
  }
];

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  useLayoutEffect(() => {
    // Al cargar la app, verificar si hay sesión SAML activa
    const checkAuth = async () => {
      try {
        await AuthService.checkAuthStatus();
      } catch (error) {
        console.log("No hay sesión activa");
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Si no está autenticado y está en la página de login, mostrar solo el contenido
  if (!isAuthenticated && window.location.hash.includes('/login')) {
    return (
      <div className="app-container">
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    );
  }

  // Usuario autenticado - mostrar con NavBar del componente compartido
  return (
    <NavBar 
      user={user}
      onLogout={handleLogout}
      onNavigate={navigate}
      menuItems={customMenu}
      systemTitle="MPA CAF"
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Bienvenida />
          </ProtectedRoute>
        } /> 
        <Route path="/solicitud-caf/:id?" element={
          <ProtectedRoute>
            <FormatoOS tipoContrato="Orden de Servicio" />
          </ProtectedRoute>
        } />
        <Route path="/formato-co/:id?" element={
          <ProtectedRoute>
            <FormatoCO tipoContrato="Contrato de Obra" />
          </ProtectedRoute>
        } />
        <Route path="/formato-oc/:id?" element={
          <ProtectedRoute>
            <FormatoOC tipoContrato="Orden de Cambio" />
          </ProtectedRoute>
        } />
        <Route path="/formato-pd/:id?" element={
          <ProtectedRoute>
            <FormatoPD tipoContrato="Pago a Dependencia" />
          </ProtectedRoute>
        } />
        <Route path="/formato-fd/:id?" element={
          <ProtectedRoute>
            <FormatoFD tipoContrato="Firma de Documento" />
          </ProtectedRoute>
        } />
      </Routes>
    </NavBar>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;