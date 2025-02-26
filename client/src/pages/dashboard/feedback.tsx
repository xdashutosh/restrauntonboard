import React, { useState } from "react";
import { Card, CardContent, Typography, Box, Tabs, Tab, MenuItem, Select, Divider, Stack } from "@mui/material";
import { Star } from "@mui/icons-material";

const feedbackData = {
  daily: [
    { orderId: "#1234567890", total: 278, items: "1 x Dal Makhni, 4 x Tandoori Roti", rating: 5.0, delivery: 4.5, comment: "The food was very delicious and the delivery time was also quick. I’ll definitely try other dishes next time. Thanks!" },
    { orderId: "#1234567891", total: 278, items: "1 x Aloo Gobhi, 4 x Tandoori Roti", rating: 4.0, delivery: 3.5, comment: "The food was very delicious and the delivery time was also quick. I’ll definitely try other dishes next time. Thanks!" }
  ],
  weekly: [
    { orderId: "#1234567892", total: 350, items: "2 x Butter Naan, 1 x Paneer Butter Masala", rating: 4.8, delivery: 4.0, comment: "Great taste and fast service!" }
  ],
  monthly: [
    { orderId: "#1234567893", total: 420, items: "1 x Shahi Paneer, 3 x Tandoori Roti", rating: 4.2, delivery: 4.1, comment: "Good food, but delivery was a bit late." }
  ]
};

const Feedback = () => {
  const [selectedTab, setSelectedTab] = useState("monthly");
  const [dateRange, setDateRange] = useState("All Time");
console.log(selectedTab,dateRange)
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 2, width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 400, mb: 2 }}>
    
        <Select   sx={{bgcolor:'#EAE9ED',border:'none',color:'#82818A',borderRadius:3,fontFamily:"font-katibeh"}}  value={selectedTab}  onChange={(e) => setSelectedTab(e.target.value)} size="small">
          <MenuItem  value="daily" >Daily</MenuItem>
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="monthly">Monthly</MenuItem>
        </Select>
        
        <Select value={dateRange} sx={{bgcolor:'#EAE9ED',border:'none',color:'#82818A',borderRadius:3}}  onChange={(e) => setDateRange(e.target.value)} size="small">
          <MenuItem value="All Time">All Time</MenuItem>
          <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
          <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
        </Select>
      </Box>
      {feedbackData[selectedTab]?.map((feedback, index) => (
        <Card key={index} sx={{ width: "100%", mb: 2, borderRadius: 3, boxShadow: 'none' }} variant="outlined">
          <CardContent sx={{textAlign:'center'}}>
            <Box sx={{ display: "flex", justifyContent: "space-between",alignItems:'center',py:1 }}>
              <Typography fontFamily={"font-katibeh"} variant="body1" sx={{color: "#666"}}>Order ID: {feedback.orderId}</Typography>
              <Typography fontFamily={"font-katibeh"} fontWeight="bold">Bill Total: ₹{feedback.total}</Typography>
            </Box>
            <Divider/>

            <Typography fontFamily={"font-katibeh"} sx={{ my: 2, color: "#666" }}>Items: <b>{feedback.items}</b></Typography>

            <Box sx={{ display: "flex", alignItems: "center", mt: 1,justifyContent:'space-between' }}>

            <Stack direction={'row'} alignItems={'center'} gap={1}>
              <Typography fontFamily={"font-katibeh"} sx={{ color: "#666" }}>Rating:</Typography>
              <Box sx={{p:"4px",bgcolor:'#FFA500',display:'flex',borderRadius:2}}>
              <Star  sx={{ color: "white" }} />
              <Typography fontFamily={"font-katibeh"} color="white" >{feedback.rating}</Typography>
              </Box>
            </Stack>

              <Stack direction={'row'} alignItems={'center'} gap={1}>
              <Typography sx={{ color: "#666", ml: 2 }} fontFamily={"font-katibeh"}>Delivery Boy:</Typography>
              <Box sx={{p:"4px",bgcolor:'#FFA500',display:'flex',borderRadius:2}}>
              <Star  sx={{ color: "white" }} />
              <Typography fontFamily={"font-katibeh"} color="white" >{feedback.delivery}</Typography>
              </Box>
              </Stack>
            </Box>
            
            <Typography fontFamily={"font-katibeh"} sx={{ mt: 1, fontStyle: "italic", color: "#444" }}>
              "{feedback.comment}"
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default Feedback;