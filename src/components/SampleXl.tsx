import { Download } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Button } from '@mui/material';

const CUISINES = [
  "SOUTH_INDIAN",
  "PUNJABI",
  "NORTH_INDIAN",
  "MUGHALAI",
  "BENGALI",
  "GOAN",
  "TAMIL",
  "ANDHRA",
  "KERALA",
  "INDIAN_CHINESE",
  "CHINESE",
  "AWADHI",
  "MALAYSIAN",
  "MAHARASHTRIAN",
  "TIBETAN",
  "SRI_LANKAN",
  "SIKKIMESE",
  "TASTE_OF_BIHAR",
  "ASSAMESE",
  "BAKERY_CONFECTIONERY",
  "CONTINENTAL",
  "ITALIAN",
  "MEXICAN",
  "LEBANESE",
  "MONGOLIAN",
  "MALABARI",
  "HYDERABADI",
  "ODIYA",
  "MARATHI",
  "GUJRATI",
  "RAJASTHANI",
  "AMERICAN"
];

const FOOD_TYPES = [
  "SNACKS",
  "BREAKFAST",
  "STARTERS",
  "MAINS",
  "MAINS_GRAVY",
  "BREADS",
  "THALI",
  "COMBO",
  "DESSERTS",
  "SOUP",
  "BEVERAGE",
  "NAVRATRI_SPECIAL",
  "DIET",
  "BAKERY_CONFECTIONERY",
  "HEALTHY_DIET",
  "SWEETS",
  "DIWALI_SPECIAL",
  "BIRYANI",
  "BULK",
  "SPECIALITY_ITEM",
  "CHAATS",
  "NAMKEENS",
  "SALADS",
  "MOUTH_FRESHENER_DIGESTIVE",
  "PIZZA",
  "BURGER",
  "HOLI_SPECIAL",
  "PASTAS",
  "TACOS",
  "QUESADILLAS",
  "SIDES",
  "JAIN_FOOD"
];

const SampleXl = ({ data = [], isLoading = false }:{data:any,isLoading:any}) => {
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
      'status',
      'change_type',
      'image'
    ];

    // Define the default columns that should always be present
    const defaultColumns = ['cuisine', 'food_type'];

    if (data.length > 0) {
      // Get all keys from the first item
      const allKeys = Object.keys(data[0]);
      
      // Filter out the excluded columns
      const includedKeys = allKeys.filter(key => !excludeColumns.includes(key));
      
      // Combine default columns with included keys, avoiding duplicates
      const allColumns = [...new Set([...defaultColumns, ...includedKeys])];
      
      // Define columns in the sheet
      const columns = allColumns.map(key => ({
        header: key,
        key: key,
        width: 20 // Default width
      }));
      
      // Special width adjustments for specific columns
      columns.forEach(col => {
        if (col.key === 'description') col.width = 40;
        if (col.key === 'item_name') col.width = 30;
        if (col.key === 'cuisine') col.width = 25;
        if (col.key === 'food_type') col.width = 25;
      });
      
      worksheet.columns = columns;

      // Add the data rows
      data.forEach(item => {
        // Create a new row object with all columns
        const rowData:any = {};
        allColumns.forEach((key:any) => {
          rowData[key] = item[key] || ''; // Use empty string if key doesn't exist
        });
        worksheet.addRow(rowData);
      });

      // Apply styling to header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = { 
        type: 'pattern', 
        pattern: 'solid', 
        fgColor: { argb: 'FFE0E0E0' } 
      };

      // Find column indices for cuisine and food_type
      const cuisineColumnIndex = allColumns.indexOf('cuisine') + 1; // Excel is 1-indexed
      const foodTypeColumnIndex = allColumns.indexOf('food_type') + 1;

      // Create a hidden sheet for dropdown data
      const dropdownSheet = workbook.addWorksheet('DropdownData');
      dropdownSheet.state = 'hidden';
      
      // Add cuisine options to column A
      CUISINES.forEach((cuisine, index) => {
        dropdownSheet.getCell(index + 1, 1).value = cuisine;
      });
      
      // Add food type options to column B
      FOOD_TYPES.forEach((foodType, index) => {
        dropdownSheet.getCell(index + 1, 2).value = foodType;
      });

      // Add data validation (dropdown) for cuisine column
      if (cuisineColumnIndex > 0) {
        const lastRow = Math.max(worksheet.rowCount, 100);
        
        // Apply dropdown validation to all data rows (excluding header)
        worksheet.dataValidations.add(`${worksheet.getColumn(cuisineColumnIndex).letter}2:${worksheet.getColumn(cuisineColumnIndex).letter}${lastRow}`, {
          type: 'list',
          allowBlank: true,
          formulae: [`DropdownData!$A$1:$A${CUISINES.length}`],
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Invalid Cuisine',
          error: 'Please select a valid cuisine from the dropdown list.'
        });
      }

      // Add data validation (dropdown) for food_type column
      if (foodTypeColumnIndex > 0) {
        const lastRow = Math.max(worksheet.rowCount, 100);
        
        // Apply dropdown validation to all data rows (excluding header)
        worksheet.dataValidations.add(`${worksheet.getColumn(foodTypeColumnIndex).letter}2:${worksheet.getColumn(foodTypeColumnIndex).letter}${lastRow}`, {
          type: 'list',
          allowBlank: true,
          formulae: [`DropdownData!$B$1:$B${FOOD_TYPES.length}`],
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Invalid Food Type',
          error: 'Please select a valid food type from the dropdown list.'
        });
      }

    } else {
      // If no data, create sheet with just the default columns for sample
      const columns = [
        { header: 'cuisine', key: 'cuisine', width: 25 },
        { header: 'food_type', key: 'food_type', width: 25 },
        { header: 'item_name', key: 'item_name', width: 30 },
        { header: 'description', key: 'description', width: 40 },
        { header: 'price', key: 'price', width: 15 }
      ];
      
      worksheet.columns = columns;
      
      // Apply styling to header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = { 
        type: 'pattern', 
        pattern: 'solid', 
        fgColor: { argb: 'FFE0E0E0' } 
      };

      // Add sample data row
      worksheet.addRow({
        cuisine: '',
        food_type: '',
        item_name: 'Sample Item Name',
        description: 'Sample item description',
        price: '100'
      });

      // Create a hidden sheet for dropdown data
      const dropdownSheet = workbook.addWorksheet('DropdownData');
      dropdownSheet.state = 'hidden';
      
      // Add cuisine options to column A
      CUISINES.forEach((cuisine, index) => {
        dropdownSheet.getCell(index + 1, 1).value = cuisine;
      });
      
      // Add food type options to column B
      FOOD_TYPES.forEach((foodType, index) => {
        dropdownSheet.getCell(index + 1, 2).value = foodType;
      });

      // Add dropdown validation for sample sheet
      // Cuisine dropdown (column 1) - range A2:A100
      worksheet.dataValidations.add('A2:A100', {
        type: 'list',
        allowBlank: true,
        formulae: [`DropdownData!$A$1:$A${CUISINES.length}`],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid Cuisine',
        error: 'Please select a valid cuisine from the dropdown list.'
      });
      
      // Food type dropdown (column 2) - range B2:B100
      worksheet.dataValidations.add('B2:B100', {
        type: 'list',
        allowBlank: true,
        formulae: [`DropdownData!$B$1:$B${FOOD_TYPES.length}`],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid Food Type',
        error: 'Please select a valid food type from the dropdown list.'
      });
    }

    // Write the workbook to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Trigger file download
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'MenuItems_Sample.xlsx');
  };

  return (
    <Button 
      onClick={handleDownload} 
      style={{backgroundColor:'green', color:'white'}}
      disabled={isLoading}
    >
      <Download className="h-4 w-4" />
      Download Sample file
    </Button>
  );
};

export default SampleXl;