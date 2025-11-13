import React, { useLayoutEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';
import { HashRouter, Routes, Route } from 'react-router-dom';
import NavBar from './layouts/NavBar';
import Bienvenida from './components/Inicio/Bienvenida';
import ProtectedRoute from './layouts/ProtectedRoute';  
import FormatoCO from './components/Inicio/CAF/FormatoCO';
import FormatoOC from './components/Inicio/CAF/FormatoOC';
import FormatoPD from './components/Inicio/CAF/FormatoPD';
import FormatoFD from './components/Inicio/CAF/FormatoFD';
import FormatoOS from './components/Inicio/CAF/FormatoOS';
import Login from './components/Login/Login';
import { AuthService } from './services/AuthService';


const App: React.FC = () => {
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

  return (
    <HashRouter>
      <NavBar>
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
    </HashRouter>
  );
};

export default App;