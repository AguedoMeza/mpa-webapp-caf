// frontend/src/components/Inicio/CAF/ApprovedPDFDownload.tsx

import React from 'react';
import { Alert, Button, Spinner } from 'react-bootstrap';

interface ApprovedPDFDownloadProps {
  loading: boolean;
  onDownload: () => void;
  onView: () => void;
}

const ApprovedPDFDownload: React.FC<ApprovedPDFDownloadProps> = ({
  loading,
  onDownload,
  onView,
}) => {
  return (
    <Alert variant="success" className="my-4">
      <div className="text-center">
        <h4 className="mb-3">
          <i className="fas fa-check-circle me-2"></i>
          Solicitud Aprobada
        </h4>
        <p className="mb-3">
          Esta solicitud ha sido aprobada. 
          Puedes descargar el PDF oficial para firma.
        </p>
        <div className="d-flex gap-2 justify-content-center">
          <Button 
            variant="success" 
            size="lg"
            onClick={onDownload}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Generando...
              </>
            ) : (
              <>
                <i className="bi bi-download me-2"></i>
                Descargar PDF Oficial
              </>
            )}
          </Button>
          <Button 
            variant="outline-success" 
            size="lg"
            onClick={onView}
            disabled={loading}
          >
            <i className="bi bi-eye me-2"></i>
            Ver PDF
          </Button>
        </div>
      </div>
    </Alert>
  );
};

export default ApprovedPDFDownload;