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
  KeyboardArrowUp, 
  CalendarToday,
  LocationOn,
  AttachMoney,
  ShoppingCart,
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

// Define a component for each invoice report
const InvoiceReport: React.FC<{ invoiceData: any, restdata: any }> = ({ invoiceData, restdata }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const fullInvoiceRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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
      pdf.save(`Invoice_${invoiceData.invoiceNo || "invoice"}.pdf`);
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
          pdf.save(`Invoice_${invoiceData.invoiceNo || "invoice"}.pdf`);
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
              Invoice #{invoiceData.invoiceNo || "N/A"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(invoiceData.invoiceDate || new Date())}
            </Typography>
          </Stack>
        </Stack>
        
        <Stack direction="row" spacing={1}>
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
            onClick={generatePDF}
            sx={{ 
              bgcolor: "#e8f5e9", 
              '&:hover': { bgcolor: "#c8e6c9" } 
            }}
          >
            <FileDownload fontSize="small" sx={{ color: "#388e3c" }} />
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
                    Bill To
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {invoiceData.billTo?.name || restdata?.name || "Customer Name"}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                    {invoiceData.billTo?.address || "Address not available"}
                  </Typography>
                  {invoiceData.billTo?.gstin && (
                    <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                      GSTIN: {invoiceData.billTo?.gstin}
                    </Typography>
                  )}
                </Stack>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, borderRadius: 2 }} variant="outlined">
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Invoice Details
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarToday sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                          {formatDate(invoiceData.invoiceDate)}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AttachMoney sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                          {invoiceData.paymentType || "Cash"}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Description sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                          Receipt: {invoiceData.receiptNo || "N/A"}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocationOn sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                          {invoiceData.placeOfSupply || "Delhi"}
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
                {(invoiceData.items || []).slice(0, 3).map((item, idx) => (
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
                
                {(invoiceData.items || []).length > 3 && (
                  <Typography variant="body2" color="text.secondary" align="center">
                    +{invoiceData.items.length - 3} more items...
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
                    {(invoiceData.items || []).slice(0, 5).map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.particulars}</TableCell>
                        <TableCell align="right">{item.qty}</TableCell>
                        <TableCell align="right">{formatCurrency(item.rate)}</TableCell>
                        <TableCell align="right">{item.sgst + item.cgst}%</TableCell>
                        <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                    
                    {(invoiceData.items || []).length > 5 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary">
                            +{invoiceData.items.length - 5} more items...
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
                  {formatCurrency(invoiceData.total?.subTotal)}
                </Typography>
              </Grid>
              
              <Grid item xs={7} sm={9}>
                <Typography variant="body2" color="text.secondary">
                  SGST + CGST:
                </Typography>
              </Grid>
              <Grid item xs={5} sm={3}>
                <Typography variant="body2" align="right">
                  {formatCurrency((invoiceData.total?.sgst || 0) + (invoiceData.total?.cgst || 0))}
                </Typography>
              </Grid>
              
              <Grid item xs={7} sm={9}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Total Amount:
                </Typography>
              </Grid>
              <Grid item xs={5} sm={3}>
                <Typography variant="subtitle2" fontWeight={600} align="right">
                  {formatCurrency(invoiceData.total?.totalAmount)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
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
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcWNtdgxebNm3zmoxrpPnWAdyZWp6XkD_VCQ&s"
                    alt="Company Logo"
                    style={{ width: 80, height: "auto", marginRight: 16 }}
                  />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      OLF Foods Pvt Ltd
                    </Typography>
                    <Typography variant="body2">
                      B-148, 11th Floor, Statesman House,
                      Barakhamba Road, New Delhi - 110001
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      GSTN No.: {invoiceData.gstNumber || "XXXXXXXXXXXX"}
                    </Typography>
                  </Box>
                </Box>

                {/* Right Side: Invoice Details */}
                <Box textAlign="right" sx={{ minWidth: 240, mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    TAX INVOICE
                  </Typography>
                  <Typography variant="body2">
                    Invoice No: {invoiceData.invoiceNo || "INV-XXXXX"}
                  </Typography>
                  <Typography variant="body2">
                    Date: {formatDate(invoiceData.invoiceDate)}
                  </Typography>
                  <Typography variant="body2">
                    Payment Type: {invoiceData.paymentType || "Cash"}
                  </Typography>
                  <Typography variant="body2">
                    Receipt No: {invoiceData.receiptNo || "RCT-XXXXX"}
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
                    Bill To:
                  </Typography>
                  <Typography variant="body2">{invoiceData.billTo?.name || restdata?.name || "Customer Name"}</Typography>
                  <Typography variant="body2">
                    {invoiceData.billTo?.address || "Address not available"}
                  </Typography>
                  <Typography variant="body2">
                    GSTIN: {invoiceData.billTo?.gstin || "Not Available"}
                  </Typography>
                </Box>

                <Box sx={{ minWidth: 240, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                    Place of Supply:
                  </Typography>
                  <Typography variant="body2">
                    {invoiceData.placeOfSupply || "Delhi"}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", mt: 2, mb: 1 }}>
                    Name of Supplier:
                  </Typography>
                  <Typography variant="body2">{invoiceData.vendor?.name || "OLF Foods Pvt Ltd"}</Typography>
                  <Typography variant="body2">
                    {invoiceData.vendor?.address || "B-148, 11th Floor, Statesman House, Barakhamba Road, New Delhi - 110001"}
                  </Typography>
                  <Typography variant="body2">
                    Code: {invoiceData.vendor?.code || "SUP-001"}
                  </Typography>
                  <Typography variant="body2">
                    SAC Code: {invoiceData.vendor?.sacCode || "9963"}
                  </Typography>
                </Box>
              </Box>

              {/* Table of Items - PDF optimized */}
              <TableContainer component={Paper} variant="outlined" sx={{ width: "100%" }}>
                <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ width: "5%" }}>S.No</TableCell>
                      <TableCell sx={{ width: "8%" }}>Code</TableCell>
                      <TableCell sx={{ width: "25%" }}>Particulars</TableCell>
                      <TableCell sx={{ width: "5%" }}>Qty</TableCell>
                      <TableCell sx={{ width: "10%" }}>Rate</TableCell>
                      <TableCell sx={{ width: "12%" }}>Taxable</TableCell>
                      <TableCell sx={{ width: "8%" }}>SGST</TableCell>
                      <TableCell sx={{ width: "8%" }}>CGST</TableCell>
                      <TableCell sx={{ width: "12%" }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(invoiceData.items || []).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.sNo || index + 1}</TableCell>
                        <TableCell>{item.code || "ITM" + (index + 1)}</TableCell>
                        <TableCell sx={{ 
                          whiteSpace: "nowrap", 
                          overflow: "hidden", 
                          textOverflow: "ellipsis" 
                        }}>
                          {item.particulars || "Item " + (index + 1)}
                        </TableCell>
                        <TableCell>{item.qty || 1}</TableCell>
                        <TableCell>{formatCurrency(item.rate || 0)}</TableCell>
                        <TableCell>{formatCurrency(item.taxable || 0)}</TableCell>
                        <TableCell>{item.sgst?.toFixed(2) || "0.00"}%</TableCell>
                        <TableCell>{item.cgst?.toFixed(2) || "0.00"}%</TableCell>
                        <TableCell>{formatCurrency(item.amount || 0)}</TableCell>
                      </TableRow>
                    ))}
                    
                    {/* If no items, show a placeholder row */}
                    {(!invoiceData.items || invoiceData.items.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={9} align="center">No items available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Totals */}
              <Box sx={{ mt: 3, textAlign: "right" }}>
                <Typography variant="body2">
                  Sub Total: {formatCurrency(invoiceData.total?.subTotal)}
                </Typography>
                <Typography variant="body2">
                  SGST: {formatCurrency(invoiceData.total?.sgst)}
                </Typography>
                <Typography variant="body2">
                  CGST: {formatCurrency(invoiceData.total?.cgst)}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold", mt: 1 }}>
                  Total: {formatCurrency(invoiceData.total?.totalAmount)}
                </Typography>
                <Typography variant="body2">
                  In Words: {invoiceData.total?.totalInWords || "Amount in words not available"}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Footer / Thank You Note */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center" }}>
                  Thank you for using OLF Foods!
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 1 }}>
                  If you have any questions about this invoice, please contact support@olffoods.com
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

interface ReportsProps {
  restdata: any;
}

const Reports: React.FC<ReportsProps> = ({ restdata }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        // You can still fetch station data if needed
        await axiosInstance.get(`/stations/?station_id=${restdata?.station_id}`);
        const res1 = await axiosInstance.get(`/orders/?res_id=${restdata?.res_id}`);
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
          label={`${orders.length} Invoices`} 
          color="primary" 
          size="small"
          sx={{ fontWeight: 500 }}
        />
      </Box>
      
      {/* Invoices List */}
      <Box sx={{ flex: 1 }}>
        {loading ? (
          <Typography>Loading invoices...</Typography>
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
              No invoices found.
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