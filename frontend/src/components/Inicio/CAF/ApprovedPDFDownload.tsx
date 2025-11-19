// frontend/src/components/Inicio/CAF/ApprovedPDFDownload.tsx

import React, { useState } from 'react';
import { Alert, Button, Spinner } from 'react-bootstrap';
import { pdf } from '@react-pdf/renderer';

interface ApprovedPDFDownloadProps {
  generatePDF: (props: { formData: any; solicitudData: any }) => any;
  formData: any;
  solicitudData: any;
  tipo: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

const ApprovedPDFDownload: React.FC<ApprovedPDFDownloadProps> = ({
  generatePDF,
  formData,
  solicitudData,
  tipo,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      
      const blob = await pdf(
        generatePDF({ formData, solicitudData })
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CAF_${tipo}_${solicitudData?.id_solicitud || 'N/A'}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      if (onSuccess) onSuccess('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      if (onError) onError('Error al generar el PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async () => {
    try {
      setLoading(true);
      
      const blob = await pdf(
        generatePDF({ formData, solicitudData })
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      if (onError) onError('Error al generar el PDF');
    } finally {
      setLoading(false);
    }
  };

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
            onClick={handleDownload}
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
            onClick={handleView}
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