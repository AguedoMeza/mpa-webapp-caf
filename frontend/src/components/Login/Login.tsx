// components/Login/Login.tsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { AuthService } from '../../services/AuthService';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logoImage from '../../assets/MPA500px.png';


const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }
    // Manejar callback de Azure AD si viene con ?auth=success
    AuthService.handleSAMLCallback();
  }, [isAuthenticated, navigate]);

  const handleSSOLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      await AuthService.startSAMLLogin();
    } catch (err: any) {
      setError(err.message || 'Error conectando con Azure AD');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col xs={12} sm={8} md={6} lg={4}>
            <Card className="login-card">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <img
                    src={logoImage}
                    alt="Logo FIBRA Macquarie"
                    style={{ maxWidth: "200px", width: "100%", height: "auto", paddingBottom: "24px" }}
                  />
                  <p className="system-subtitle">WEB APP CAF</p>
                  <p className="text-muted small">FORMATOS DE SOLICITUD</p>
                </div>
                
                {error && (
                  <Alert variant="danger" className="mb-3">
                    {error}
                  </Alert>
                )}

                <Button
                  variant="primary"
                  className="w-100"
                  onClick={handleSSOLogin}
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? 'Conectando...' : 'Iniciar Sesión con Azure AD'}
                </Button>

                <div className="text-center mt-4">
                  <small className="text-muted">
                    Sistema desarrollado para MPA<br />
                    <strong>MMREIT Property Administration, A.C.</strong>
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;