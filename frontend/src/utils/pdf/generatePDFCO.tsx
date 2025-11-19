// frontend/src/utils/pdf/generatePDFCO.tsx

import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

// Estilos específicos para PDFs de Contrato de Obra
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  
  // Header
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#2c5aa0',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c5aa0',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  
  // Status badge
  statusContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  statusBadge: {
    padding: '5 10',
    borderRadius: 3,
    marginBottom: 5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Secciones
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 8,
    borderBottom: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 3,
  },
  
  // Tabla
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    minHeight: 22,
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: '#f8f9fa',
  },
  tableLabel: {
    width: '35%',
    paddingLeft: 8,
    fontWeight: 'bold',
    color: '#333',
  },
  tableValue: {
    width: '65%',
    paddingLeft: 8,
    color: '#666',
  },
  
  // Texto
  text: {
    fontSize: 10,
    color: '#333',
    lineHeight: 1.5,
  },
  
  // Checkboxes
  checkboxContainer: {
    marginTop: 5,
  },
  checkboxRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'center',
  },
  checkbox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: '#666',
    marginRight: 6,
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  checkboxLabel: {
    fontSize: 9,
    color: '#333',
  },
  
  // Comentarios
  commentBox: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 3,
    border: 1,
    borderColor: '#ffc107',
  },
  commentText: {
    fontSize: 9,
    color: '#856404',
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#999',
    fontSize: 8,
    borderTop: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
});

interface GeneratePDFCOProps {
  formData: any;
  solicitudData: any;
}

export const generatePDFCO = ({ formData, solicitudData }: GeneratePDFCOProps) => {
  // Helper para obtener status
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
            {solicitudData?.Tipo_Contratacion || 'Contrato de Obra'}
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
            { label: 'Fecha de inicio', value: formData.fechaInicio },
            { label: 'Fecha de Terminación Final', value: formData.fechaFin },
            { label: 'Monto en pesos (subtotal)', value: formData.montoPesos },
            { label: 'Monto en dólares (subtotal)', value: formData.montoDolares },
            { label: 'TDC', value: formData.tdc },
            { label: 'Anticipo %', value: formData.anticipo },
            { label: 'Fuerza de trabajo aproximada', value: formData.fuerzaTrabajo },
            { label: 'Presupuesto existente', value: formData.presupuesto },
            { label: 'Tipo de trabajo', value: formData.tipoTrabajo },
            { label: 'Recuperable', value: formData.recuperable },
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

        {/* ===== DATOS EXCLUSIVOS PARA CONTRATOS ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATOS EXCLUSIVOS PARA CONTRATOS</Text>
          {[
            { label: 'Fecha Ocupación Benéfica', value: formData.fechaOcupacion },
            { label: 'Fecha Terminación Sustancial', value: formData.fechaSustancial },
            { label: 'Fecha Terminación Final Contratos', value: formData.fechaFinalContratos },
            { label: 'Fianza Anticipo', value: formData.fianzaAnticipo },
            { label: 'Fianza Cumplimiento/Buena Calidad', value: formData.fianzaCumplimiento },
            { label: 'Fianza Pasivos Contingentes', value: formData.fianzaPasivos },
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
          
          <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 5, marginTop: 5 }]}>
            Documentos Comunes:
          </Text>
          <View style={styles.checkboxContainer}>
            {[
              { label: 'Cotización MPA y VOBO de C&P', checked: formData.docCotizacion },
              { label: 'Aprobación (correo) si no hay concurso', checked: formData.docAprobacion },
              { label: 'Análisis de Riesgo WHSE y VOBO', checked: formData.docAnalisisRiesgos },
              { label: 'Dibujos y/o especificaciones', checked: formData.docDibujos },
              { label: 'Programa de Obra', checked: formData.docProgramaObra },
            ].map((doc, index) => (
              <View key={index} style={styles.checkboxRow}>
                <View style={[styles.checkbox, doc.checked ? styles.checkboxChecked : {}]} />
                <Text style={styles.checkboxLabel}>{doc.label}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 5, marginTop: 8 }]}>
            Documentos Exclusivos para Contratos:
          </Text>
          <View style={styles.checkboxContainer}>
            {[
              { label: 'Acta constitutiva', checked: formData.docActaConstitutiva },
              { label: 'Poder notarial', checked: formData.docPoderNotarial },
              { label: 'INE Representante legal', checked: formData.docINE },
              { label: 'Alta IMSS y REPSE', checked: formData.docAltaIMSS },
              { label: 'Información bancaria', checked: formData.docInfoBancaria },
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