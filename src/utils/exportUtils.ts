import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

export interface ExportData {
  headers: string[];
  data: any[][];
  title: string;
  filename: string;
}

export const exportToExcel = (exportData: ExportData) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Crear hoja con título
    const wsData = [
      [exportData.title],
      [],
      exportData.headers,
      ...exportData.data
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    
    // Estilo para el título
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: exportData.headers.length - 1 } }];
    
    // Ajustar ancho de columnas
    const colWidths = exportData.headers.map(() => ({ wch: 15 }));
    worksheet['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(blob, `${exportData.filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Error al exportar a Excel');
  }
};

export const exportToPDF = (exportData: ExportData) => {
  try {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(exportData.title, 14, 22);
    
    // Fecha de generación
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-CO')}`, 14, 30);
    
    // Tabla
    autoTable(doc, {
      head: [exportData.headers],
      body: exportData.data,
      startY: 40,
      theme: 'striped',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    doc.save(`${exportData.filename}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Error al exportar a PDF');
  }
};
