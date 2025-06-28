import { Download } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Button } from '@mui/material';

const XlFormat = ({ data = [], isLoading = false }:{data:any,isLoading:any}) => {
  const handleDownload = async () => {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();

    // Add the Items worksheet
    const worksheet = workbook.addWorksheet('Items');

    // Define the columns to exclude
    const excludeColumns = [
      'item_id', 
      'outlet_id', 
      'customisations', 
      'customisation_defaultBasePrice', 
      'station_code',
      'bulk_only',
      'base_price',
      'tax',
      'tax_percentage',
      'verified',
      'status'
    ];

    if (data.length > 0) {
      // Get all keys from the first item
      const allKeys = Object.keys(data[0]);
      
      // Filter out the excluded columns
      const includedKeys = allKeys.filter(key => !excludeColumns.includes(key));
      
      // Define columns in the sheet
      const columns = includedKeys.map(key => ({
        header: key,
        key: key,
        width: 20 // Default width
      }));
      
      // Special width adjustments for specific columns
      columns.forEach(col => {
        if (col.key === 'description') col.width = 40;
        if (col.key === 'item_name') col.width = 30;
      });
      
      worksheet.columns = columns;

      // Add the data rows
      data.forEach(item => {
        // Create a new row object with only the included keys
        const rowData:any = {};
        includedKeys.forEach((key:any) => {
          rowData[key] = item[key];
        });
        worksheet.addRow(rowData);
      });

      // Apply styling
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = { 
        type: 'pattern', 
        pattern: 'solid', 
        fgColor: { argb: 'FFE0E0E0' } 
      };
    }

    // Write the workbook to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Trigger file download
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'MenuItems.xlsx');
  };

  return (
    <Button 
      onClick={handleDownload} 
      style={{backgroundColor:'green', color:'white'}}
      disabled={isLoading || data.length === 0}
    >
      <Download className="h-4 w-4" />
      Export Items
    </Button>
  );
};

export default XlFormat;