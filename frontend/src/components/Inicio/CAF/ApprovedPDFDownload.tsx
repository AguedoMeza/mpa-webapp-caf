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

    <div className="my-4 p-4 bg-white border border-success rounded">

      {/* ENCABEZADO */}
      <div className=" d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">

        {/* TÍTULO + ICONO */}
        <div>
          <h5 className="mb-1 text-success fw-bold">Solicitud Aprobada</h5>
          <p className="mb-0 text-secondary">
            Esta solicitud ha sido aprobada. Puedes descargar el PDF oficial para firma.
          </p>
        </div>

        {/* BOTONES */}
        <div className="d-flex gap-2">
          <Button
            size="sm"
            className="fw-semibold text-white"
            style={{ backgroundColor: "#F7931F", borderColor: "#F7931F" }}
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

                Descargar PDF
              </>
            )}
          </Button>

          <Button
            size="sm"
            onClick={handleView}
            disabled={loading}
            style={{
              backgroundColor: "#e0e0e0",   // gris claro
              color: "#000",
              border: "none",
              padding: "0.6rem 2rem",
              borderRadius: "8px",
              fontWeight: 600,
              width: "180px"                // igual al estilo de la imagen
            }}
          >

            Ver PDF
          </Button>
        </div>
      </div>

    </div>

  );
};

export default ApprovedPDFDownload;