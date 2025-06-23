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
  useMediaQuery,
  TextField,
  Button,
  CircularProgress
} from "@mui/material";
import { Star, Call, Email, ContentCopy, Edit, Save, Close } from "@mui/icons-material";
import { CoinsIcon, DownloadIcon, MapPinIcon, Clock } from "lucide-react";
import axiosInstance from "../../interceptor/axiosInstance";

// Define the shape of the restaurant data for better type safety
interface RestaurantData {
  outlet_id: number | string; // Unique identifier for the outlet
  name: string;
  station_code: string;
  media_url: string;
  phone: string;
  email: string;
  bank_name: string;
  acn: string; // Account Number
  ifsc: string;
  gst: string;
  fssai: string;
  fssai_valid: string; // Ideally a date string in 'YYYY-MM-DD' format
  // ... any other properties
}

interface Props {
  restdata: RestaurantData;
  onUpdate?: () => void; // Optional callback to refetch data in parent component
}

const Profile: React.FC<Props> = ({ restdata, onUpdate }) => {
  const [station, setStation] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<RestaurantData>(restdata);
  const [isLoading, setIsLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // When the original data from props changes, update the local state
  useEffect(() => {
    setEditedData(restdata);
  }, [restdata]);

  // Fetch station name based on station_code
  useEffect(() => {
    const getStationData = async () => {
      if (restdata?.station_code) {
        try {
          const res = await axiosInstance.get(`/stations/?station_code=${restdata.station_code}`);
          setStation(res?.data?.data?.rows[0]?.station_name);
        } catch (error) {
          console.error("Error fetching station data:", error);
          setStation("Not Found");
        }
      }
    };
    getStationData();
  }, [restdata?.station_code]); // Dependency on the station code

  const copyToClipboard = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      // You could add a toast notification here, e.g., using react-hot-toast
      // toast.success("Copied to clipboard!");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);

    // 1. Find what has changed by comparing the edited data with the original data.
    const payload = Object.keys(editedData).reduce((acc, key) => {
      const typedKey = key as keyof RestaurantData;
      // Check if the key exists in original data and if the value is different.
      if (restdata.hasOwnProperty(typedKey) && editedData[typedKey] !== restdata[typedKey]) {
        acc[typedKey] = editedData[typedKey];
      }
      return acc;
    }, {} as Partial<RestaurantData>);


    // 2. If there are no changes, don't make an API call.
    if (Object.keys(payload).length === 0) {
      console.log("No changes to save.");
      setIsEditing(false);
      setIsLoading(false);
      return;
    }

    // 3. If there are changes, send only the changed data.
    try {
      console.log("Sending updated payload:", payload);
      // Use the outlet ID from the data for the PUT request URL.
      const response = await axiosInstance.put(`/restraunt/${restdata?.outlet_id}`, payload);
      console.log("Update successful:", response.data);
      
      setIsEditing(false);
      if (onUpdate) {
        onUpdate(); // Trigger parent component to refetch data, which will update the 'restdata' prop.
      }
    } catch (error) {
      console.error("Failed to update outlet data:", error);
      // You should show an error notification to the user here.
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancel = () => {
    setEditedData(restdata); // Revert all changes back to the original data.
    setIsEditing(false);
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "#f5f5f5", minHeight: "100vh", position: 'relative' }}>
      
      {/* Edit/Save/Cancel Controls */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        {isEditing ? (
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Close />}
              onClick={handleCancel}
              size="small"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
              onClick={handleSave}
              disabled={isLoading}
              size="small"
            >
              Save
            </Button>
          </Stack>
        ) : (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => setIsEditing(true)}
            sx={{ backgroundColor: 'white', color: 'primary.main', '&:hover': { backgroundColor: '#f0f0f0'}}}
          >
            Edit Profile
          </Button>
        )}
      </Box>

      {/* Restaurant Header */}
      <Card
        elevation={0}
        sx={{
          overflow: "hidden",
          borderRadius: 0,
          borderBottomLeftRadius: "24px",
          borderBottomRightRadius: "24px",
          background: `linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.7)), url(${restdata?.media_url})`,
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
              {isEditing ? (
                <TextField 
                  name="name"
                  value={editedData?.name || ''}
                  onChange={handleChange}
                  variant="standard"
                  sx={{ 
                    '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255, 255, 255, 0.7)' },
                    '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: 'white' },
                    '& .MuiInputBase-input': { color: 'white', fontSize: '1.5rem', fontWeight: 700, textShadow: "0px 1px 3px rgba(0,0,0,0.8)" }
                  }}
                />
              ) : (
                <Typography variant="h5" fontWeight={700} sx={{ textShadow: "0px 1px 3px rgba(0,0,0,0.8)" }}>
                  {editedData?.name}
                </Typography>
              )}
              <Chip
                icon={<Star sx={{ color: "white !important", fontSize: 16 }} />}
                label="4.5" // Static value
                size="small"
                sx={{ bgcolor: "#EB8041", color: "white", fontWeight: 600 }}
              />
            </Stack>
            
            <Stack direction="row" spacing={1} alignItems="center">
              <MapPinIcon size={16} />
              <Typography variant="body2">
                Station: <strong>{station || "Loading..."}</strong>
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={1} alignItems="center">
              <Clock size={16} />
              <Typography variant="body2">
                Open: <strong>9:00 AM - 10:00 PM</strong> {/* Static value */}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ px: 2, maxWidth: "100%", pb: 8 }}>
        {/* Contact Info */}
        <Card elevation={0} sx={{ mb: 2, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom color="text.secondary">
              Contact Information
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={2} alignItems="center" sx={{width: '100%'}}>
                  <Avatar sx={{ bgcolor: "#E3F2FD", color: "#1976D2", width: 40, height: 40 }}><Call fontSize="small" /></Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary">Mobile Number</Typography>
                    {isEditing ? (
                      <TextField name="phone" value={editedData?.phone || ''} onChange={handleChange} variant="standard" fullWidth />
                    ) : (
                      <Typography variant="body1" fontWeight={500}>{editedData?.phone}</Typography>
                    )}
                  </Box>
                </Stack>
                {!isEditing && editedData?.phone && (
                  <IconButton size="small" onClick={() => copyToClipboard(editedData?.phone)}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                )}
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={2} alignItems="center" sx={{width: '100%'}}>
                  <Avatar sx={{ bgcolor: "#E8F5E9", color: "#2E7D32", width: 40, height: 40 }}><Email fontSize="small" /></Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary">Email Address</Typography>
                    {isEditing ? (
                      <TextField name="email" value={editedData?.email || ''} onChange={handleChange} variant="standard" fullWidth />
                    ) : (
                      <Typography variant="body1" fontWeight={500}>{editedData?.email}</Typography>
                    )}
                  </Box>
                </Stack>
                {!isEditing && editedData?.email && (
                  <IconButton size="small" onClick={() => copyToClipboard(editedData?.email)}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Bank Account Details */}
        <Card elevation={0} sx={{ mb: 2, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
              Bank Account Details
            </Typography>
            <Stack spacing={2}>
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">Bank Name</Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  {isEditing ? <TextField name="bank_name" value={editedData?.bank_name || ''} onChange={handleChange} variant="standard" fullWidth /> : <Typography variant="body1" fontWeight={500}>{editedData?.bank_name || "Not Available"}</Typography>}
                  {!isEditing && editedData?.bank_name && <IconButton size="small" onClick={() => copyToClipboard(editedData?.bank_name)}><ContentCopy fontSize="small" /></IconButton>}
                </Stack>
              </Stack>
              <Divider />
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">Account Number</Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  {isEditing ? <TextField name="acn" value={editedData?.acn || ''} onChange={handleChange} variant="standard" fullWidth /> : <Typography variant="body1" fontWeight={500}>{editedData?.acn || "Not Available"}</Typography>}
                  {!isEditing && editedData?.acn && <IconButton size="small" onClick={() => copyToClipboard(editedData?.acn)}><ContentCopy fontSize="small" /></IconButton>}
                </Stack>
              </Stack>
              <Divider />
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">IFSC Code</Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  {isEditing ? <TextField name="ifsc" value={editedData?.ifsc || ''} onChange={handleChange} variant="standard" fullWidth /> : <Typography variant="body1" fontWeight={500}>{editedData?.ifsc || "Not Available"}</Typography>}
                  {!isEditing && editedData?.ifsc && <IconButton size="small" onClick={() => copyToClipboard(editedData?.ifsc)}><ContentCopy fontSize="small" /></IconButton>}
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
        
        {/* Business Documents */}
        <Card elevation={0} sx={{ mb: 2, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
              Business Documents
            </Typography>
            <Stack spacing={2}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: "#F5F5F5" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack spacing={0.5} sx={{flexGrow: 1, mr: 2}}>
                    <Typography variant="body2" color="text.secondary">GST Number</Typography>
                    {isEditing ? <TextField name="gst" value={editedData?.gst || ''} onChange={handleChange} variant="standard" fullWidth /> : <Typography variant="body1" fontWeight={500} sx={{wordBreak: 'break-all'}}>{editedData?.gst || "Not Available"}</Typography>}
                  </Stack>
                  <IconButton sx={{ bgcolor: "#FFFFFF", boxShadow: "0px 2px 4px rgba(0,0,0,0.05)", "&:hover": { bgcolor: "#F5F5F5" }}}>
                    <DownloadIcon size={18} />
                  </IconButton>
                </Stack>
              </Paper>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: "#F5F5F5" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack spacing={0.5} sx={{flexGrow: 1, mr: 2}}>
                    <Typography variant="body2" color="text.secondary">FSSAI Number</Typography>
                    {isEditing ? (
                      <>
                        <TextField name="fssai" value={editedData?.fssai || ''} onChange={handleChange} variant="standard" fullWidth/>
                        <TextField name="fssai_valid" label="Expiry Date" type="date" value={editedData?.fssai_valid || ''} onChange={handleChange} variant="standard" InputLabelProps={{ shrink: true }} sx={{mt: 1}}/>
                      </>
                    ) : (
                      <>
                        <Typography variant="body1" fontWeight={500} sx={{wordBreak: 'break-all'}}>{editedData?.fssai || "Not Available"}</Typography>
                        <Typography variant="caption" color="text.secondary">Expires: {editedData?.fssai_valid || "Not Available"}</Typography>
                      </>
                    )}
                  </Stack>
                  <IconButton sx={{ bgcolor: "#FFFFFF", boxShadow: "0px 2px 4px rgba(0,0,0,0.05)", "&:hover": { bgcolor: "#F5F5F5" }}}>
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