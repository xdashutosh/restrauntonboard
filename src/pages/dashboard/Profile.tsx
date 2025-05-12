import React, { useEffect, useState } from "react";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Stack, 
  Divider, 
  IconButton,
  Avatar,
  Chip,
  Paper,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { Star, Call, Email, ContentCopy } from "@mui/icons-material";
import { CoinsIcon, DownloadIcon, MapPinIcon, Clock } from "lucide-react";
import axiosInstance from "../../interceptor/axiosInstance";

interface Props {
  restdata: any;
}

const Profile: React.FC<Props> = ({ restdata }) => {
  const [station, setStation] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const getdata = async () => {
      try {
        const res = await axiosInstance.get(`/stations/?station_code=${restdata?.station_code}`);
        setStation(res?.data?.data?.rows[0]?.station_name);
      } catch (error) {
        console.error("Error fetching station data:", error);
      }
    };
    getdata();
  }, [restdata]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Restaurant Header */}
      <Card
        elevation={0}
        sx={{
          overflow: "hidden",
          borderRadius: 0,
          borderBottomLeftRadius: "24px",
          borderBottomRightRadius: "24px",
          background: `linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.7)), 
                 url(${restdata?.media_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "25vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          width: "100%",
          mb: 2,
        }}
      >
        <CardContent sx={{ color: "white" }}>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Typography variant="h5" fontWeight={700} sx={{ textShadow: "0px 1px 3px rgba(0,0,0,0.8)" }}>
                {restdata?.name}
              </Typography>
              <Chip
                icon={<Star sx={{ color: "white !important", fontSize: 16 }} />}
                label="4.5"
                size="small"
                sx={{
                  bgcolor: "#EB8041",
                  color: "white",
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: 'white'
                  }
                }}
              />
            </Stack>
            
            <Stack direction="row" spacing={1} alignItems="center">
              <MapPinIcon size={16} />
              <Typography variant="body2">
                Station: <strong>{station}</strong>
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={1} alignItems="center">
              <Clock size={16} />
              <Typography variant="body2">
                Open: <strong>9:00 AM - 10:00 PM</strong>
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ px: 2, maxWidth: "100%", pb: 8 }}>
        {/* Quick Action Cards */}
        <Stack 
          direction="row" 
          spacing={2} 
          sx={{ 
            mb: 3, 
            overflowX: "auto", 
            pb: 1,
            px: 1,
            "&::-webkit-scrollbar": {
              display: "none"
            }
          }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              minWidth: 120,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "#E3F2FD"
            }}
          >
            <Call sx={{ color: "#1976D2", mb: 1 }} />
            <Typography variant="body2" fontWeight={600}>
              Call
            </Typography>
          </Paper>
          
          <Paper 
            elevation={0}
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              minWidth: 120,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "#E8F5E9"
            }}
          >
            <Email sx={{ color: "#2E7D32", mb: 1 }} />
            <Typography variant="body2" fontWeight={600}>
              Email
            </Typography>
          </Paper>
          
          <Paper 
            elevation={0}
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              minWidth: 120,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "#FFF3E0"
            }}
          >
            <CoinsIcon size={24} color="#E65100" style={{ marginBottom: 8 }} />
            <Typography variant="body2" fontWeight={600}>
              Payments
            </Typography>
          </Paper>
        </Stack>

        {/* Contact Info */}
        <Card
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom color="text.secondary">
              Contact Information
            </Typography>
            
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: "#E3F2FD", color: "#1976D2", width: 40, height: 40 }}>
                    <Call fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Mobile Number
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {restdata?.phone}
                    </Typography>
                  </Box>
                </Stack>
                <IconButton size="small" onClick={() => copyToClipboard(restdata?.phone)}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Stack>

              <Divider />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: "#E8F5E9", color: "#2E7D32", width: 40, height: 40 }}>
                    <Email fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {restdata?.email}
                    </Typography>
                  </Box>
                </Stack>
                <IconButton size="small" onClick={() => copyToClipboard(restdata?.email)}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Bank Account Details */}
        <Card
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
              Bank Account Details
            </Typography>

            <Stack spacing={2}>
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  Bank Name
                </Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" fontWeight={500}>
                    {restdata?.bank_name || "Not Available"}
                  </Typography>
                  <IconButton size="small" onClick={() => copyToClipboard(restdata?.bank_name)}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>

              <Divider />

              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  Account Number
                </Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" fontWeight={500}>
                    {restdata?.acn || "Not Available"}
                  </Typography>
                  <IconButton size="small" onClick={() => copyToClipboard(restdata?.acn)}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>

              <Divider />

              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  IFSC Code
                </Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" fontWeight={500}>
                    {restdata?.ifsc || "Not Available"}
                  </Typography>
                  <IconButton size="small" onClick={() => copyToClipboard(restdata?.ifsc)}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
              Business Documents
            </Typography>

            <Stack spacing={2}>
              {/* GST Number Document Card */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  bgcolor: "#F5F5F5",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      GST Number
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {restdata?.gst || "Not Available"}
                    </Typography>
                  </Stack>
                  <IconButton 
                    sx={{ 
                      bgcolor: "#FFFFFF", 
                      boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
                      "&:hover": {
                        bgcolor: "#F5F5F5"
                      }
                    }}
                  >
                    <DownloadIcon size={18} />
                  </IconButton>
                </Stack>
              </Paper>

              {/* FSSAI Number Document Card */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  bgcolor: "#F5F5F5",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      FSSAI Number
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {restdata?.fssai || "Not Available"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Expires: {restdata?.fssai_valid || "Not Available"}
                    </Typography>
                  </Stack>
                  <IconButton 
                    sx={{ 
                      bgcolor: "#FFFFFF", 
                      boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
                      "&:hover": {
                        bgcolor: "#F5F5F5"
                      }
                    }}
                  >
                    <DownloadIcon size={18} />
                  </IconButton>
                </Stack>
              </Paper>
            </Stack>
          </CardContent>
        </Card>

        {/* Owner ID Details */}
        <Card
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
              Owner Identification
            </Typography>

            <Stack spacing={2}>
              {/* Aadhaar Card */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  bgcolor: "#F5F5F5", 
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Aadhaar Card
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Expires: 10/10/2029
                    </Typography>
                  </Stack>
                  <IconButton 
                    sx={{ 
                      bgcolor: "#FFFFFF", 
                      boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
                      "&:hover": {
                        bgcolor: "#F5F5F5"
                      }
                    }}
                  >
                    <DownloadIcon size={18} />
                  </IconButton>
                </Stack>
              </Paper>

              {/* PAN Card */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  bgcolor: "#F5F5F5", 
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      PAN Card
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Expires: 10/10/2029
                    </Typography>
                  </Stack>
                  <IconButton 
                    sx={{ 
                      bgcolor: "#FFFFFF", 
                      boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
                      "&:hover": {
                        bgcolor: "#F5F5F5"
                      }
                    }}
                  >
                    <DownloadIcon size={18} />
                  </IconButton>
                </Stack>
              </Paper>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Profile;