import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { format } from "date-fns";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axiosInstance from '../interceptor/axiosInstance';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const Closer: React.FC = () => {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [closureReason, setClosureReason] = useState("");
  const [outletData, setOutletData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingOutlet, setFetchingOutlet] = useState(true);
  const outletid = useSelector((state: RootState) => state.outlet_id);
  // Fetch outlet data from API
  useEffect(() => {
    const fetchOutletData = async () => {
      try {
        // Get outlet_id from localStorage
      

        // Fetch outlet data from API
        const response = await axiosInstance.get(`/restraunts?outlet_id=${outletid?.outlet_id}`);
          setFetchingOutlet(false);
        setOutletData(response.data.data.rows[0]);
      } catch (error) {
        console.error("Error fetching outlet data:", error);
        toast.error("Failed to fetch outlet data!", {
          style: {
            borderRadius: '10px',
            background: 'black',
            color: 'red',
          },
          duration: 4000,
        });
      } finally {
        setFetchingOutlet(false);
      }
    };

    fetchOutletData();
  }, []);

  // Get user data from localStorage
 

  const handleActivate = async () => {
    if (!outletData?.outlet_id) {
      toast.error("Outlet data not found!", {
        style: {
          borderRadius: '10px',
          background: 'black',
          color: 'red',
        },
        duration: 4000,
      });
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.put(`/restraunt/${outletData.outlet_id}`, {
        closing_period: null,
        closure_reason: null,
        updated_by: "vendor",
        status:3,
        updated_at: format(new Date(), 'yyyy-MM-dd HH:mm')
      });

      toast(`Outlet Updated Successfully! `, {
        style: {
          borderRadius: '10px',
          background: 'wheat',
          color: 'red',
        },
        duration: 4000,
      });

      // Update local state to reflect the change
      setOutletData({...outletData, closing_period: null, closure_reason: null});
      
    } catch (error) {
      console.error("Error activating outlet:", error);
      toast.error("Failed to activate outlet!", {
        style: {
          borderRadius: '10px',
          background: 'black',
          color: 'red',
        },
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!fromDate || !toDate || !closureReason) {
      toast.error("Please fill all fields", {
        style: {
          borderRadius: '10px',
          background: 'black',
          color: 'red',
        },
        duration: 4000,
      });
      return;
    }

    if (!outletData?.outlet_id) {
      toast.error("Outlet data not found!", {
        style: {
          borderRadius: '10px',
          background: 'black',
          color: 'red',
        },
        duration: 4000,
      });
      return;
    }

    const closedFrom = format(fromDate, 'yyyy-MM-dd') + " 00:00";
    const closedTo = format(toDate, 'yyyy-MM-dd') + " 23:59";

    const payload = {
      closing_period: JSON.stringify([
        {
          closedFrom,
          closedTo
        }
      ]),
      closure_reason: closureReason,
      status:3
    };

    setLoading(true);

    try {
      await axiosInstance.put(`/restraunt/${outletData.outlet_id}`, payload);
      
      toast(`Outlet Updated Successfully! `, {
        style: {
          borderRadius: '10px',
          background: 'wheat',
          color: 'red',
        },
        duration: 4000,
      });

      // Update local state to reflect the change
      setOutletData({...outletData, closing_period: payload.closing_period, closure_reason: closureReason});

      // Reset form
      setFromDate(null);
      setToDate(null);
      setClosureReason("");
    } catch (error) {
      console.error("Error creating closure:", error);
      toast.error(`Failed to create closure! ${error instanceof Error ? error.message : 'Unknown error'}`, {
        style: {
          borderRadius: '10px',
          background: 'black',
          color: 'red',
        },
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingOutlet) {
    return (
      <Card sx={{ maxWidth: 800, width: '100%' }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (!outletData) {
    return (
      <Card sx={{ maxWidth: 800, width: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography color="error" textAlign="center">
            Failed to load outlet data
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 800, width: '100%' }}>
      <CardHeader
        title={
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
            Manage Outlet Closure
          </Typography>
        }
      />
      <CardContent sx={{ p: 3 }}>
        {
          outletData?.closing_period?.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: 'bold' }}>
                  This outlet is currently closed
                </Typography>
                {outletData.closure_reason && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Reason: {outletData.closure_reason}
                  </Typography>
                )}
              </Alert>
              <Button 
                variant="contained"
                color="success"
                onClick={handleActivate} 
                disabled={loading}
                fullWidth
                sx={{ py: 1.5 }}
              >
                {loading ? "Activating..." : "Activate Outlet"}
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography sx={{ mb: 1, color: '#1976d2', fontWeight: 500 }}>
                  Select Closure Date Range
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="From Date"
                        value={fromDate}
                        onChange={(newValue) => setFromDate(newValue)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="To Date"
                        value={toDate}
                        onChange={(newValue) => setToDate(newValue)}
                        minDate={fromDate || undefined}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </LocalizationProvider>
              </Box>

              <Box>
                <Typography sx={{ mb: 1, color: '#1976d2', fontWeight: 500 }}>
                  Reason for Closure
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter reason for closure"
                  value={closureReason}
                  onChange={(e) => setClosureReason(e.target.value)}
                  variant="outlined"
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFromDate(null);
                    setToDate(null);
                    setClosureReason("");
                  }}
                  fullWidth
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? "Creating..." : "Create Closure"}
                </Button>
              </Box>
            </Box>
          )
        }
      </CardContent>
    </Card>
  );
};

export default Closer;