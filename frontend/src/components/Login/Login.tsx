// components/Login/Login.tsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form } from 'react-bootstrap';
import { AuthService, QAUser } from '../../services/AuthService';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logoImage from '../../assets/MPA500px.png';


// El selector de QA no se ofrece en el dominio productivo. Fuera de el, manda el
// backend: si no esta en QA_MODE, /dev-users responde 404, la lista llega vacia y
// el bloque no se pinta. Asi funciona en localhost, por IP o por nombre de maquina.
const ES_QA = window.location.hostname !== 'webapplication.mpagroup.mx';

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [qaUsers, setQaUsers] = useState<QAUser[]>([]);
  const [qaSeleccionado, setQaSeleccionado] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ES_QA) return;
    AuthService.getQAUsers().then((usuarios) => {
      setQaUsers(usuarios);
      if (usuarios.length > 0) setQaSeleccionado(usuarios[0].email);
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }
    // Manejar callback de Azure AD si viene con ?auth=success
    AuthService.handleSAMLCallback();
  }, [isAuthenticated, navigate]);

  const handleQALogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await AuthService.devLogin(qaSeleccionado);
      // Recarga completa del documento, igual que el retorno del ACS de SAML.
      // Cambiar solo el hash no remonta la app y el arbol de rutas se queda
      // con el estado de "sin sesion".
      window.location.href = `${process.env.REACT_APP_PUBLIC_URL || ""}/#/`;
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Error en el login de QA');
    } finally {
      setIsLoading(false);
    }
  };

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

                {qaUsers.length > 0 && (
                  <Form onSubmit={handleQALogin} className="mt-4 pt-3 border-top">
                    <p className="text-muted small mb-2">
                      <strong>Acceso QA</strong> — sin Azure AD
                    </p>
                    <Form.Select
                      className="mb-2"
                      value={qaSeleccionado}
                      onChange={(e) => setQaSeleccionado(e.target.value)}
                    >
                      {qaUsers.map((u) => (
                        <option key={u.email} value={u.email}>
                          {u.name} — {u.job_title}
                        </option>
                      ))}
                    </Form.Select>
                    <Button
                      type="submit"
                      variant="outline-secondary"
                      className="w-100"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Entrando...' : 'Entrar (QA)'}
                    </Button>
                  </Form>
                )}

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