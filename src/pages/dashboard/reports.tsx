import React, { useRef } from "react";
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
  Button
} from "@mui/material";
import { FileDownload } from "@mui/icons-material";
import { jsPDF } from "jspdf";

// Dummy invoice data
const invoiceData = {
  companyName: "OLF Foods Pvt Ltd",
  companyAddress: [
    "B-148, 11th Floor, Statesman House",
    "Barakhamba Road, New Delhi - 110001"
  ],
  gstNumber: "07AAACT4787H1ZM",
  invoiceNo: "IN24-25-50645134",
  invoiceDate: "09-03-2025",
  paymentType: "Cash",
  receiptNo: "1234567",
  billTo: {
    name: "Prashasena Singh",
    address: "H NO 189, Mayur Nagar, Gandhi Nagar, Bikaner",
    gstin: "XYZAB1234C"
  },
  placeOfSupply: "Rajasthan",
  vendor: {
    name: "Orange Clove",
    address: "Subhash Nagar, Jaipur (Raj)",
    code: "B53",
    sacCode: "9999"
  },
  items: [
    {
      sNo: 1,
      code: "FYSN-105",
      particulars: "Veg Biryani Raita Combo",
      qty: 1,
      rate: 167.0,
      taxable: 167.0,
      sgst: 5.0,
      cgst: 5.0,
      amount: 175.0
    }
  ],
  total: {
    subTotal: 167.0,
    sgst: 8.35,
    cgst: 8.35,
    totalAmount: 175.0,
    totalInWords: "One Hundred Seventy Five Only"
  }
};

const Reports = () => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const generatePDF = () => {
    const doc = new jsPDF("p", "pt", "a4");
    // The 'width' and 'windowWidth' props help control scaling to avoid overflow.
    doc.html(invoiceRef.current!, {
      callback: function (pdf) {
        pdf.save("invoice.pdf");
      },
      x: 10,
      y: 10,
      width: 550,
      windowWidth: 1000
    });
  };

  return (
    <Box
      sx={{
        width: "100%",
        p: 2,
        display: "flex",
        justifyContent: "center",
        boxSizing: "border-box"
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 800, p: 2 }}>
        {/* Download PDF Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <IconButton onClick={generatePDF} color="primary">
            <FileDownload />
          </IconButton>
        </Box>

        {/* Invoice Content */}
        <Box ref={invoiceRef} sx={{ px: 2, fontFamily: "Arial, sans-serif" }}>
          {/* Header Section with Logo */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            flexWrap="wrap"
          >
            {/* Left Side: Logo & Company Info */}
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 240 }}>
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcWNtdgxebNm3zmoxrpPnWAdyZWp6XkD_VCQ&s"
                alt="Company Logo"
                style={{ width: 80, height: "auto", marginRight: 16 }}
              />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {invoiceData.companyName}
                </Typography>
                {invoiceData.companyAddress.map((line, idx) => (
                  <Typography variant="body2" key={idx}>
                    {line}
                  </Typography>
                ))}
                <Typography variant="body2" sx={{ mt: 1 }}>
                  GSTN No.: {invoiceData.gstNumber}
                </Typography>
              </Box>
            </Box>

            {/* Right Side: Invoice Details */}
            <Box textAlign="right" sx={{ minWidth: 240, mt: { xs: 2, sm: 0 } }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                TAX INVOICE
              </Typography>
              <Typography variant="body2">
                Invoice No: {invoiceData.invoiceNo}
              </Typography>
              <Typography variant="body2">
                Date: {invoiceData.invoiceDate}
              </Typography>
              <Typography variant="body2">
                Payment Type: {invoiceData.paymentType}
              </Typography>
              <Typography variant="body2">
                Receipt No: {invoiceData.receiptNo}
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
              <Typography variant="body2">{invoiceData.billTo.name}</Typography>
              <Typography variant="body2">
                {invoiceData.billTo.address}
              </Typography>
              <Typography variant="body2">
                GSTIN: {invoiceData.billTo.gstin}
              </Typography>
            </Box>

            <Box sx={{ minWidth: 240, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                Place of Supply:
              </Typography>
              <Typography variant="body2">
                {invoiceData.placeOfSupply}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: "bold", mt: 2 }}>
                Name of Supplier:
              </Typography>
              <Typography variant="body2">{invoiceData.vendor.name}</Typography>
              <Typography variant="body2">
                {invoiceData.vendor.address}
              </Typography>
              <Typography variant="body2">
                Code: {invoiceData.vendor.code}
              </Typography>
              <Typography variant="body2">
                SAC Code: {invoiceData.vendor.sacCode}
              </Typography>
            </Box>
          </Box>

          {/* Table of Items */}
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>S.No</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Particulars</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Rate (₹)</TableCell>
                  <TableCell>Taxable (₹)</TableCell>
                  <TableCell>SGST (%)</TableCell>
                  <TableCell>CGST (%)</TableCell>
                  <TableCell>Amount (₹)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoiceData.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.sNo}</TableCell>
                    <TableCell>{item.code}</TableCell>
                    <TableCell>{item.particulars}</TableCell>
                    <TableCell>{item.qty}</TableCell>
                    <TableCell>{item.rate.toFixed(2)}</TableCell>
                    <TableCell>{item.taxable.toFixed(2)}</TableCell>
                    <TableCell>{item.sgst.toFixed(2)}</TableCell>
                    <TableCell>{item.cgst.toFixed(2)}</TableCell>
                    <TableCell>{item.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Totals */}
          <Box sx={{ mt: 2, textAlign: "right" }}>
            <Typography variant="body2">
              Sub Total: ₹{invoiceData.total.subTotal.toFixed(2)}
            </Typography>
            <Typography variant="body2">
              SGST: ₹{invoiceData.total.sgst.toFixed(2)}
            </Typography>
            <Typography variant="body2">
              CGST: ₹{invoiceData.total.cgst.toFixed(2)}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: "bold", mt: 1 }}>
              Total: ₹{invoiceData.total.totalAmount.toFixed(2)}
            </Typography>
            <Typography variant="body2">
              In Words: {invoiceData.total.totalInWords}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Footer / Thank You Note */}
          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Thank you for using OLF Foods!</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            If you have any questions about this invoice, please contact
            support@example.com
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default Reports;
