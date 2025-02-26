import React from "react";
import { Box, Card, CardContent, Typography, Grid, Stack, Divider } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer} from "recharts";
import { Star, KeyboardArrowDown } from "@mui/icons-material";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { CoinsIcon } from "lucide-react";

// Define revenue data with 5-day intervals
const revenueData = [
  { name: "1-5 Feb", value: 18000 },
  { name: "5-10 Feb", value: 12000 },
  { name: "10-15 Feb", value: 6000 },
  { name: "15-20 Feb", value: 4000 },
  { name: "20-25 Feb", value: 15000 },
  { name: "25-30 Feb", value: 20000 },
];

const Home = () => {
  const restaurant = useSelector((state: RootState) => state.restaurant.data);
  console.log(restaurant);

  return (
    <Box sx={{ width: "100%" }}>
      {/* Restaurant Header */}
      <Card
        sx={{
          overflow: "hidden",
          borderBottomLeftRadius: "30px",
          borderBottomRightRadius: "30px",
          background: `linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.3), transparent), 
                 url(https://rishikeshcamps.in/wp-content/uploads/2023/05/restaarant.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "20vh",
          display: "flex",
          alignItems: "end",
          width: "100%",
        }}
      >

        <CardContent sx={{ position: "relative", color: "white", width: "100%" }}>
          <Typography fontFamily={"font-katibeh"} variant="h6" fontWeight={600}>
            Zaika Restaurant
          </Typography>
          <Stack direction={"row"} width={"100%"} justifyContent={"space-between"} alignItems={"center"}>
            <Typography fontFamily={"font-katibeh"} variant="body2" color="white">
              Station: <strong>New Delhi</strong>
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#EB8041", px: 1, borderRadius: 2 }}>
              <Star sx={{ color: "white", fontSize: 15 }} />
              <Typography fontFamily={"font-katibeh"} variant="body2" fontWeight={600} sx={{ ml: 0.5 }}>
                4.5
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Stack px={2}>
        {/* Revenue and Orders */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <Card sx={{ textAlign: "center", p: 2, borderRadius: 3, bgcolor: "#D6EBD9", boxShadow: "none" }} variant="outlined">
              <Typography fontFamily={"font-katibeh"} fontWeight={400}>
                Today's Revenue
              </Typography>
              <Typography fontFamily={"font-katibeh"} variant="h4" fontWeight={600} color="green">
                ₹2,500
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ textAlign: "center", p: 2, borderRadius: 3, bgcolor: "#FCE7DB", boxShadow: "none" }} variant="outlined">
              <Typography fontFamily={"font-katibeh"} fontWeight={400}>
                No. of Orders
              </Typography>
              <Typography fontFamily={"font-katibeh"} variant="h4" fontWeight={600} color="green">
                90
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Monthly Revenue Chart */}
        <Card sx={{ mt: 2, p: 2, borderRadius: 3 }} variant="outlined">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography fontFamily={"font-katibeh"} fontSize={"larger"} fontWeight={600} sx={{ display: "flex", gap: 1 }}>
              <CoinsIcon color="orange" />
              This Month Revenue
            </Typography>
            <Typography fontFamily={"font-katibeh"} fontWeight={500} color="text.secondary">
              February <KeyboardArrowDown />
            </Typography>
          </Box>
          <Typography fontFamily={"font-katibeh"} variant="h4" fontWeight={600} sx={{ my: 2 }}>
            ₹32,600 <span style={{ color: "green", fontFamily: "font-katibeh" }}>+12%</span>
          </Typography>
          <ResponsiveContainer width="100%" height={150}>
  <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
    <defs>
      <linearGradient id="gradientBrown" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8B4513" />
        <stop offset="100%" stopColor="#F5DEB3" />
      </linearGradient>
    </defs>
    <XAxis 
      dataKey="name" 
      tick={{ fontSize: 12 }} // Smaller font for mobile
      angle={-30}  // Rotates text for better visibility
      textAnchor="end" // Aligns rotated text correctly
      dy={10} // Moves text slightly downward to avoid overlap
    />
    <YAxis hide />
    <Tooltip cursor={{ fill: "transparent" }} />
    <Bar dataKey="value" fill="url(#gradientBrown)" radius={[8, 8, 0, 0]} />
  </BarChart>
</ResponsiveContainer>

        </Card>

        {/* Sales Overview */}
        <Card sx={{ mt: 2, p: 2, borderRadius: 3 }} variant="outlined">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography fontFamily={"font-katibeh"} variant="h6" fontWeight={600} sx={{ display: "flex" }}>
              <BubbleChartIcon />
              Sales Overview
            </Typography>
            <Typography fontFamily={"font-katibeh"} fontWeight={500} color="text.secondary">
              February <KeyboardArrowDown />
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography fontFamily={"font-katibeh"} color="text.secondary">
              Sales from Offers
            </Typography>
            <Typography fontFamily={"font-katibeh"} fontSize={'larger'} fontWeight={600}>
              ₹8,250 <span style={{ color: "green" }}>+12%</span>
            </Typography>
          </Box>
          <Divider />
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography fontFamily={"font-katibeh"} color="text.secondary">
              Number of Orders
            </Typography>
            <Typography fontFamily={"font-katibeh"} fontSize={'larger'}  fontWeight={600}>
              40 <span style={{ color: "green" }}>+40%</span>
            </Typography>
          </Box>
        </Card>
      </Stack>
    </Box>
  );
};

export default Home;
