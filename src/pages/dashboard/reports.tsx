import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Divider,
  Button,
  Stack,
  Chip,
  Avatar,
  Paper,
  Grid,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  FileDownload,
  Receipt,
  Close,
  Visibility,
  ArrowForwardIos,
} from "@mui/icons-material";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import axiosInstance from "../../interceptor/axiosInstance";

// Helper functions (formatCurrency, calculateOrderTotals) remain the same
// ... (Your helper functions go here)
const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

const calculateOrderTotals = (items) => {
  if (!items || !Array.isArray(items)) return { subTotal: 0, gst: 0, grandTotal: 0, totalInWords: "Zero Rupees" };
  const subTotal = items.reduce((sum, item) => sum + item.SellingPrice * item.quantity, 0);
  const gstRate = 0.05;
  const gst = subTotal * gstRate;
  const grandTotal = subTotal + gst;
  const numberToWords = (num) => {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    if ((num = num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim().charAt(0).toUpperCase() + str.slice(1) + 'Only';
  };
  const totalInWords = numberToWords(Math.round(grandTotal));
  return { subTotal, gst, grandTotal, totalInWords };
};
// ThermalReceipt component remains the same
// ... (Your ThermalReceipt component goes here)
const ThermalReceipt = React.forwardRef(({ invoiceData, restdata, totals }, ref) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })}`;
  };
  
  const customerName = invoiceData.customer_info?.customerDetails?.customerName || "Guest";

  return (
    <Box
      ref={ref}
      sx={{
        width: "300px", // Standard 80mm thermal receipt width
        p: 1.5,
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: "12px",
        color: "#000",
        backgroundColor: "#fff",
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <Box textAlign="center" sx={{ mb: 1 }}>
        <Typography variant="h6" component="h1" sx={{ fontFamily: 'inherit', fontWeight: 'bold', fontSize: '16px' }}>
          {restdata.outlet_name || "Restaurant Name"}
        </Typography>
        <Typography sx={{ fontFamily: 'inherit', fontSize: '11px' }}>{restdata.address}, {restdata.city}</Typography>
        <Typography sx={{ fontFamily: 'inherit', fontSize: '11px' }}>Phone: {restdata.phone}</Typography>
        <Typography sx={{ fontFamily: 'inherit', fontSize: '11px' }}>GSTIN: {restdata.gst}</Typography>
        <Typography sx={{ fontFamily: 'inherit', fontSize: '11px' }}>FSSAI: {restdata.fssai}</Typography>
        <Typography variant="h6" component="h2" sx={{ fontFamily: 'inherit', fontWeight: 'bold', mt: 1, fontSize: '14px' }}>
          TAX INVOICE
        </Typography>
      </Box>

      <Divider sx={{ borderStyle: 'dashed', borderColor: '#000', my: 1 }} />
      
      {/* Order Info */}
      <Box>
        <p><strong>Order No:</strong> {invoiceData.oid}</p>
        <p><strong>Date:</strong> {formatDate(invoiceData.created_at)}</p>
        <p><strong>Billed to:</strong> {customerName}</p>
        {invoiceData.delivery_details?.deliveryDetails && (
          <p>
            <strong>Delivery:</strong> Train {invoiceData.delivery_details.deliveryDetails.trainNo}, 
            C-{invoiceData.delivery_details.deliveryDetails.coach}, 
            B-{invoiceData.delivery_details.deliveryDetails.berth}
          </p>
        )}
      </Box>

      <Divider sx={{ borderStyle: 'dashed', borderColor: '#000', my: 1 }} />
      
      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit', fontSize: '12px' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '2px 0' }}>Item</th>
            <th style={{ textAlign: 'center', padding: '2px 0' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '2px 0' }}>Rate</th>
            <th style={{ textAlign: 'right', padding: '2px 0' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoiceData.menu_items?.items?.map((item, index) => (
            <tr key={index}>
              <td style={{ textAlign: 'left', padding: '2px 0' }}>{item.name}</td>
              <td style={{ textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right' }}>{item.SellingPrice.toFixed(2)}</td>
              <td style={{ textAlign: 'right' }}>{(item.SellingPrice * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Divider sx={{ borderStyle: 'dashed', borderColor: '#000', my: 1 }} />
      
      {/* Totals Section */}
      <Box>
        <Stack direction="row" justifyContent="space-between">
            <Typography sx={{ fontFamily: 'inherit' }}>Subtotal:</Typography>
            <Typography sx={{ fontFamily: 'inherit' }}>{formatCurrency(totals.subTotal)}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
            <Typography sx={{ fontFamily: 'inherit' }}>GST @ 5%:</Typography>
            <Typography sx={{ fontFamily: 'inherit' }}>{formatCurrency(totals.gst)}</Typography>
        </Stack>
      </Box>

      <Divider sx={{ borderStyle: 'dashed', borderColor: '#000', my: 1 }} />
      
      {/* Grand Total */}
      <Stack direction="row" justifyContent="space-between" sx={{ fontWeight: 'bold', fontSize: '14px' }}>
          <Typography sx={{ fontFamily: 'inherit', fontWeight: 'bold', fontSize: '14px' }}>GRAND TOTAL:</Typography>
          <Typography sx={{ fontFamily: 'inherit', fontWeight: 'bold', fontSize: '14px' }}>{formatCurrency(totals.grandTotal)}</Typography>
      </Stack>
      <Typography sx={{ fontFamily: 'inherit', textTransform: 'capitalize', mt: 1, fontSize: '11px' }}>
        {totals.totalInWords}
      </Typography>

      {invoiceData.comment && (
         <>
          <Divider sx={{ borderStyle: 'dashed', borderColor: '#000', my: 1 }} />
          <p><strong>Notes:</strong> {invoiceData.comment}</p>
        </>
      )}

      {/* Footer */}
      <Box textAlign="center" sx={{ mt: 2 }}>
        <p>*** Thank You! Visit Again! ***</p>
        <p>This is a computer-generated receipt.</p>
      </Box>
    </Box>
  );
});

// NEW: A compact list item for the master list
const OrderListItem = ({ order, onSelect, isSelected }) => {
  const totals = calculateOrderTotals(order.menu_items?.items);
  const customerName = order.customer_info?.customerDetails?.customerName || "Guest";
  const theme = useTheme();

  const getOrderStatusDisplay = (status) => {
    switch (status) {
      case 'ORDER_PLACED': return { text: 'Placed', color: '#2196f3' };
      case 'ORDER_CONFIRMED': return { text: 'Confirmed', color: '#4caf50' };
      case 'ORDER_READY': return { text: 'Ready', color: '#ff9800' };
      case 'ORDER_DELIVERED': return { text: 'Delivered', color: '#4caf50' };
      case 'ORDER_CANCELLED': return { text: 'Cancelled', color: '#f44336' };
      default: return { text: status || 'Unknown', color: '#9e9e9e' };
    }
  };
  const orderStatus = getOrderStatusDisplay(order.status);
  
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  return (
    <Card
      onClick={() => onSelect(order)}
      sx={{
        mb: 1.5,
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        borderLeft: isSelected
          ? `4px solid ${theme.palette.primary.main}`
          : "4px solid transparent",
        bgcolor: isSelected ? "#e3f2fd" : "#ffffff",
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack>
            <Typography variant="subtitle1" fontWeight={600}>
              Order #{order.oid}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {customerName}
            </Typography>
          </Stack>
          <Chip label={orderStatus.text} size="small" sx={{ bgcolor: `${orderStatus.color}20`, color: orderStatus.color, fontWeight: 500 }} />
        </Stack>
        <Divider sx={{ my: 1.5 }} />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {formatDate(order.created_at)}
          </Typography>
          <Typography variant="h6" fontWeight={600} color="primary.main">
            {formatCurrency(totals.grandTotal)}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

// NEW: The detail view component
const OrderDetailView = ({ selectedOrder, restdata }) => {
  const receiptRef = useRef(null);

  if (!selectedOrder) {
    return (
      <Paper sx={{ p: 4, textAlign: "center", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", bgcolor: "#fafafa" }}>
        <Receipt sx={{ fontSize: 60, color: "grey.400", mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Select an order to view details
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The full receipt will be displayed here.
        </Typography>
      </Paper>
    );
  }

  const totals = calculateOrderTotals(selectedOrder.menu_items?.items);

  const generatePDF = async () => {
    const receiptElement = receiptRef.current;
    if (!receiptElement) return;

    try {
      const canvas = await html2canvas(receiptElement, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const receiptWidthPt = 227;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const receiptHeightPt = (canvasHeight * receiptWidthPt) / canvasWidth;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [receiptWidthPt, receiptHeightPt] });
      pdf.addImage(imgData, 'PNG', 0, 0, receiptWidthPt, receiptHeightPt);
      pdf.save(`Receipt_${selectedOrder.oid}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: "#f8f9fa" }}>
            <Typography variant="h6" fontWeight={600}>
                Receipt for Order #{selectedOrder.oid}
            </Typography>
            <Button onClick={generatePDF} variant="contained" startIcon={<FileDownload />}>
                Download PDF
            </Button>
        </Box>
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: '#f5f5f5', display: 'flex', justifyContent: 'center', overflowY: 'auto' }}>
            <Paper elevation={5}>
                <ThermalReceipt
                    ref={receiptRef}
                    invoiceData={selectedOrder}
                    restdata={restdata}
                    totals={totals}
                />
            </Paper>
        </Box>
    </Card>
  )
};


// REFACTORED: The main Reports component
const Reports = ({ restdata }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const getData = async () => {
      if (!restdata) return;
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/orders/?outlet_id=${restdata?.outlet_id}`);
        const fetchedOrders = res?.data?.data?.rows || [];
        setOrders(fetchedOrders);
        // Automatically select the first order in the list
        if (fetchedOrders.length > 0) {
          setSelectedOrder(fetchedOrders[0]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [restdata]);
  
  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: "#f5f5f5" }}>
        {/* Header Section */}
        <Box sx={{ p: 2, flexShrink: 0, bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" fontWeight={600}>Invoice Reports</Typography>
                {restdata && (
                    <Stack direction="row" spacing={2} alignItems="center">
                        {restdata.logo_image && <Avatar src={restdata.logo_image} alt={restdata.outlet_name} sx={{ width: 48, height: 48 }} variant="rounded"/>}
                        <Stack>
                            <Typography variant="h6" fontWeight={600}>{restdata.outlet_name}</Typography>
                            <Typography variant="body2" color="text.secondary">{restdata.address}, {restdata.city}</Typography>
                        </Stack>
                    </Stack>
                )}
            </Stack>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, p: 2, overflow: 'hidden' }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                    <Typography sx={{ml: 2}}>Loading orders...</Typography>
                </Box>
            ) : (
                <Grid container spacing={2} sx={{ height: '100%' }}>
                    
                    {/* Left Column: Orders List */}
                    <Grid item xs={12} md={5} lg={4} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                       <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{p:1, mb: 1}}>
                           <Typography variant="subtitle1" fontWeight={500}>All Orders</Typography>
                           <Chip label={`${orders.length} Orders`} color="primary" size="small" />
                       </Stack>
                        <Box sx={{ overflowY: 'auto', flexGrow: 1, pr: 1 }}>
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <OrderListItem
                                        key={order.oid}
                                        order={order}
                                        onSelect={handleSelectOrder}
                                        isSelected={selectedOrder?.oid === order.oid}
                                    />
                                ))
                            ) : (
                                <Paper sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography>No orders found.</Typography>
                                </Paper>
                            )}
                        </Box>
                    </Grid>

                    {/* Right Column: Order Details */}
                    <Grid item xs={12} md={7} lg={8} sx={{ height: '100%' }}>
                       <OrderDetailView selectedOrder={selectedOrder} restdata={restdata} />
                    </Grid>

                </Grid>
            )}
        </Box>
    </Box>
  );
};

export default Reports;