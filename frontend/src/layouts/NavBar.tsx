
import React, { useState, useEffect } from "react";
import { Navbar, Nav, Button } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import './NavBar.css';
import SideMenu from './SideMenu';

interface NavBarProps {
  children?: React.ReactNode;
}

const NavBar: React.FC<NavBarProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Usuario actual o datos de ejemplo para desarrollo
  const showUser = user || { given_name: 'Usuario', family_name: 'Demo', name: 'Usuario Demo' };

  // Si no está autenticado y no está en la página de login, mostrar solo el contenido (que será redirigido al login)
  if (!isAuthenticated && !window.location.hash.includes('/login')) {
    return (
      <div className="app-container">
        <main className="main-content">
          {children}
        </main>
      </div>
    );
  }

  // Si está en la página de login, mostrar solo el contenido sin navbar
  if (window.location.hash.includes('/login')) {
    return (
      <div className="app-container">
        <main className="main-content">
          {children}
        </main>
      </div>
    );
  }

  // Usuario autenticado - mostrar navbar completo
  return (
    <div className="app-container">
      <>
        <SideMenu user={showUser} />

        <Navbar bg="dark" variant="dark" className="top-navbar">
          <Nav className="ms-auto">
            <div className="user-info-header">
              <div className="user-details-nav">
                <span className="user-name">
                  Hola, {showUser.given_name && showUser.family_name ? `${showUser.given_name} ${showUser.family_name}` : (showUser.given_name || showUser.name)}
                </span>
              </div>
              <Button 
                onClick={handleLogout}
                className="logout-btn-header"
              > 
                {!isMobile && <span className="ms-2"> Cerrar sesión</span>}
              </Button>
            </div>
          </Nav>
        </Navbar>
      </>
      <main className="main-content with-navbar">
        {children}
      </main>
    </div>
  );
};

export default NavBar;
