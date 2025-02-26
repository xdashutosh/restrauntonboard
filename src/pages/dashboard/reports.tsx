// import { 
//   Box, 
//   Card, 
//   CardContent, 
//   Typography,
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableRow,
//   Paper
// } from '@mui/material';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer
// } from 'recharts';

// const salesData = [
//   { name: 'Mon', sales: 4000 },
//   { name: 'Tue', sales: 3000 },
//   { name: 'Wed', sales: 5000 },
//   { name: 'Thu', sales: 2780 },
//   { name: 'Fri', sales: 1890 },
//   { name: 'Sat', sales: 6390 },
//   { name: 'Sun', sales: 3490 },
// ];

// const topItems = [
//   { name: 'Butter Chicken', sales: 145, revenue: 14500 },
//   { name: 'Paneer Tikka', sales: 125, revenue: 11250 },
//   { name: 'Biryani', sales: 98, revenue: 9800 },
//   { name: 'Naan', sales: 200, revenue: 4000 },
//   { name: 'Dal Makhani', sales: 88, revenue: 7040 },
// ];

// export default function Reports() {
//   return (
//     <Box>
//       <Typography variant="h5" gutterBottom>
//         Weekly Reports
//       </Typography>

//       <Card sx={{ mb: 3 }}>
//         <CardContent>
//           <Typography variant="h6" gutterBottom>
//             Sales Overview
//           </Typography>
//           <Box sx={{ height: 300 }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart
//                 data={salesData}
//                 margin={{
//                   top: 5,
//                   right: 30,
//                   left: 20,
//                   bottom: 5,
//                 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Line
//                   type="monotone"
//                   dataKey="sales"
//                   stroke="#8884d8"
//                   activeDot={{ r: 8 }}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </Box>
//         </CardContent>
//       </Card>

//       <Paper sx={{ overflow: 'hidden' }}>
//         <Typography variant="h6" sx={{ p: 2 }}>
//           Top Selling Items
//         </Typography>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Item Name</TableCell>
//               <TableCell align="right">Units Sold</TableCell>
//               <TableCell align="right">Revenue (₹)</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {topItems.map((item) => (
//               <TableRow key={item.name}>
//                 <TableCell component="th" scope="row">
//                   {item.name}
//                 </TableCell>
//                 <TableCell align="right">{item.sales}</TableCell>
//                 <TableCell align="right">{item.revenue}</TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </Paper>
//     </Box>
//   );
// }

import React, { useState } from "react";
import { Card, CardContent, Typography, IconButton, Box, Tabs, Tab, Stack, Chip } from "@mui/material";
import { FileDownload, AccessTime } from "@mui/icons-material";
import { jsPDF } from "jspdf";

const salesData = {
  daily: [
    { label: "Today Sales", value: "₹8,250", change: "+12%", color: "#4CAF50" },
    { label: "Number of Orders", value: "64", change: "+32%", color: "#4CAF50" },
    { label: "Order Delivered", value: "48", change: "+24%", color: "#4CAF50" },
    { label: "Order Undelivered", value: "24", change: "-12%", color: "#D32F2F" },
    { label: "Top Rating Product", value: "Shahi Paneer", isBold: true },
    { label: "Average Order Value", value: "₹500", change: "+8%", color: "#4CAF50" }
  ],
  weekly: [
    { label: "Weekly Sales", value: "₹56,000", change: "+15%", color: "#4CAF50" },
    { label: "Number of Orders", value: "420", change: "+28%", color: "#4CAF50" },
    { label: "Order Delivered", value: "370", change: "+22%", color: "#4CAF50" },
    { label: "Order Undelivered", value: "50", change: "-5%", color: "#D32F2F" },
    { label: "Top Rating Product", value: "Butter Chicken", isBold: true },
    { label: "Average Order Value", value: "₹550", change: "+10%", color: "#4CAF50" }
  ],
  monthly: [
    { label: "Monthly Sales", value: "₹2,40,000", change: "+18%", color: "#4CAF50" },
    { label: "Number of Orders", value: "1,800", change: "+30%", color: "#4CAF50" },
    { label: "Order Delivered", value: "1,600", change: "+25%", color: "#4CAF50" },
    { label: "Order Undelivered", value: "200", change: "-8%", color: "#D32F2F" },
    { label: "Top Rating Product", value: "Tandoori Roti", isBold: true },
    { label: "Average Order Value", value: "₹580", change: "+12%", color: "#4CAF50" }
  ]
};

const Reports = () => {
  const [selectedTab, setSelectedTab] = useState<any>("daily");
  
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(18);
    doc.text("Sales Overview Report", 20, 20);
    doc.setFontSize(12);
    salesData[selectedTab].forEach((item, index) => {
      doc.text(`${item.label}: ${item.value} ${item.change || ""}`, 20, 40 + index * 10);
    });
    doc.save("Sales_Overview_Report.pdf");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center"}}>
      <Stack p={2}>
        <Stack direction={'row'}  gap={2}>
        <Chip label="Daily" sx={{px:2,fontWeight:'bolder'}}  onClick={()=>setSelectedTab("daily")} />
        <Chip label="Weekly" sx={{px:2,fontWeight:'bolder'}}  onClick={()=>setSelectedTab("weekly")} />
        <Chip label="Monthly" sx={{px:2,fontWeight:'bolder'}}  onClick={()=>setSelectedTab("monthly")}/>
        </Stack>
      </Stack>
      <Card sx={{ width: "100%", maxWidth: 340, p: 2, borderRadius: 3, boxShadow: 3, mt: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography fontFamily={"font-katibeh"} variant="h6" sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
            <AccessTime sx={{ color: "#E07A5F" }} /> Sales Overview
          </Typography>
          <IconButton onClick={generatePDF} sx={{ color: "#E07A5F" }}>
            <FileDownload />
          </IconButton>
        </Box>
        <CardContent>
          {salesData[selectedTab].map((item, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1,
                borderBottom: index !== 5 ? "1px solid #eee" : "none",
              }}
            >
              <Typography fontFamily={"font-katibeh"} sx={{ fontWeight: item.isBold ? "bold" : "normal" }}>{item.label}</Typography>
              <Typography fontFamily={"font-katibeh"} sx={{ fontWeight: "bold" }}>
                {item.value} {item.change && <span style={{ color: item.color, fontSize: "0.85rem" }}> {item.change}</span>}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;
