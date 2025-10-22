import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Inicio: React.FC = () => {
  return (
    <Container fluid className="p-4">
      <Row>
        <Col>
          <h1 className="mb-4">Sistema de Seguridad MPA</h1>
          <p className="text-muted">Bienvenido al sistema de administración de seguridad</p>
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col md={6} lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>
                <i className="bi bi-shield-check text-success me-2"></i>
                Reportes de Seguridad
              </Card.Title>
              <Card.Text>
                Accede a los reportes de análisis de riesgo y seguridad del sistema.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>
                <i className="bi bi-people text-primary me-2"></i>
                Gestión de Usuarios
              </Card.Title>
              <Card.Text>
                Administra usuarios y permisos del sistema de seguridad.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>
                <i className="bi bi-gear text-warning me-2"></i>
                Configuración
              </Card.Title>
              <Card.Text>
                Configura los parámetros del sistema y políticas de seguridad.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Inicio;
