import React, { useState, useEffect } from 'react';
import { Nav, Collapse } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './SideMenu.css';

interface SideMenuProps {
  user: any;
}

interface MenuItem {
  id: string;
  menu: string;
  description: string;
  icon: string;
  path: string;
  level: number;
  order: number;
  items?: MenuItem[];
}

const SideMenu: React.FC<SideMenuProps> = ({ user }) => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<string>('');
  const [userMenu, setUserMenu] = useState<MenuItem[]>([]);

  // Hardcoded menu items - en el futuro esto vendrá del localStorage
  const hardcodedMenu: MenuItem[] = [
    {
      id: '1',
      menu: 'Inicio',
      description: 'Reportes Trabajos Riesgo',
      icon: 'house',
      path: '/',
      level: 1,
      order: 1
    },
   /*  {
      id: '2',
      menu: 'Reportes',
      description: 'Gestión de reportes',
      icon: 'file-earmark-text',
      path: '/reportes',
      level: 1,
      order: 2,
      items: [
        {
          id: '2-1',
          menu: 'Reporte Power BI',
          description: 'Reporte integrado con Power BI',
          icon: 'bar-chart',
          path: '/reportes/powerbi',
          level: 2,
          order: 1
        }
      ]
    } */
  ];

  useEffect(() => {
    // En el futuro, esto cargará desde localStorage
    // setUserMenu(JSON.parse(localStorage.getItem("userMenu")!) || []);
    setUserMenu(hardcodedMenu);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // Se remueve hardcodedMenu de las dependencias ya que es constante

  const handleMenuClick = (item: MenuItem) => {
    if (item.items && item.items.length > 0) {
      // Si tiene subitems, toggle el collapse
      setActiveMenu(activeMenu === item.id ? '' : item.id);
    } else {
      // Si no tiene subitems, navegar
      navigate(item.path);
    }
  };

  const handleSubMenuClick = (item: MenuItem) => {
    navigate(item.path);
  };

  const getBootstrapIcon = (iconName: string) => {
    return <i className={`bi bi-${iconName}`}></i>;
  };

  return (
    <div className="sidebar-fixed">
      <div className="sidebar-content">
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo-section">
            <button
              type="button"
              className="logo-link"
              onClick={() => navigate('/')}
              aria-label="Ir al inicio"
              title="Ir al inicio"
            >
              <img
                src="https://webapplication.mpagroup.mx/aml/static/media/MPA_Logo_W.4ba3d895c671f7aee8be.png"
                alt="MPA"
                className="logo-img"
                loading="lazy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0'; }}
              />
            </button>


            <div className="system-title">
              <h1>MPA CAF</h1>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav">
          <Nav className="flex-column">
            {userMenu.map((item) => (
              <div key={item.id}>
                <Nav.Link
                  className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
                  onClick={() => handleMenuClick(item)}
                >
                  <span className="nav-icon">{getBootstrapIcon(item.icon)}</span>
                  <span className="nav-text">{item.menu}</span>
                  {item.items && item.items.length > 0 && (
                    <span className="nav-arrow">
                      {activeMenu === item.id ?
                        <i className="bi bi-chevron-up"></i> :
                        <i className="bi bi-chevron-down"></i>
                      }
                    </span>
                  )}
                </Nav.Link>

                {item.items && item.items.length > 0 && (
                  <Collapse in={activeMenu === item.id}>
                    <div className="submenu-container">
                      {item.items.map((subItem) => (
                        <Nav.Link
                          key={subItem.id}
                          className="nav-item submenu-item"
                          onClick={() => handleSubMenuClick(subItem)}
                        >
                          <span className="nav-icon submenu-icon">
                            {getBootstrapIcon(subItem.icon)}
                          </span>
                          <span className="nav-text">{subItem.menu}</span>
                        </Nav.Link>
                      ))}
                    </div>
                  </Collapse>
                )}
              </div>
            ))}
          </Nav>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
