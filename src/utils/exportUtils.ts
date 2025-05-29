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

// Helper function to load an image and convert it to base64
const imageToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Handle potential CORS issues if image isn't served from the same origin
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };
    img.onerror = (e) => {
      reject(e);
    };
    img.src = url;
  });
};

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
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: exportData.headers.length - 1 } }];
    
    // Ajustar ancho de columnas
    const colWidths = exportData.headers.map((header, index) => {
      const dataMaxLength = Math.max(...exportData.data.map(row => String(row[index] || '').length));
      const headerLength = String(header || '').length;
      return { wch: Math.max(headerLength, dataMaxLength, 15) }; // Min width 15
    });
    worksheet['!cols'] = colWidths;
    
    // Style for the title row (Row 1)
    const titleCellRef = XLSX.utils.encode_cell({ r: 0, c: 0 });
    if (worksheet[titleCellRef]) {
      worksheet[titleCellRef].s = {
        font: {
          bold: true,
          sz: 16, // Font size 16 for title
          color: { rgb: '000000' }
        },
        alignment: {
          horizontal: 'center',
          vertical: 'center'
        }
      };
    }
    
    // Style for the header row (Row 3, as wsData starts from 0 and has an empty row)
    exportData.headers.forEach((_header, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({ r: 2, c: colIndex });
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = {
          font: {
            bold: true,
            color: { rgb: 'FFFFFF' } // White text
          },
          fill: {
            patternType: 'solid',
            fgColor: { rgb: '228B22' } // Primary green background
          },
          alignment: {
            horizontal: 'center'
          }
        };
      }
    });

    // Style for data rows (alternating colors)
    const dataStartingRow = 3; // Title (0) + Empty (1) + Headers (2) = Data starts at 3
    exportData.data.forEach((rowData, rowIndex) => {
      const actualRow = dataStartingRow + rowIndex;
      const isEvenDataRow = rowIndex % 2 === 0; // 0-indexed data row

      rowData.forEach((_cellData, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({ r: actualRow, c: colIndex });
        if (worksheet[cellRef]) {
          if (!worksheet[cellRef].s) worksheet[cellRef].s = {}; // Ensure style object exists
          
          worksheet[cellRef].s.alignment = { vertical: 'center' }; // Basic vertical alignment

          if (isEvenDataRow) {
            // Apply a light gray background for even data rows
            worksheet[cellRef].s.fill = {
              patternType: 'solid',
              fgColor: { rgb: 'F9FAFB' } // gray-50 from your Tailwind config
            };
          } else {
            // No fill for odd data rows (will be white by default)
            worksheet[cellRef].s.fill = {
              patternType: 'none'
            };
          }
        } else { // if cell doesn't exist (e.g. sparse data), create it for styling
          worksheet[cellRef] = { t: 's', v: '', s: { // Assuming string type, empty value
            alignment: { vertical: 'center' },
            fill: isEvenDataRow ? { patternType: 'solid', fgColor: { rgb: 'F9FAFB' } } : { patternType: 'none' }
          }};
        }
      });
    });

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(blob, `${exportData.filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Error al exportar a Excel');
  }
};

export const exportToPDF = async (exportData: ExportData) => {
  try {
    const doc = new jsPDF();
    let logoDataUrl = null;
    try {
      // Assuming logo.png is in the public folder and accessible at /logo.png
      logoDataUrl = await imageToBase64('/logo.png'); 
    } catch (e) {
      console.error('Error loading logo for PDF, proceeding without it:', e);
    }

    let logoHeightOnPage = 0;
    const pageMargin = 14; // Standard margin used for text

    if (logoDataUrl) {
      const imgProps = doc.getImageProperties(logoDataUrl);
      const desiredLogoWidth = 50; // Let's try 50mm width for the logo
      const aspectRatio = imgProps.width / imgProps.height;
      logoHeightOnPage = desiredLogoWidth / aspectRatio;

      // Center the logo, or place it left
      // const logoX = (pageWidth - desiredLogoWidth) / 2; // Centered
      const logoX = pageMargin; // Left aligned with margin
      doc.addImage(logoDataUrl, 'PNG', logoX, pageMargin, desiredLogoWidth, logoHeightOnPage);
    }

    // Calculate starting Y position for text content below the logo
    const textStartY = pageMargin + (logoDataUrl ? logoHeightOnPage + 5 : 0); // Add 5mm spacing after logo

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(exportData.title, pageMargin, textStartY);

    // Generation Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-CO')}`, pageMargin, textStartY + 8);
    
    // Table
    autoTable(doc, {
      head: [exportData.headers],
      body: exportData.data,
      startY: textStartY + 15, // Adjust startY for content below logo and title/date
      theme: 'striped',
      headStyles: {
        fillColor: [34, 139, 34], // Primary Green (RGB for #228B22)
        textColor: 255, // White
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240] // Slightly adjusted for better contrast with green if needed, or keep as [245,245,245]
      }
    });
    
    doc.save(`${exportData.filename}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Error al exportar a PDF');
  }
};
