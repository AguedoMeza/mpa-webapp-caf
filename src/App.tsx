


import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';
import { HashRouter, Routes, Route } from 'react-router-dom';
import NavBar from './layouts/NavBar';
import Bienvenida from './components/Inicio/Bienvenida';
import ProtectedRoute from './layouts/ProtectedRoute'; 
import SolicitudCAFForm from './components/Inicio/CAF/SolicitudCAFForm';
import FormatoCO from './components/Inicio/CAF/FormatoCO';
import FormatoOC from './components/Inicio/CAF/FormatoOC';
import FormatoPD from './components/Inicio/CAF/FormatoPD';
import FormatoFD from './components/Inicio/CAF/FormatoFD';


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
          <Route path="/formato-co" element= {<ProtectedRoute><FormatoCO/></ProtectedRoute>}  />
           <Route path="/formato-oc" element= {<ProtectedRoute><FormatoOC/></ProtectedRoute>}  />
           <Route path="/formato-pd" element= {<ProtectedRoute><FormatoPD/></ProtectedRoute>}  />
            <Route path="/formato-fd" element= {<ProtectedRoute><FormatoFD/></ProtectedRoute>}  />
        </Routes>
      </NavBar>
    </HashRouter>
  );
};

export default App;
