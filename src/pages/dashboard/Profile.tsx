import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Grid, Stack, Divider, IconButton } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer} from "recharts";
import { Star, KeyboardArrowDown } from "@mui/icons-material";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";

import { CoinsIcon, DownloadIcon } from "lucide-react";
import axiosInstance from "../../interceptor/axiosInstance";

// Define revenue data with 5-day intervals
const revenueData = [
  { name: "1-5 Feb", value: 18000 },
  { name: "5-10 Feb", value: 12000 },
  { name: "10-15 Feb", value: 6000 },
  { name: "15-20 Feb", value: 4000 },
  { name: "20-25 Feb", value: 15000 },
  { name: "25-30 Feb", value: 20000 },
];

interface props {
  restdata:any;
}

const Profile: React.FC<props> = ({restdata}) => {
 const [station,setstation]=useState(null);

  useEffect(()=>{
    const getdata = async()=>{
      try {
        const res = await axiosInstance.get(`/stations/?station_id=${restdata?.station_id}`);
        setstation(res?.data?.data?.rows[0]?.station_name)

      } catch (error) {
        
      }
    }
    getdata();
  },[restdata])

  console.log(restdata)
  return (
    <Box sx={{ width: "100%" }}>
      {/* Restaurant Header */}
      <Card
        sx={{
          overflow: "hidden",
          borderBottomLeftRadius: "30px",
          borderBottomRightRadius: "30px",
          background: `linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.3), transparent), 
                 url(${restdata?.media_url})`,
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
            {restdata?.name}
          </Typography>
          <Stack direction={"row"} width={"100%"} justifyContent={"space-between"} alignItems={"center"}>
            <Typography fontFamily={"font-katibeh"} variant="body2" color="white">
              Station: <strong>{station}</strong>
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



    <Box
      sx={{
        // For mobile-first design, often just padding around the container
        p: 2,
        maxWidth: 400, // limit max-width to better visualize mobile layout
        margin: "auto",
      }}
    >
      {/* Top Contact Info */}
      <Card
        sx={{
          mb: 2,
          borderRadius: 2,
        }}
        variant="outlined"
      >
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="body2" fontWeight={600}>
              Mobile Number
            </Typography>
            <Typography variant="body1">{restdata?.phone}</Typography>

            <Divider sx={{ my: 1 }} />

            <Typography variant="body2" fontWeight={600}>
              Email Address
            </Typography>
            <Typography variant="body1">{restdata?.email}</Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Bank Account Details */}
      <Card
        sx={{
          mb: 2,
          borderRadius: 2,
        }}
        variant="outlined"
      >
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Bank Account Details
          </Typography>

          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" fontWeight={600}>
                Bank Name
              </Typography>
              <Typography variant="body2">{restdata?.bank_name}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" fontWeight={600}>
                Account Number
              </Typography>
              <Typography variant="body2">{restdata?.acn}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" fontWeight={600}>
                IFSC Code
              </Typography>
              <Typography variant="body2">{restdata?.ifsc}</Typography>
            </Stack>

            {/* GST Number row with Expiry + Download */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  GST Number
                </Typography>
                <Typography variant="body2">{restdata?.gst}</Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                {/* <Typography variant="body2" color="text.secondary">
                  Expiry Date: 10/10/2029
                </Typography> */}
                <IconButton size="small">
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>

            {/* FSSAI Number row with Expiry + Download */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  FSSAI Number
                </Typography>
                <Typography variant="body2">{restdata?.fssai}</Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Expiry Date: {restdata?.fssai_exp}
                </Typography>
                <IconButton size="small">
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Owner ID Details */}
      <Card
        sx={{
          mb: 2,
          borderRadius: 2,
        }}
        variant="outlined"
      >
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Owner ID
          </Typography>

          <Stack spacing={2}>
            {/* Aadhaar Card */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" fontWeight={600}>
                Aadhaar Card
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Expiry Date: 10/10/2029
                </Typography>
                <IconButton size="small">
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>

            {/* PAN Card */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" fontWeight={600}>
                PAN Card
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Expiry Date: 10/10/2029
                </Typography>
                <IconButton size="small">
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>

    </Box>
  );
};

export default Profile;
