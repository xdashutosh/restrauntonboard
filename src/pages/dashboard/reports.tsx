import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  Collapse,
  Grid,
  Dialog,
  DialogContent,
  DialogActions
} from "@mui/material";
import { 
  FileDownload, 
  Receipt, 
  KeyboardArrowDown, 
  CalendarToday,
  LocationOn,
  AttachMoney,
  Description,
  Close,
  Visibility
} from "@mui/icons-material";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import html2pdf from "html2pdf.js";
import axiosInstance from "../../interceptor/axiosInstance";

// Add styles for PDF generation
const pdfStyles = `
.pdf-content {
  font-family: 'Helvetica', Arial, sans-serif;
  color: #000;
  line-height: 1.4;
}

.pdf-content table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 9pt;
}

.pdf-content th, .pdf-content td {
  border: 1px solid #ddd;
  padding: 4px;
  font-size: 9pt;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pdf-content th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.pdf-content h1, .pdf-content h2, .pdf-content h3, 
.pdf-content h4, .pdf-content h5, .pdf-content h6 {
  margin-top: 6pt;
  margin-bottom: 6pt;
}

.pdf-content h6 {
  font-size: 12pt;
}

.pdf-content p {
  margin: 4pt 0;
  font-size: 9pt;
}
`;

// Create style element
const styleElement = document.createElement('style');
styleElement.textContent = pdfStyles;
document.head.appendChild(styleElement);

// Helper function to calculate totals for an order
const calculateOrderTotals = (items) => {
  if (!items || !Array.isArray(items)) return { subTotal: 0, gst: 0, totalInWords: "Zero Rupees" };
  
  // Calculate subtotal (sum of all items' price * quantity)
  const subTotal = items.reduce((sum, item) => sum + (item.SellingPrice * item.quantity), 0);
  
  // Single GST at 5% of the selling price
  const gstRate = 0.05; // 5%
  const gst = subTotal * gstRate;
  
  // Convert total amount to words (simplified version)
  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    
    const convertLessThanThousand = (num) => {
      if (num === 0) return '';
      if (num < 20) return ones[num];
      const ten = Math.floor(num / 10);
      const one = num % 10;
      return tens[ten] + (one !== 0 ? ' ' + ones[one] : '');
    };
    
    let result = '';
    let num1 = Math.floor(num);
    let decimal = Math.round((num - num1) * 100);
    
    if (num1 >= 100000) {
      result = convertLessThanThousand(Math.floor(num1 / 100000)) + ' Lakh ';
      num1 %= 100000;
    }
    
    if (num1 >= 1000) {
      result += convertLessThanThousand(Math.floor(num1 / 1000)) + ' Thousand ';
      num1 %= 1000;
    }
    
    if (num1 >= 100) {
      result += convertLessThanThousand(Math.floor(num1 / 100)) + ' Hundred ';
      num1 %= 100;
    }
    
    if (num1 > 0) {
      result += convertLessThanThousand(num1);
    }
    
    result += ' Rupees';
    
    if (decimal > 0) {
      result += ' and ' + convertLessThanThousand(decimal) + ' Paise';
    }
    
    return result.trim();
  };
  
  const totalInWords = numberToWords(subTotal);
  
  return {
    subTotal,
    totalInWords
  };
};

// Define a component for each invoice report
const InvoiceReport = ({ invoiceData, restdata }) => {
  const invoiceRef = useRef(null);
  const fullInvoiceRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Transform the order items to the format expected by the component
  const transformItems = (menuItems) => {
    if (!menuItems || !menuItems.items || !Array.isArray(menuItems.items)) return [];
    
    return menuItems.items.map((item, index) => ({
      sNo: index + 1,
      code: `ITM-${item.item_id || index + 1}`,
      particulars: item.name,
      description: item.descriptiom, // Note: typo in original data
      qty: item.quantity,
      rate: item.SellingPrice,
      taxable: item.SellingPrice * item.quantity,
      gst: 5, // Single GST at 5%
      amount: item.SellingPrice * item.quantity * 1.05 // Price + 5% GST
    }));
  };

  // Extract and format invoice data
  const items = transformItems(invoiceData.menu_items);
  const total = calculateOrderTotals(invoiceData.menu_items?.items || []);
  
  // Customer info for billing
  const customerName = invoiceData.customer_info?.customerDetails?.customerName || "Guest Customer";
  const customerMobile = invoiceData.customer_info?.customerDetails?.mobile || "N/A";
  const deliveryAddress = invoiceData.delivery_details?.deliveryDetails 
    ? `Train ${invoiceData.delivery_details.deliveryDetails.trainNo}, Coach ${invoiceData.delivery_details.deliveryDetails.coach}, Berth ${invoiceData.delivery_details.deliveryDetails.berth}, ${invoiceData.delivery_details.deliveryDetails.station}`
    : "Delivery address not provided";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    // If the date is in format "05-12-2025 02:40"
    const parts = dateString.split(" ");
    if (parts.length === 2) {
      const dateParts = parts[0].split("-");
      if (dateParts.length === 3) {
        // Convert to Date object (assuming date format is DD-MM-YYYY)
        const date = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${parts[1]}`);
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
    }
    
    // Fallback for other formats
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateString; // Return as is if parsing fails
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₹0.00";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const generatePDF = async () => {
    if (!fullInvoiceRef.current) return;
    
    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });
    
    // Get page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 40; // Margin in points (about 14mm)
    
    // Clone the invoice element for PDF rendering to avoid affecting the displayed version
    const invoiceClone = fullInvoiceRef.current.cloneNode(true);
    document.body.appendChild(invoiceClone);
    
    // Apply specific styles for PDF rendering
    invoiceClone.style.width = `${pageWidth - 2 * margin}px`;
    invoiceClone.style.padding = "0";
    invoiceClone.style.backgroundColor = "white";
    
    // Adjust table for PDF
    const tables = invoiceClone.querySelectorAll('table');
    tables.forEach(table => {
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.style.fontSize = "9pt";
      
      // Adjust table cell styles
      const cells = table.querySelectorAll('th, td');
      cells.forEach(cell => {
        cell.style.padding = "4px";
        cell.style.border = "1px solid #ddd";
        // Ensure text doesn't overflow
        cell.style.maxWidth = "100px";
        cell.style.overflow = "hidden";
        cell.style.textOverflow = "ellipsis";
        cell.style.whiteSpace = "nowrap";
      });
    });
    
    // Ensure all fonts are appropriate for PDF
    const textElements = invoiceClone.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
    textElements.forEach(el => {
      // Font family that's safe for PDFs
      el.style.fontFamily = "Helvetica, Arial, sans-serif";
      
      // Adjust heading sizes
      if (el.tagName.startsWith('H')) {
        el.style.fontSize = el.tagName === 'H1' ? '16pt' : 
                           el.tagName === 'H2' ? '14pt' : 
                           el.tagName === 'H3' ? '12pt' : '10pt';
      }
    });
    
    try {
      // Split content into pages
      const pdfContent = await html2pdf().from(invoiceClone).outputPdf();
      
      // Function to render content in chunks
      async function renderToCanvas(element) {
        // Get the height required to render the full content
        const tempCanvas = await html2canvas(element, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: false
        });
        
        const totalHeight = tempCanvas.height;
        const contentWidth = tempCanvas.width;
        
        // Calculate how many pages we need
        const contentAreaHeight = pageHeight - 2 * margin;
        const totalPages = Math.ceil(totalHeight / contentAreaHeight);
        
        // Render each page
        for (let i = 0; i < totalPages; i++) {
          // If not the first page, add a new page
          if (i > 0) {
            pdf.addPage();
          }
          
          // Calculate the portion of content to render for this page
          const srcY = i * contentAreaHeight * 2; // Multiply by 2 because of our scale factor
          const srcHeight = Math.min(contentAreaHeight * 2, totalHeight - srcY);
          
          // Create a new canvas for just this portion
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = contentWidth;
          pageCanvas.height = srcHeight;
          const ctx = pageCanvas.getContext('2d');
          
          // Draw the portion of the original canvas onto this new canvas
          ctx.drawImage(
            tempCanvas,
            0, srcY,               // Source x, y
            contentWidth, srcHeight, // Source width, height
            0, 0,                    // Destination x, y
            contentWidth, srcHeight  // Destination width, height
          );
          
          // Add this canvas as an image to the PDF
          const imgData = pageCanvas.toDataURL('image/jpeg', 0.95);
          const imgWidth = pageWidth - 2 * margin;
          const imgHeight = (srcHeight * imgWidth) / contentWidth;
          
          pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
        }
        
        return pdf;
      }
      
      await renderToCanvas(invoiceClone);
      
      // Clean up the clone
      document.body.removeChild(invoiceClone);
      
      // Save the PDF
      pdf.save(`Invoice_${invoiceData.oid || "invoice"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Fallback to simpler method if the advanced method fails
      try {
        // Clean up the clone
        document.body.removeChild(invoiceClone);
        
        // Use simpler jsPDF direct method
        const simpleContent = fullInvoiceRef.current;
        html2canvas(simpleContent, { scale: 1.5 }).then(canvas => {
          const imgData = canvas.toDataURL('image/jpeg', 0.8);
          const imgWidth = pageWidth - 2 * margin;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Add image to PDF
          pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
          pdf.save(`Invoice_${invoiceData.oid || "invoice"}.pdf`);
        });
      } catch (fallbackError) {
        console.error("Fallback PDF generation failed:", fallbackError);
        alert("Failed to generate PDF. Please try again.");
      }
    }
  };

  // Handle preview dialog
  const handleOpenPreview = () => setPreviewOpen(true);
  const handleClosePreview = () => setPreviewOpen(false);
  
  // Get order status display format
  const getOrderStatusDisplay = (status) => {
    switch (status) {
      case 'ORDER_PLACED':
        return { text: 'Order Placed', color: '#2196f3' };
      case 'ORDER_CONFIRMED':
        return { text: 'Confirmed', color: '#4caf50' };
      case 'ORDER_READY':
        return { text: 'Ready', color: '#ff9800' };
      case 'ORDER_DELIVERED':
        return { text: 'Delivered', color: '#4caf50' };
      case 'ORDER_CANCELLED':
        return { text: 'Cancelled', color: '#f44336' };
      default:
        return { text: status || 'Unknown', color: '#9e9e9e' };
    }
  };
  
  const orderStatus = getOrderStatusDisplay(invoiceData.status);

  return (
    <Card sx={{ 
      width: "100%", 
      maxWidth: 800, 
      mb: 2,
      borderRadius: 3,
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      overflow: "hidden"
    }}>
      {/* Invoice Card Header */}
      <Box sx={{ 
        p: 2, 
        bgcolor: "#f8f9fa",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: "#e3f2fd" }}>
            <Receipt sx={{ color: "#1976d2" }} />
          </Avatar>
          <Stack>
            <Typography variant="subtitle1" fontWeight={600}>
              Order #{invoiceData.oid || "N/A"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(invoiceData.created_at || new Date())}
            </Typography>
          </Stack>
        </Stack>
        
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip 
            label={orderStatus.text} 
            size="small" 
            sx={{ 
              bgcolor: `${orderStatus.color}20`, 
              color: orderStatus.color,
              fontWeight: 500,
              mr: 1
            }}
          />
          
          <IconButton 
            size="small" 
            onClick={handleOpenPreview}
            sx={{ 
              bgcolor: "#e3f2fd", 
              '&:hover': { bgcolor: "#bbdefb" } 
            }}
          >
            <Visibility fontSize="small" sx={{ color: "#1976d2" }} />
          </IconButton>
       
          
          <IconButton 
            size="small" 
            onClick={() => setExpanded(!expanded)}
            sx={{ 
              bgcolor: "#fff3e0", 
              '&:hover': { bgcolor: "#ffe0b2" },
              transform: expanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s'
            }}
          >
            <KeyboardArrowDown fontSize="small" sx={{ color: "#f57c00" }} />
          </IconButton>
        </Stack>
      </Box>
      
      {/* Invoice Summary */}
      <Collapse in={expanded}>
        <CardContent sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, borderRadius: 2 }} variant="outlined">
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Customer Details
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {customerName}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                    Phone: {customerMobile}
                  </Typography>
                  {invoiceData.delivery_details?.deliveryDetails && (
                    <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                      {deliveryAddress}
                    </Typography>
                  )}
                </Stack>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, borderRadius: 2 }} variant="outlined">
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Order Details
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarToday sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                          {formatDate(invoiceData.delivery_date || invoiceData.created_at)}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AttachMoney sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                          {invoiceData.mode || "Cash"}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Description sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                          Booked from: {invoiceData.booked_from || "N/A"}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocationOn sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                          {invoiceData.station_name || restdata.station_name || "N/A"}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Items Summary - Mobile Friendly */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Items Summary
            </Typography>
            
            {isMobile ? (
              // Mobile view - simplified list
              <Stack spacing={1}>
                {items.slice(0, 3).map((item, idx) => (
                  <Paper key={idx} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={500}>
                        {item.particulars}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(item.amount)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" mt={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        {item.qty} × {formatCurrency(item.rate)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        GST: {item.sgst + item.cgst}%
                      </Typography>
                    </Stack>
                  </Paper>
                ))}
                
                {items.length > 3 && (
                  <Typography variant="body2" color="text.secondary" align="center">
                    +{items.length - 3} more items...
                  </Typography>
                )}
              </Stack>
            ) : (
              // Tablet/Desktop view - compact table
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Rate</TableCell>
                      <TableCell align="right">GST</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.slice(0, 5).map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.particulars}</TableCell>
                        <TableCell align="right">{item.qty}</TableCell>
                        <TableCell align="right">{formatCurrency(item.rate)}</TableCell>
                        <TableCell align="right">{item.gst}%</TableCell>
                        <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                    
                    {items.length > 5 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary">
                            +{items.length - 5} more items...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
          
          {/* Total Section */}
          <Paper 
            sx={{ 
              mt: 2, 
              p: 2, 
              borderRadius: 2, 
              bgcolor: "#f8f9fa",
              border: "1px solid #e0e0e0" 
            }}
          >
            <Grid container spacing={1}>
              <Grid item xs={7} sm={9}>
                <Typography variant="body2" color="text.secondary">
                  Subtotal:
                </Typography>
              </Grid>
              <Grid item xs={5} sm={3}>
                <Typography variant="body2" align="right">
                  {formatCurrency(total.subTotal)}
                </Typography>
              </Grid>
              
              <Grid item xs={7} sm={9}>
                <Typography variant="body2" color="text.secondary">
                  GST (5%):
                </Typography>
              </Grid>
              <Grid item xs={5} sm={3}>
                <Typography variant="body2" align="right">
                  {formatCurrency(total.gst)}
                </Typography>
              </Grid>
              
              <Grid item xs={7} sm={9}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Total Amount:
                </Typography>
              </Grid>
              <Grid item xs={5} sm={3}>
                <Typography variant="subtitle2" fontWeight={600} align="right">
                  {formatCurrency(total.subTotal)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Comments Section */}
          {invoiceData.comment && (
            <Paper 
              sx={{ 
                mt: 2, 
                p: 2, 
                borderRadius: 2,
                border: "1px solid #e0e0e0",
                bgcolor: "#fff8e1" 
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Customer Notes:
              </Typography>
              <Typography variant="body2">
                {invoiceData.comment}
              </Typography>
            </Paper>
          )}
        </CardContent>
      </Collapse>
      
      {/* Full Invoice Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: 3,
            width: "100%",
            maxHeight: "90vh"
          }
        }}
      >
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid #e0e0e0"
        }}>
          <Typography variant="h6" fontWeight={600}>
            Invoice Preview
          </Typography>
          <IconButton onClick={handleClosePreview} edge="end">
            <Close />
          </IconButton>
        </Box>
        
        <DialogContent sx={{ p: 0 }}>
          <Box 
            sx={{ 
              p: 2, 
              maxHeight: "70vh", 
              overflowY: "auto",
              bgcolor: "#f5f5f5"
            }}
          >
            {/* This is the content that will be rendered in the PDF */}
            <Paper 
              ref={fullInvoiceRef} 
              sx={{ 
                p: 3, 
                mx: "auto", 
                maxWidth: 800, 
                bgcolor: "white",
                overflowX: "hidden" // Prevent horizontal overflow
              }}
              className="pdf-content" // Add class for PDF-specific styling
            >
              {/* Header Section with Logo */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                flexWrap="wrap"
              >
                {/* Left Side: Logo & Company Info */}
                <Box sx={{ display: "flex", alignItems: "center", minWidth: 240, mb: 2 }}>
                  <img
                    src={restdata.logo_image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcWNtdgxebNm3zmoxrpPnWAdyZWp6XkD_VCQ&s"}
                    alt="Company Logo"
                    style={{ width: 80, height: "auto", marginRight: 16 }}
                  />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {restdata.outlet_name || "OLF Foods Pvt Ltd"}
                    </Typography>
                    <Typography variant="body2">
                      {restdata.address}, {restdata.city}, {restdata.state}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      GSTN No.: {restdata.gst || "XXXXXXXXXXXX"}
                    </Typography>
                    <Typography variant="body2">
                      FSSAI: {restdata.fssai || "XXXXXXXXXXXX"}
                    </Typography>
                  </Box>
                </Box>

                {/* Right Side: Invoice Details */}
                <Box textAlign="right" sx={{ minWidth: 240, mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    TAX INVOICE
                  </Typography>
                  <Typography variant="body2">
                    Order No: {invoiceData.oid || "ORD-XXXXX"}
                  </Typography>
                  <Typography variant="body2">
                    Date: {formatDate(invoiceData.created_at)}
                  </Typography>
                  <Typography variant="body2">
                    Payment Type: {invoiceData.mode || "Cash"}
                  </Typography>
                  <Typography variant="body2">
                    Status: {orderStatus.text}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Bill To & Vendor Details */}
              <Box
                display="flex"
                justifyContent="space-between"
                flexWrap="wrap"
                sx={{ mb: 2 }}
              >
                <Box sx={{ minWidth: 240, mr: 2, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                    Customer Details:
                  </Typography>
                  <Typography variant="body2">Name: {customerName}</Typography>
                  <Typography variant="body2">Phone: {customerMobile}</Typography>
                  {invoiceData.customer_info?.customerDetails?.alternateMobile && (
                    <Typography variant="body2">
                      Alternate Phone: {invoiceData.customer_info.customerDetails.alternateMobile}
                    </Typography>
                  )}
                  {invoiceData.delivery_details?.deliveryDetails && (
                    <>
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold" }}>
                        Delivery Details:
                      </Typography>
                      <Typography variant="body2">
                        PNR: {invoiceData.delivery_details.deliveryDetails.pnr || "N/A"}
                      </Typography>
                      <Typography variant="body2">
                        Train: {invoiceData.delivery_details.deliveryDetails.trainNo || "N/A"}, 
                        Coach: {invoiceData.delivery_details.deliveryDetails.coach || "N/A"}, 
                        Berth: {invoiceData.delivery_details.deliveryDetails.berth || "N/A"}
                      </Typography>
                      <Typography variant="body2">
                        Passenger Count: {invoiceData.delivery_details.deliveryDetails.passengerCount || "1"}
                      </Typography>
                    </>
                  )}
                </Box>

                <Box sx={{ minWidth: 240, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                    Restaurant Details:
                  </Typography>
                  <Typography variant="body2">{restdata.outlet_name || "Restaurant Name"}</Typography>
                  <Typography variant="body2">
                    {restdata.address || "Address not available"}
                  </Typography>
                  <Typography variant="body2">
                    {restdata.city}, {restdata.state}
                  </Typography>
                  <Typography variant="body2">
                    GST: {restdata.gst || "Not Available"}
                  </Typography>
                  <Typography variant="body2">
                    FSSAI: {restdata.fssai || "Not Available"} (Valid till: {restdata.fssai_valid || "N/A"})
                  </Typography>
                  <Typography variant="body2">
                    Phone: {restdata.phone || "N/A"}
                  </Typography>
                </Box>
              </Box>

              {/* Table of Items - PDF optimized */}
              <TableContainer component={Paper} variant="outlined" sx={{ width: "100%" }}>
                <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ width: "5%" }}>S.No</TableCell>
                      <TableCell sx={{ width: "30%" }}>Item</TableCell>
                      <TableCell sx={{ width: "8%" }}>Qty</TableCell>
                      <TableCell sx={{ width: "12%" }}>Rate</TableCell>
                      <TableCell sx={{ width: "15%" }}>Taxable</TableCell>
                      <TableCell sx={{ width: "10%" }}>GST</TableCell>
                      <TableCell sx={{ width: "15%" }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.sNo}</TableCell>
                        <TableCell sx={{ 
                          whiteSpace: "nowrap", 
                          overflow: "hidden", 
                          textOverflow: "ellipsis" 
                        }}>
                          {item.particulars}
                        </TableCell>
                        <TableCell>{item.qty}</TableCell>
                        <TableCell>{formatCurrency(item.rate)}</TableCell>
                        <TableCell>{formatCurrency(item.taxable)}</TableCell>
                        <TableCell>5%</TableCell>
                        <TableCell>{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                    
                    {/* If no items, show a placeholder row */}
                    {(!items || items.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">No items available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Totals */}
              <Box sx={{ mt: 3, textAlign: "right" }}>
                <Typography variant="body2">
                  Sub Total: {formatCurrency(total.subTotal-total.subTotal*0.05)}
                </Typography>
                <Typography variant="body2">
                  GST (5%): {formatCurrency(total.subTotal*0.05)}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold", mt: 1 }}>
                  Total: {formatCurrency(total.subTotal)}
                </Typography>
                <Typography variant="body2">
                  In Words: {total.totalInWords || "Amount in words not available"}
                </Typography>
              </Box>

              {/* Notes/Comments */}
              {invoiceData.comment && (
                <Box sx={{ mt: 2, p: 2, border: "1px solid #f0f0f0", borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    Customer Notes:
                  </Typography>
                  <Typography variant="body2">
                    {invoiceData.comment}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Footer / Thank You Note */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>
                  Thank you for ordering from {restdata.outlet_name || "us"}!
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 1 }}>
                  If you have any questions about this invoice, please contact {restdata.email || "us"}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
                  This is a computer-generated invoice and does not require a physical signature.
                </Typography>
              </Box>
            </Paper>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
          <Button onClick={handleClosePreview} color="inherit">
            Close
          </Button>
          <Button 
            onClick={generatePDF} 
            variant="contained" 
            startIcon={<FileDownload />}
            color="primary"
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

const Reports = ({ restdata }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        // You can still fetch station data if needed
        await axiosInstance.get(`/stations/?station_code=${restdata?.station_code}`);
        const res1 = await axiosInstance.get(`/orders/?outlet_id=${restdata?.outlet_id}`);
        const apiOrders = res1?.data?.data?.rows || [];
        setOrders(apiOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    if (restdata) {
      getData();
    }
  }, [restdata]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        p: 2,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        bgcolor: "#f5f5f5",
        minHeight: "100vh"
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          mb: 3
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Invoice Reports
        </Typography>
        <Chip 
          label={`${orders.length} Orders`} 
          color="primary" 
          size="small"
          sx={{ fontWeight: 500 }}
        />
      </Box>
      
      {/* Restaurant Info Card */}
      {restdata && (
        <Card sx={{ mb: 3, p: 2, borderRadius: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            {restdata.logo_image && (
              <Avatar 
                src={restdata.logo_image}
                alt={restdata.outlet_name}
                sx={{ width: 60, height: 60, borderRadius: 2 }}
                variant="rounded"
              />
            )}
            <Stack>
              <Typography variant="h6" fontWeight={600}>
                {restdata.outlet_name || "Restaurant"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {restdata.address}, {restdata.city}, {restdata.state}
              </Typography>
              <Stack direction="row" spacing={2} mt={0.5}>
                <Typography variant="caption" color="text.secondary">
                  GSTIN: {restdata.gst || "N/A"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  FSSAI: {restdata.fssai || "N/A"}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Card>
      )}
      
      {/* Invoices List */}
      <Box sx={{ flex: 1 }}>
        {loading ? (
          <Paper 
            sx={{ 
              p: 4, 
              textAlign: "center", 
              borderRadius: 3,
              bgcolor: "white"
            }}
          >
            <Typography>Loading orders...</Typography>
          </Paper>
        ) : orders.length > 0 ? (
          <Stack spacing={2}>
            {orders.map((order, index) => (
              <InvoiceReport key={index} invoiceData={order} restdata={restdata} />
            ))}
          </Stack>
        ) : (
          <Paper 
            sx={{ 
              p: 3, 
              textAlign: "center", 
              borderRadius: 3,
              bgcolor: "white"
            }}
          >
            <Typography variant="body1" paragraph>
              No orders found.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed orders will appear here as invoices.
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default Reports;