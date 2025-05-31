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
  DialogActions
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
  Edit // Added Edit icon
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import axiosInstance from "../../interceptor/axiosInstance";
import { RootState } from "../../store/store";
import AddDish from "../../components/ui/AddDish";
import EditDish from "./EditDish"; // Import the new EditDish component
import XlFormat from "../../components/Xlformat";
import ImportBulk from "../../components/ImportBulk";

// Define the new item interface based on the updated API response
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

const Menu: React.FC<MenuProps> = ({ restdata }) => {
  const [items, setItems] = useState<any>([]);
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
  
  // New state for edit functionality
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);
  
  // Existing state for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const outletid = useSelector((state: RootState) => state.outlet_id);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/dishes/?outlet_id=${outletid?.outlet_id}`);
      
      // Sort by status, in-stock items first
      const sortedItems = res?.data?.data?.rows.sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status ? -1 : 1;
      });
      
      setItems(sortedItems);
      setFilteredItems(sortedItems);
      
      // Extract unique cuisine and food types for filters
      const uniqueCuisines = [...new Set(sortedItems.map(item => item.cuisine))];
      const uniqueFoodTypes = [...new Set(sortedItems.map(item => item.food_type))];
      
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
    
    // Filter by food type
    if (selectedFoodType !== "all") {
      filtered = filtered.filter(item => item.food_type === selectedFoodType);
    }
    
    // Filter by cuisine
    if (selectedCuisine !== "all") {
      filtered = filtered.filter(item => item.cuisine === selectedCuisine);
    }
    
    // Search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.item_name.toLowerCase().includes(query) || 
        (item.description && item.description.toLowerCase().includes(query))
      );
    }
    
    setFilteredItems(filtered);
  }, [selectedFoodType, selectedCuisine, items, searchQuery]);

  const handleStatus = async (itemId: number, status: number) => {
    try {
      setStatusChanging(itemId);
      await axiosInstance.put(`/dish/${itemId}`, { 
        status: Number(status), 
        updated_at: new Date().toISOString() 
      });
      await fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setStatusChanging(null);
    }
  };
  
  // New handler for opening edit modal
  const handleEditClick = (item: MenuItem) => {
    setItemToEdit(item);
    setEditModalVisible(true);
  };
  
  // New handler for closing edit modal
  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setItemToEdit(null);
  };
  
  // Handler for edit success
  const handleEditSuccess = () => {
    fetchData(); // Refresh data after successful edit
  };
  
  const [isImportDialogOpen,setisImportDialogOpen]=useState(false);
  // Existing handler for opening delete confirmation dialog
  const handleDeleteClick = (itemId: number) => {
    setItemToDelete(itemId);
    setDeleteDialogOpen(true);
  };
  
  // Existing handler for closing delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };
  
  // Existing handler for confirming item deletion
  const handleConfirmDelete = async () => {
    if (itemToDelete === null) return;
    
    try {
      setDeleteLoading(true);
      await axiosInstance.delete(`/dish/${itemToDelete}`);
      // Close the dialog
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      // Refresh data
      await fetchData();
    } catch (error) {
      console.error("Error deleting menu item:", error);
    } finally {
      setDeleteLoading(false);
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
  
  const truncateDescription = (description: string) => {
    if (!description) return "";
    return description.length > 20 ? `${description.substring(0, 20)}...` : description;
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
    <Box sx={{ 
      width: "100%", 
      minHeight: "100vh", 
      bgcolor: "#f5f5f5", 
      px: { xs: 1.5, sm: 2 },
      py: 2,
      overflow: "hidden" 
    }}>
      {/* Header & Search */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Menu Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateModalVisible(true)}
            sx={{
              borderRadius: 2,
              bgcolor: "#EB8041",
              boxShadow: "none",
              px: 2,
              "&:hover": {
                bgcolor: "#D26E2F",
                boxShadow: "0 4px 12px rgba(235, 128, 65, 0.2)"
              }
            }}
          >
            Add Item
          </Button>
          <XlFormat 
                data={items} 
                isLoading={loading} 
              />
              <Button variant="contained" onClick={()=>setisImportDialogOpen(true)}>
                Import Menu
              </Button>
               {isImportDialogOpen && (
        <ImportBulk
          open={isImportDialogOpen}
          onOpenChange={setisImportDialogOpen}
          outletId={outletid?.outlet_id}
        />
      )}
        </Stack>
        
        <Box>
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
              ),
              sx: {
                bgcolor: "white",
                borderRadius: 2,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent"
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0,0,0,0.1)"
                }
              }
            }}
          />
        </Box>
        
        {/* Filter button & chips */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ overflowX: "auto", pb: 0.5 }}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setDrawerOpen(true)}
            sx={{
              borderRadius: 2,
              borderColor: "rgba(0,0,0,0.1)",
              color: "text.primary",
              flexShrink: 0,
              "&:hover": {
                borderColor: "rgba(0,0,0,0.2)",
                bgcolor: "rgba(0,0,0,0.02)"
              }
            }}
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
          
          {/* Active filter chips */}
          <Box sx={{ display: "flex", gap: 1, overflowX: "auto", flexShrink: 0 }}>
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
            
            {activeFiltersCount > 0 && (
              <Chip 
                size="small"
                label="Clear All"
                onClick={resetFilters}
                color="default"
              />
            )}
          </Box>
        </Stack>
      </Stack>
      
      {/* Menu Items List */}
      <Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "40vh" }}>
            <CircularProgress size={40} color="primary" />
          </Box>
        ) : filteredItems.length > 0 ? (
          <Stack spacing={2}>
            {filteredItems.map((item) => (
              <Paper
                key={item.item_id}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  transition: "transform 0.2s ease-in-out",
                  opacity: item.status ? 1 : 0.7,
                  bgcolor: "white"
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  {/* Image */}
                  <Grid item xs={3} sm={2}>
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        paddingTop: "100%",
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                      }}
                    >
                      <Box
                        component="img"
                        src={item?.image || "https://via.placeholder.com/100"}
                        alt={item.item_name}
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/100?text=No+Image";
                        }}
                      />
                      {/* Veg/Non-veg indicator */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          borderRadius: "50%",
                          width: 20,
                          height: 20,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          bgcolor: item?.is_vegeterian === 1 ? "#0A8A0A" : "#D6292C",
                          border: "2px solid white"
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  {/* Details */}
                  <Grid item xs={5} sm={6}>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                        {item.item_name}
                      </Typography>
                      
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle1" fontWeight={700} color="#3B7F4B" sx={{ display: "flex", alignItems: "center" }}>
                          <CurrencyRupee fontSize="small" sx={{ mr: 0.25 }} />
                          {item?.vendor_price}
                        </Typography>
                        
                        {/* Food Type and Cuisine */}
                        <Stack direction="column" spacing={0.5}>
                          <Chip
                            label={formatFoodType(item.food_type)}
                            size="small"
                            sx={{ 
                              height: 20, 
                              fontSize: "0.7rem",
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main
                            }}
                          />
                          
                          <Chip
                            label={formatCuisineName(item.cuisine)}
                            size="small"
                            sx={{ 
                              height: 20, 
                              fontSize: "0.7rem",
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              color: theme.palette.secondary.main
                            }}
                          />
                        </Stack>
                      </Stack>
                      
                      {/* Truncated Description */}
                      {item?.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            fontSize: '0.8rem',
                            lineHeight: 1.4
                          }}
                        >
                          {truncateDescription(item.description)}
                        </Typography>
                      )}
                    </Stack>
                  </Grid>
                  
                  {/* Action Buttons and Status Toggle */}
                  <Grid item xs={4} sm={4}>
                    <Stack alignItems="flex-end">
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                        In Stock
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {/* Edit Button */}
                        <Stack direction={'column'}>
                        <IconButton 
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(item)}
                          sx={{
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            bgcolor: 'white',
                            '&:hover': {
                              bgcolor: alpha('#2196f3', 0.1),
                            }
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        
                        {/* Delete Button */}
                        <IconButton 
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(item.item_id)}
                          sx={{
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            bgcolor: 'white',
                            '&:hover': {
                              bgcolor: alpha('#f44336', 0.1),
                            }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                         </Stack>
                        {/* Status Toggle */}
                        {statusChanging === item.item_id ? (
                          <CircularProgress size={24} />
                        ) : (
                          <Switch
                            edge="end"
                            checked={Boolean(item?.status)}
                            onChange={() => handleStatus(item.item_id, item.status === 1 ? 0 : 1)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#3B7F4B',
                                '&:hover': {
                                  backgroundColor: alpha('#3B7F4B', 0.1),
                                },
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#3B7F4B',
                              },
                            }}
                          />
                        )}
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Box sx={{ 
            textAlign: "center", 
            py: 8, 
            px: 2, 
            bgcolor: "white", 
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
          }}>
            <RestaurantMenu sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No menu items found
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {activeFiltersCount > 0 
                ? "Try adjusting your filters or search query"
                : "Add your first menu item to get started"}
            </Typography>
            
            {activeFiltersCount > 0 ? (
              <Button 
                variant="outlined" 
                onClick={resetFilters}
                startIcon={<ClearAll />}
              >
                Clear Filters
              </Button>
            ) : (
              <Button 
                variant="contained" 
                onClick={() => setCreateModalVisible(true)}
                startIcon={<Add />}
              >
                Add Menu Item
              </Button>
            )}
          </Box>
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
      
      {/* Filter Drawer */}
      {renderFilterDrawer()}
    </Box>
  );
};

export default Menu;