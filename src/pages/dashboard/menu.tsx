import React, { useEffect, useState } from "react";
import { 
  Typography, 
  IconButton, 
  Box, 
  Switch, 
  Button, 
  Stack, 
  Avatar,
  Chip,
  Badge,
  CircularProgress,
  TextField,
  InputAdornment,
  Drawer,
  useTheme,
  useMediaQuery,
  Divider,
  Grid,
  Paper,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AppBar,
  Toolbar,
  Collapse
} from "@mui/material";
import { 
  Add, 
  FilterList, 
  Search, 
  RestaurantMenu, 
  SearchOff,
  CurrencyRupee,
  ClearAll,
  Delete,
  Edit,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Sort as SortIcon,
  TrendingUp,
  Inventory,
  Restaurant,
  ExpandMore,
  ExpandLess,
  FileUpload,
  FileDownload
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import axiosInstance from "../../interceptor/axiosInstance";
import { RootState } from "../../store/store";
import AddDish from "../../components/ui/AddDish";
import EditDish from "./EditDish";
import XlFormat from "../../components/XlFormat";
import ImportBulk from "../../components/ImportBulk";

interface MenuItem {
  item_id: number;
  item_name: string;
  base_price: number;
  status: number;
  outlet_id: number;
  description: string;
  vendor_price: number;
  opening_time: string;
  closing_time: string;
  is_vegeterian: number;
  image: string;
  cuisine: string;
  food_type: string;
  bulk_only: number;
  customisations: any;
  customisation_defaultBasePrice: any;
  tax: number;
  station_code: string;
}

interface MenuProps {
  restdata: any;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'price' | 'status' | 'cuisine';

const Menu: React.FC<MenuProps> = ({ restdata }) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [cuisineTypes, setCuisineTypes] = useState<string[]>([]);
  const [foodTypes, setFoodTypes] = useState<string[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string>("all");
  const [selectedFoodType, setSelectedFoodType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusChanging, setStatusChanging] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  
  // Edit functionality state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [isImportDialogOpen, setisImportDialogOpen] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const outletid = useSelector((state: RootState) => state.outlet_id);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/dishes/?outlet_id=${outletid?.outlet_id}`);
      
      const filteredAndSortedItems = res?.data?.data?.rows
        .filter(item => item.change_type !== 3)
        .sort((a, b) => {
          if (a.status === b.status) return 0;
          return a.status ? -1 : 1;
        });
      
      setItems(filteredAndSortedItems);
      setFilteredItems(filteredAndSortedItems);
      
      const uniqueCuisines = [...new Set(filteredAndSortedItems.map(item => item.cuisine))];
      const uniqueFoodTypes = [...new Set(filteredAndSortedItems.map(item => item.food_type))];
      
      setCuisineTypes(uniqueCuisines);
      setFoodTypes(uniqueFoodTypes);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!createModalVisible && !editModalVisible) {
      fetchData();
    }
  }, [createModalVisible, editModalVisible]);
  
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = items;
    
    // Apply filters
    if (selectedFoodType !== "all") {
      filtered = filtered.filter(item => item.food_type === selectedFoodType);
    }
    
    if (selectedCuisine !== "all") {
      filtered = filtered.filter(item => item.cuisine === selectedCuisine);
    }
    
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.item_name.toLowerCase().includes(query) || 
        (item.description && item.description.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.item_name.localeCompare(b.item_name);
        case 'price':
          return a.vendor_price - b.vendor_price;
        case 'status':
          return b.status - a.status;
        case 'cuisine':
          return a.cuisine.localeCompare(b.cuisine);
        default:
          return 0;
      }
    });
    
    setFilteredItems(filtered);
  }, [selectedFoodType, selectedCuisine, items, searchQuery, sortBy]);

  const handleStatus = async (itemId: number, status: number) => {
    try {
      setStatusChanging(itemId);
      await axiosInstance.put(`/dish/${itemId}`, { 
        status: Number(status),
        change_type: 3, 
        updated_at: new Date().toISOString() 
      });
      await fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setStatusChanging(null);
    }
  };
  
  const handleEditClick = (item: MenuItem) => {
    setItemToEdit(item);
    setEditModalVisible(true);
  };
  
  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setItemToEdit(null);
  };
  
  const handleEditSuccess = () => {
    fetchData();
  };
  
  const handleDeleteClick = (itemId: number) => {
    setItemToDelete(itemId);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };
  
  const handleConfirmDelete = async () => {
    if (itemToDelete === null) return;
    
    try {
      setDeleteLoading(true);
      await axiosInstance.put(`/dish/${itemToDelete}`, { change_type: 3 });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      await fetchData();
    } catch (error) {
      console.error("Error deleting menu item:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: ViewMode | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };
  
  const formatCuisineName = (cuisine: string) => {
    return cuisine.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };
  
  const formatFoodType = (foodType: string) => {
    return foodType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const activeFiltersCount = 
    (selectedFoodType !== "all" ? 1 : 0) + 
    (selectedCuisine !== "all" ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0);

  const resetFilters = () => {
    setSelectedFoodType("all");
    setSelectedCuisine("all");
    setSearchQuery("");
    setDrawerOpen(false);
  };

  // Calculate stats
  const activeItems = items.filter(item => item.status === 1).length;
  const inactiveItems = items.filter(item => item.status === 0).length;
  const avgPrice = items.length > 0 ? items.reduce((acc, item) => acc + item.vendor_price, 0) / items.length : 0;

  const MenuItemCard = ({ item }: { item: MenuItem }) => (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s ease',
        opacity: item.status ? 1 : 0.7,
        border: '1px solid',
        borderColor: item.status ? 'transparent' : '#e0e0e0',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          borderColor: '#E87C4E'
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={item?.image || "https://via.placeholder.com/300x200?text=No+Image"}
          alt={item.item_name}
          sx={{ objectFit: 'fill' }}
        />
        
        {/* Veg/Non-veg indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            borderRadius: '4px',
            px: 1,
            py: 0.5,
            bgcolor: item?.is_vegeterian === 1 ? '#0A8A0A' : '#D6292C',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 600
          }}
        >
          {item?.is_vegeterian === 1 ? 'VEG' : 'NON-VEG'}
        </Box>

        {/* Status indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            borderRadius: '50%',
            width: 12,
            height: 12,
            bgcolor: item.status ? '#4caf50' : '#f44336'
          }}
        />
      </Box>
      
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.2 }}>
          {item.item_name}
        </Typography>
        
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            label={formatFoodType(item.food_type)}
            size="small"
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontSize: '0.7rem'
            }}
          />
          <Chip
            label={formatCuisineName(item.cuisine)}
            size="small"
            sx={{ 
              bgcolor: alpha(theme.palette.secondary.main, 0.1),
              color: theme.palette.secondary.main,
              fontSize: '0.7rem'
            }}
          />
        </Stack>
        
        {item?.description && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mb: 2, lineHeight: 1.4 }}
          >
            {item.description.length > 100 ? `${item.description.substring(0, 100)}...` : item.description}
          </Typography>
        )}
        
        <Typography 
          variant="h6" 
          color="#3B7F4B" 
          sx={{ 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <CurrencyRupee fontSize="small" />
          {item?.vendor_price}
        </Typography>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1}>
          <IconButton 
            size="small"
            color="primary"
            onClick={() => handleEditClick(item)}
            sx={{
              bgcolor: alpha('#2196f3', 0.1),
              '&:hover': { bgcolor: alpha('#2196f3', 0.2) }
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
          
          <IconButton 
            size="small"
            color="error"
            onClick={() => handleDeleteClick(item.item_id)}
            sx={{
              bgcolor: alpha('#f44336', 0.1),
              '&:hover': { bgcolor: alpha('#f44336', 0.2) }
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
        
        {statusChanging === item.item_id ? (
          <CircularProgress size={24} />
        ) : (
          <Switch
            checked={Boolean(item?.status)}
            onChange={() => handleStatus(item.item_id, item.status === 1 ? 0 : 1)}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#3B7F4B',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#3B7F4B',
              },
            }}
          />
        )}
      </CardActions>
    </Card>
  );

  const MenuItemListItem = ({ item }: { item: MenuItem }) => (
    <Paper
      sx={{
        p: 3,
        transition: 'all 0.2s ease',
        opacity: item.status ? 1 : 0.7,
        border: '1px solid #e0e0e0',
        '&:hover': {
          boxShadow: 3,
          borderColor: '#E87C4E'
        }
      }}
    >
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} sm={2}>
          <Box
            sx={{
              position: 'relative',
              width: 80,
              height: 80,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Box
              component="img"
              src={item?.image || "https://via.placeholder.com/80"}
              alt={item.item_name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                borderRadius: '50%',
                width: 16,
                height: 16,
                bgcolor: item?.is_vegeterian === 1 ? '#0A8A0A' : '#D6292C',
                border: '2px solid white'
              }}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {item.item_name}
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Chip
                label={formatFoodType(item.food_type)}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                label={formatCuisineName(item.cuisine)}
                size="small"
                color="secondary"
                variant="outlined"
              />
            </Stack>
            
            {item?.description && (
              <Typography variant="body2" color="text.secondary">
                {item.description.length > 150 ? `${item.description.substring(0, 150)}...` : item.description}
              </Typography>
            )}
          </Stack>
        </Grid>
        
        <Grid item xs={12} sm={2}>
          <Typography 
            variant="h6" 
            color="#3B7F4B" 
            sx={{ 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CurrencyRupee fontSize="small" />
            {item?.vendor_price}
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={2}>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <IconButton 
              size="small"
              color="primary"
              onClick={() => handleEditClick(item)}
            >
              <Edit fontSize="small" />
            </IconButton>
            
            <IconButton 
              size="small"
              color="error"
              onClick={() => handleDeleteClick(item.item_id)}
            >
              <Delete fontSize="small" />
            </IconButton>
            
            {statusChanging === item.item_id ? (
              <CircularProgress size={24} />
            ) : (
              <Switch
                checked={Boolean(item?.status)}
                onChange={() => handleStatus(item.item_id, item.status === 1 ? 0 : 1)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#3B7F4B',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#3B7F4B',
                  },
                }}
              />
            )}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderFilterDrawer = () => (
    <Drawer
      anchor="bottom"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          px: 2,
          pb: 3,
          pt: 2,
          maxHeight: "80vh"
        }
      }}
    >
      <Box sx={{ width: "100%" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={600}>
            Filter Menu Items
          </Typography>
          <Button 
            startIcon={<ClearAll />} 
            color="inherit" 
            onClick={resetFilters}
            disabled={activeFiltersCount === 0}
          >
            Clear All
          </Button>
        </Stack>

        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="subtitle2" fontWeight={600} color="text.secondary" mb={1}>
          Food Type
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
          <Chip 
            label="All" 
            variant={selectedFoodType === "all" ? "filled" : "outlined"} 
            color={selectedFoodType === "all" ? "primary" : "default"}
            onClick={() => setSelectedFoodType("all")}
          />
          {foodTypes?.map((type) => (
            <Chip 
              key={type} 
              label={formatFoodType(type)}
              variant={selectedFoodType === type ? "filled" : "outlined"}
              color={selectedFoodType === type ? "primary" : "default"}
              onClick={() => setSelectedFoodType(type)}
            />
          ))}
        </Box>
        
        <Typography variant="subtitle2" fontWeight={600} color="text.secondary" mb={1}>
          Cuisine
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
          <Chip 
            label="All" 
            variant={selectedCuisine === "all" ? "filled" : "outlined"} 
            color={selectedCuisine === "all" ? "primary" : "default"}
            onClick={() => setSelectedCuisine("all")}
          />
          {cuisineTypes?.map((cuisine) => (
            <Chip 
              key={cuisine} 
              label={formatCuisineName(cuisine)}
              variant={selectedCuisine === cuisine ? "filled" : "outlined"} 
              color={selectedCuisine === cuisine ? "primary" : "default"}
              onClick={() => setSelectedCuisine(cuisine)}
            />
          ))}
        </Box>
        
        <Button 
          variant="contained" 
          fullWidth 
          sx={{ 
            mt: 2, 
            mb: 2, 
            height: 48,
            borderRadius: 2,
            bgcolor: theme.palette.primary.main,
            boxShadow: "none",
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.9),
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
            }
          }}
          onClick={() => setDrawerOpen(false)}
        >
          Apply Filters ({activeFiltersCount})
        </Button>
      </Box>
    </Drawer>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Menu Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your restaurant's menu items and pricing
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
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
          
         
          <XlFormat data={items} isLoading={loading}/>
          
          <Button
            variant="outlined"
            startIcon={<FileUpload />}
            onClick={() => setisImportDialogOpen(true)}
          >
            Import
          </Button>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateModalVisible(true)}
            sx={{
              bgcolor: "#EB8041",
              "&:hover": { bgcolor: "#D26E2F" }
            }}
          >
            Add Item
          </Button>
        </Stack>
      </Stack>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Restaurant sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
              {items.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Items
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
              {activeItems}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Inventory sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
              {inactiveItems}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Inactive
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <CurrencyRupee sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h4" color="info.main" sx={{ fontWeight: 600 }}>
              ₹{avgPrice.toFixed(0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg Price
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Search and Filter Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={() => setSearchQuery("")} size="small">
                      <SearchOff fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ flex: 1 }}
            />
            
            {!isMobile && (
              <>
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel size="small">Food Type</InputLabel>
                  <Select
                    value={selectedFoodType}
                    onChange={(e) => setSelectedFoodType(e.target.value)}
                    label="Food Type"
                    size="small"
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    {foodTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {formatFoodType(type)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel size="small">Cuisine</InputLabel>
                  <Select
                    value={selectedCuisine}
                    onChange={(e) => setSelectedCuisine(e.target.value)}
                    label="Cuisine"
                    size="small"
                  >
                    <MenuItem value="all">All Cuisines</MenuItem>
                    {cuisineTypes.map((cuisine) => (
                      <MenuItem key={cuisine} value={cuisine}>
                        {formatCuisineName(cuisine)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel size="small">Sort by</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    label="Sort by"
                    size="small"
                  >
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="price">Price</MenuItem>
                    <MenuItem value="status">Status</MenuItem>
                    <MenuItem value="cuisine">Cuisine</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            
            {isMobile && (
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setDrawerOpen(true)}
                sx={{ alignSelf: 'stretch' }}
              >
                Filters
                {activeFiltersCount > 0 && (
                  <Badge
                    badgeContent={activeFiltersCount}
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
              </Button>
            )}
          </Stack>
          
          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <Box>
              <Button
                size="small"
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                endIcon={filtersExpanded ? <ExpandLess /> : <ExpandMore />}
                sx={{ mb: 1 }}
              >
                Active Filters ({activeFiltersCount})
              </Button>
              
              <Collapse in={filtersExpanded}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {selectedFoodType !== "all" && (
                    <Chip 
                      size="small"
                      label={`Type: ${formatFoodType(selectedFoodType)}`}
                      onDelete={() => setSelectedFoodType("all")}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  
                  {selectedCuisine !== "all" && (
                    <Chip 
                      size="small"
                      label={`Cuisine: ${formatCuisineName(selectedCuisine)}`}
                      onDelete={() => setSelectedCuisine("all")}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  
                  {searchQuery.trim() !== "" && (
                    <Chip 
                      size="small"
                      label={`Search: ${searchQuery}`}
                      onDelete={() => setSearchQuery("")}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  
                  <Chip 
                    size="small"
                    label="Clear All"
                    onClick={resetFilters}
                    color="default"
                  />
                </Stack>
              </Collapse>
            </Box>
          )}
          
          <Typography variant="body2" color="text.secondary">
            Showing {filteredItems.length} of {items.length} items
          </Typography>
        </Stack>
      </Paper>
      
      {/* Menu Items Display */}
      <Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "40vh" }}>
            <CircularProgress size={40} color="primary" />
          </Box>
        ) : filteredItems.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <Grid container spacing={3}>
                {filteredItems.map((item) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={item.item_id}>
                    <MenuItemCard item={item} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Stack spacing={2}>
                {filteredItems.map((item) => (
                  <MenuItemListItem key={item.item_id} item={item} />
                ))}
              </Stack>
            )}
          </>
        ) : (
          <Paper sx={{ 
            textAlign: "center", 
            py: 8, 
            px: 2
          }}>
            <RestaurantMenu sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No menu items found
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              {activeFiltersCount > 0 
                ? "Try adjusting your filters or search query"
                : "Add your first menu item to get started"}
            </Typography>
            
            {activeFiltersCount > 0 ? (
              <Button 
                variant="outlined" 
                onClick={resetFilters}
                startIcon={<ClearAll />}
                size="large"
              >
                Clear Filters
              </Button>
            ) : (
              <Button 
                variant="contained" 
                onClick={() => setCreateModalVisible(true)}
                startIcon={<Add />}
                size="large"
                sx={{
                  bgcolor: "#EB8041",
                  "&:hover": { bgcolor: "#D26E2F" }
                }}
              >
                Add Menu Item
              </Button>
            )}
          </Paper>
        )}
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this menu item? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDeleteDialog} 
            color="primary"
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={16} color="inherit" /> : <Delete />}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Dish Modal */}
      <AddDish
        open={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        outlet_id={Number(outletid?.outlet_id)}
      />
      
      {/* Edit Dish Modal */}
      <EditDish
        open={editModalVisible}
        onClose={handleCloseEditModal}
        item={itemToEdit}
        onSuccess={handleEditSuccess}
      />
      
      {/* Import Dialog */}
      {isImportDialogOpen && (
        <ImportBulk
          open={isImportDialogOpen}
          onOpenChange={setisImportDialogOpen}
          outletId={outletid?.outlet_id}
        />
      )}
      
      {/* Filter Drawer for Mobile */}
      {renderFilterDrawer()}
    </Container>
  );
};

export default Menu;