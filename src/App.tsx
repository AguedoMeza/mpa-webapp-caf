


import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';
import { HashRouter, Routes, Route } from 'react-router-dom';
import NavBar from './layouts/NavBar';
import Bienvenida from './components/Inicio/Bienvenida';
import ProtectedRoute from './layouts/ProtectedRoute'; 
import SolicitudCAFForm from './components/Inicio/CAF/SolicitudCAFForm';


const App: React.FC = () => {
  return (
    <HashRouter>
      <NavBar>
        <Routes>
          <Route path="/" element={<Bienvenida />} /> 
          <Route
            path="/solicitud-caf"
            element={<ProtectedRoute><SolicitudCAFForm /></ProtectedRoute>} 
          />
        </Routes>
      </NavBar>
    </HashRouter>
  );
};

export default App;
