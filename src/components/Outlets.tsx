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
  SelectChangeEvent,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Paper,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Verified as VerifiedIcon,
  Pending as PendingIcon,
  Store as StoreIcon,
  LocationOn as LocationIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import axiosInstance from '../interceptor/axiosInstance';
import { setOutletid } from '../store/outletSlice';

interface Outlet {
  outlet_id: number;
  outlet_name: string;
  station_name?: string;
  station_code?: string;
  logo_image?: string;
  verified?: any;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'station' | 'status';

export default function Outlets() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [filteredOutlets, setFilteredOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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

  // Filter and sort outlets
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

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.outlet_name.localeCompare(b.outlet_name);
        case 'station':
          return (a.station_name || '').localeCompare(b.station_name || '');
        case 'status':
          return (b.verified || 0) - (a.verified || 0);
        default:
          return 0;
      }
    });

    setFilteredOutlets(filtered);
  }, [outlets, searchQuery, verificationFilter, sortBy]);
  
  const dispatch = useDispatch();

  const handleOutletClick = (outlet: any) => {
    if (outlet.verified === 0) {
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

  const handleSortChange = (event: SelectChangeEvent<SortOption>) => {
    setSortBy(event.target.value as SortOption);
  };

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: ViewMode | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Calculate stats
  const verifiedCount = outlets.filter(outlet => outlet.verified !== 0).length;
  const pendingCount = outlets.filter(outlet => outlet.verified === 0).length;

  if (loading) {
    return (
      <Stack justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading outlets...
        </Typography>
      </Stack>
    );
  }

  const OutletCard = ({ outlet }: { outlet: Outlet }) => (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s ease',
        border: '1px solid',
        borderColor: outlet.verified === 0 ? '#e0e0e0' : 'transparent',
        opacity: outlet.verified === 0 ? 0.7 : 1,
        '&:hover': outlet.verified !== 0 ? {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          borderColor: '#E87C4E'
        } : {}
      }}
    >
      <CardActionArea
        onClick={() => handleOutletClick(outlet)}
        disabled={outlet.verified === 0}
        sx={{ height: '100%', p: 0 }}
      >
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={outlet.logo_image}
                sx={{ 
                  width: 60, 
                  height: 60,
                  filter: outlet.verified === 0 ? 'grayscale(1)' : 'none',
                  bgcolor: '#E87C4E'
                }}
              >
                <StoreIcon />
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
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    color: outlet.verified === 0 ? 'text.secondary' : 'text.primary'
                  }}
                >
                  {outlet.outlet_name}
                </Typography>
                {outlet.verified !== 0 && (
                  <VerifiedIcon sx={{ fontSize: 20, color: '#4caf50' }} />
                )}
              </Box>
              
              {(outlet.station_name || outlet.station_code) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                  <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {outlet.station_name} {outlet.station_code ? `(${outlet.station_code})` : ''}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          
          <Box sx={{ mt: 'auto' }}>
            <Chip
              label={outlet.verified === 0 ? "Pending Verification" : "Verified & Active"}
              size="small"
              icon={outlet.verified === 0 ? <PendingIcon /> : <VerifiedIcon />}
              sx={{
                bgcolor: outlet.verified === 0 ? '#fff3e0' : '#e8f5e9',
                color: outlet.verified === 0 ? '#ff9800' : '#4caf50',
                border: `1px solid ${outlet.verified === 0 ? '#ff9800' : '#4caf50'}`,
                '& .MuiChip-icon': {
                  color: outlet.verified === 0 ? '#ff9800' : '#4caf50'
                }
              }}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );

  const OutletListItem = ({ outlet }: { outlet: Outlet }) => (
    <Paper
      onClick={() => handleOutletClick(outlet)}
      sx={{
        p: 3,
        cursor: outlet.verified === 0 ? 'not-allowed' : 'pointer',
        opacity: outlet.verified === 0 ? 0.7 : 1,
        transition: 'all 0.2s ease',
        border: '1px solid #e0e0e0',
        '&:hover': outlet.verified !== 0 ? {
          boxShadow: 3,
          borderColor: '#E87C4E'
        } : {}
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={outlet.logo_image}
            sx={{ 
              width: 50, 
              height: 50,
              filter: outlet.verified === 0 ? 'grayscale(1)' : 'none',
              bgcolor: '#E87C4E'
            }}
          >
            <StoreIcon />
          </Avatar>
          {outlet.verified === 0 && (
            <PendingIcon 
              sx={{ 
                position: 'absolute',
                top: -5,
                right: -5,
                fontSize: 20,
                color: '#ff9800',
                backgroundColor: '#fff',
                borderRadius: '50%'
              }} 
            />
          )}
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {outlet.outlet_name}
            </Typography>
            {outlet.verified !== 0 && (
              <VerifiedIcon sx={{ fontSize: 18, color: '#4caf50' }} />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {outlet.station_name} {outlet.station_code ? `(${outlet.station_code})` : ''}
          </Typography>
        </Box>
        
        <Chip
          label={outlet.verified === 0 ? "Pending" : "Verified"}
          size="small"
          color={outlet.verified === 0 ? "warning" : "success"}
          variant="outlined"
        />
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header Section */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Your Outlets
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and monitor all your restaurant locations
          </Typography>
        </Box>
        
        {!isMobile && (
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="grid">
              <ViewModuleIcon sx={{ mr: 1 }} />
              Grid
            </ToggleButton>
            <ToggleButton value="list">
              <ViewListIcon sx={{ mr: 1 }} />
              List
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Stack>

      {/* Stats Overview */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="primary" sx={{ fontWeight: 600 }}>
              {outlets.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Outlets
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="success.main" sx={{ fontWeight: 600 }}>
              {verifiedCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Verified
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="warning.main" sx={{ fontWeight: 600 }}>
              {pendingCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Search and Filter Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={2} 
          alignItems={{ md: 'center' }}
        >
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
            >
              <MenuItem value="all">All Outlets</MenuItem>
              <MenuItem value="verified">Verified Only</MenuItem>
              <MenuItem value="pending">Pending Only</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              onChange={handleSortChange}
              label="Sort by"
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="station">Station</MenuItem>
              <MenuItem value="status">Status</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Results Summary */}
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredOutlets.length} of {outlets.length} outlets
            {searchQuery && ` matching "${searchQuery}"`}
          </Typography>
        </Box>
      </Paper>

      {/* No Results Message */}
      {filteredOutlets.length === 0 && outlets.length > 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <StoreIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No outlets found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Try adjusting your search or filter criteria
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => {
              setSearchQuery('');
              setVerificationFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </Paper>
      )}

      {/* Outlets Display */}
      {filteredOutlets.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {filteredOutlets.map((outlet) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={outlet.outlet_id}>
                  <OutletCard outlet={outlet} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Stack spacing={2}>
              {filteredOutlets.map((outlet) => (
                <OutletListItem key={outlet.outlet_id} outlet={outlet} />
              ))}
            </Stack>
          )}
        </>
      )}
    </Box>
  );
}