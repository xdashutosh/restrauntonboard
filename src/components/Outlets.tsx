import {
  Box,
  CircularProgress,
  Stack,
  Typography,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import axiosInstance from '../interceptor/axiosInstance';
import { setOutletid } from '../store/outletSlice';
import VerifiedIcon from '@mui/icons-material/Verified';
import PendingIcon from '@mui/icons-material/Pending';

interface Outlet {
  outlet_id: number;
  outlet_name: string;
  station_name?: string;
  station_code?: string;
  logo_image?: string;
  verified?: any;
}

export default function Outlets() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [filteredOutlets, setFilteredOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const navigate = useNavigate();
  const { id } = useParams();
  
  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const response = await axiosInstance.get(`/restraunts`, {
          params: { vendor_id: id }
        });
        
        if (response?.data?.data?.rows) {
          setOutlets(response.data.data.rows);
          setFilteredOutlets(response.data.data.rows);
        }
      } catch (error) {
        console.error('Error fetching outlets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOutlets();
  }, []);

  // Filter outlets based on search query and verification status
  useEffect(() => {
    let filtered = outlets;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(outlet =>
        outlet.outlet_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        outlet.station_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        outlet.station_code?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply verification filter
    if (verificationFilter !== 'all') {
      filtered = filtered.filter(outlet => {
        if (verificationFilter === 'verified') {
          return outlet.verified !== 0;
        } else if (verificationFilter === 'pending') {
          return outlet.verified === 0;
        }
        return true;
      });
    }

    setFilteredOutlets(filtered);
  }, [outlets, searchQuery, verificationFilter]);
  
  const dispatch = useDispatch();

  const handleOutletClick = (outlet: Outlet) => {
    if (outlet.verified === 0) {
      // Don't navigate if not verified
      return;
    }
    dispatch(setOutletid(outlet.outlet_id));
    navigate(`/dashboard/orders`);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    setVerificationFilter(event.target.value);
  };

  if (loading) {
    return (
      <Stack justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack sx={{ p: 3, gap: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Your Outlets</Typography>
      
      {/* Search and Filter Section */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          placeholder="Search outlets, stations..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          size="small"
        />
        
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={verificationFilter}
            onChange={handleFilterChange}
            label="Filter by Status"
            startAdornment={
              <InputAdornment position="start">
                <FilterListIcon sx={{ fontSize: 18, ml: 1 }} />
              </InputAdornment>
            }
          >
            <MenuItem value="all">All Outlets</MenuItem>
            <MenuItem value="verified">Verified Only</MenuItem>
            <MenuItem value="pending">Pending Only</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Results Count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {filteredOutlets.length} of {outlets.length} outlets
        {searchQuery && ` matching "${searchQuery}"`}
      </Typography>
      
      {/* No Results Message */}
      {filteredOutlets.length === 0 && outlets.length > 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            color: 'text.secondary'
          }}
        >
          <Typography variant="h6" gutterBottom>
            No outlets found
          </Typography>
          <Typography variant="body2">
            Try adjusting your search or filter criteria
          </Typography>
        </Box>
      )}

      {/* Outlets List */}
      {filteredOutlets?.map((outlet) => (
        <Box
          key={outlet.outlet_id}
          onClick={() => handleOutletClick(outlet)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderRadius: '20px',
            backgroundColor: outlet.verified === 0 ? '#f5f5f5' : '#fff',
            boxShadow: 1,
            cursor: outlet.verified === 0 ? 'not-allowed' : 'pointer',
            border: '1px solid #e0e0e0',
            opacity: outlet.verified === 0 ? 0.7 : 1,
            transition: 'all 0.2s ease',
            '&:hover': outlet.verified !== 0 ? {
              boxShadow: 3,
              transform: 'translateY(-2px)',
              borderColor: '#FF6B3F'
            } : {}
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={outlet.logo_image}
              sx={{ 
                width: 60, 
                height: 60,
                filter: outlet.verified === 0 ? 'grayscale(1)' : 'none'
              }}
            >
              {outlet.outlet_name?.charAt(0)}
            </Avatar>
            {outlet.verified === 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  boxShadow: 1
                }}
              >
                <PendingIcon sx={{ fontSize: 16, color: '#ff9800' }} />
              </Box>
            )}
          </Box>
          
          <Stack flex={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold',
                  color: outlet.verified === 0 ? 'text.secondary' : 'text.primary'
                }}
              >
                {outlet.outlet_name}
              </Typography>
              {outlet.verified !== 0 && (
                <VerifiedIcon sx={{ fontSize: 20, color: '#4caf50' }} />
              )}
            </Box>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              {outlet.station_name} {outlet.station_code ? `(${outlet.station_code})` : ''}
            </Typography>
            <Chip
              label={outlet.verified === 0 ? "Pending Verification" : "Verified"}
              size="small"
              icon={outlet.verified === 0 ? <PendingIcon /> : <VerifiedIcon />}
              sx={{
                bgcolor: outlet.verified === 0 ? '#fff3e0' : '#e8f5e9',
                color: outlet.verified === 0 ? '#ff9800' : '#4caf50',
                border: outlet.verified === 0 ? '1px solid #ff9800' : '1px solid #4caf50',
                '& .MuiChip-icon': {
                  color: outlet.verified === 0 ? '#ff9800' : '#4caf50'
                }
              }}
            />
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}