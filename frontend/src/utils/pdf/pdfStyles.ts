// frontend/src/utils/pdf/pdfStyles.ts

import { StyleSheet } from '@react-pdf/renderer';

export const pdfStyles = StyleSheet.create({
  // ========== PÁGINA ==========
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  
  // ========== HEADER ==========
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
  
  // ========== STATUS BADGE ==========
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
  
  // ========== SECCIONES ==========
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
  
  // ========== TABLA ==========
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
  
  // ========== TEXTO ==========
  text: {
    fontSize: 10,
    color: '#333',
    lineHeight: 1.5,
  },
  textBold: {
    fontWeight: 'bold',
  },
  
  // ========== CHECKBOXES ==========
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
  
  // ========== COMENTARIOS ==========
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
  
  // ========== FOOTER ==========
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