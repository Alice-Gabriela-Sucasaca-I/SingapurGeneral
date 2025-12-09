import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string) => {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  try {
    // Crear un nuevo workbook
    const workbook = XLSX.utils.book_new();
    
    // Convertir los datos a una hoja
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Ajustar el ancho de las columnas automáticamente
    const columnWidths = Object.keys(data[0]).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = columnWidths;
    
    // Agregar la hoja al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
    
    // Descargar el archivo
    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    alert('Error al exportar a Excel');
  }
};