// frontend/src/utils/pdf/generatePDFPD.tsx

import React from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { pdfStyles as styles } from './pdfStyles'; 

interface GeneratePDFPDProps {
  formData: any;
  solicitudData: any;
}

export const generatePDFPD = ({ formData, solicitudData }: GeneratePDFPDProps) => {
  const getStatus = () => {
    const approve = solicitudData?.approve;
    if (approve === null || approve === undefined) {
      return { text: 'PENDIENTE DE REVISIÓN', color: '#fff3cd', textColor: '#856404' };
    }
    switch (approve) {
      case 0:
        return { text: 'REQUIERE CORRECCIONES', color: '#d1ecf1', textColor: '#0c5460' };
      case 1:
        return { text: '✓ APROBADO', color: '#d4edda', textColor: '#155724' };
      case 2:
        return { text: '✗ RECHAZADO', color: '#f8d7da', textColor: '#721c24' };
      default:
        return { text: 'ESTADO DESCONOCIDO', color: '#e0e0e0', textColor: '#666' };
    }
  };

  const status = getStatus();
  const currentDate = new Date().toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <Text style={styles.title}>
            SOLICITUD CAF #{solicitudData?.id_solicitud || 'N/A'}
          </Text>
          <Text style={styles.subtitle}>
            {solicitudData?.Tipo_Contratacion || 'Pago a Dependencia'}
          </Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
              <Text style={[styles.statusText, { color: status.textColor }]}>
                {status.text}
              </Text>
            </View>
          </View>
        </View>

        {/* ===== INFORMACIÓN GENERAL ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN GENERAL</Text>
          {[
            { label: 'Responsable', value: formData.responsable },
            { label: 'Usuario Solicitante', value: solicitudData?.Usuario },
            { label: 'Fecha', value: formData.fecha },
            { label: 'Building ID', value: formData.buildingId },
            { label: 'Cliente/Desarrollo', value: formData.cliente },
            { label: 'Dirección', value: formData.direccion },
            { label: 'Proveedor', value: formData.proveedor },
          ].map((row, index) => (
            <View
              key={index}
              style={[styles.tableRow, index % 2 === 1 ? styles.tableRowEven : {}]}
            >
              <Text style={styles.tableLabel}>{row.label}:</Text>
              <Text style={styles.tableValue}>{row.value || 'N/A'}</Text>
            </View>
          ))}
        </View>

        {/* ===== DESCRIPCIÓN ===== */}
        {formData.descripcion && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DESCRIPCIÓN DE TRABAJOS/SERVICIOS</Text>
            <Text style={styles.text}>{formData.descripcion}</Text>
          </View>
        )}

        {/* ===== DATOS DE TRABAJOS/SERVICIOS ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATOS DE LOS TRABAJOS / SERVICIOS</Text>
          {[
            { label: 'Monto en pesos (subtotal)', value: formData.montoPesos },
            { label: 'Presupuesto existente', value: formData.presupuesto },
            { label: 'Tipo de trabajo', value: formData.tipoTrabajo },
          ].map((row, index) => (
            <View
              key={index}
              style={[styles.tableRow, index % 2 === 1 ? styles.tableRowEven : {}]}
            >
              <Text style={styles.tableLabel}>{row.label}:</Text>
              <Text style={styles.tableValue}>{row.value || 'N/A'}</Text>
            </View>
          ))}
        </View>

        {/* ===== JUSTIFICACIÓN ===== */}
        {formData.justificacion && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>JUSTIFICACIÓN DE TRABAJOS</Text>
            <Text style={styles.text}>{formData.justificacion}</Text>
          </View>
        )}

        {/* ===== DOCUMENTOS A ENVIAR ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DOCUMENTOS A ENVIAR</Text>
          <View style={styles.checkboxContainer}>
            {[
              { label: 'VOBO Legal', checked: formData.docVOBOLegal },
              { label: 'Ficha de Pago', checked: formData.docFichaPago },
              { label: 'Información Bancaria', checked: formData.docInfoBancaria },
            ].map((doc, index) => (
              <View key={index} style={styles.checkboxRow}>
                <View style={[styles.checkbox, doc.checked ? styles.checkboxChecked : {}]} />
                <Text style={styles.checkboxLabel}>{doc.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ===== ENLACE SHAREPOINT ===== */}
        {formData.sharepoint && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ENLACE SHAREPOINT</Text>
            <Text style={[styles.text, { color: '#2c5aa0' }]}>
              {formData.sharepoint}
            </Text>
          </View>
        )}

        {/* ===== COMENTARIOS ===== */}
        {solicitudData?.Comentarios && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>COMENTARIOS</Text>
            <View style={styles.commentBox}>
              <Text style={styles.commentText}>{solicitudData.Comentarios}</Text>
            </View>
          </View>
        )}

        {/* ===== FOOTER ===== */}
        <View style={styles.footer} fixed>
          <Text>Generado el {currentDate} - Sistema CAF MPA</Text>
          <Text style={{ marginTop: 3 }}>Admin MPA LDAP</Text>
        </View>
      </Page>
    </Document>
  );
};
