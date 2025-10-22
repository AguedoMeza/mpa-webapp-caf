


import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';
import { HashRouter, Routes, Route } from 'react-router-dom';
import NavBar from './layouts/NavBar';
import Bienvenida from './components/Inicio/Bienvenida';


const App: React.FC = () => {
  return (
    <HashRouter>
      <NavBar>
        <Routes>
          <Route path="/" element={<Bienvenida />} />
        </Routes>
      </NavBar>
    </HashRouter>
  );
};

export default App;
