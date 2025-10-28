
import React, { useState, useEffect } from "react";
import { Navbar, Nav, Button } from 'react-bootstrap';
import './NavBar.css';
import SideMenu from './SideMenu';

interface NavBarProps {
  children?: React.ReactNode;
}

const NavBar: React.FC<NavBarProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    // Aquí puedes agregar lógica de logout si la implementas en el futuro
    alert('Cerrar sesión (demo)');
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0].charAt(0) + names[1].charAt(0);
    } else {
      return name.charAt(0) + (name.charAt(1) || '');
    }
  };

  // Usuario de ejemplo para desarrollo
  const showUser = { given_name: 'Usuario', family_name: 'Demo', name: 'Usuario Demo' };

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
