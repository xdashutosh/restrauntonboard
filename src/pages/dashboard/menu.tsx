import React, { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Box, 
  Tabs, 
  Tab, 
  Switch, 
  Button, 
  Stack, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
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
  alpha
} from "@mui/material";
import { 
  Add, 
  Fastfood, 
  FilterList, 
  Search, 
  RestaurantMenu, 
  LocalDining,
  SearchOff,
  CurrencyRupee,
  Check,
  ClearAll
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import axiosInstance from "../../interceptor/axiosInstance";
import { RootState } from "../../store/store";
import AddDish from "../../components/ui/AddDish";

interface MenuProps {
  restdata: any;
}

const Menu: React.FC<MenuProps> = ({ restdata }) => {
  const [dishes, setDishes] = useState<any>([]);
  const [filteredDishes, setFilteredDishes] = useState<any>([]);
  const [foodTypes, setFoodTypes] = useState<any>([]);
  const [dishCategories, setDishCategories] = useState<any>([]);
  const [selectedFoodType, setSelectedFoodType] = useState<any>("all");
  const [selectedCategory, setSelectedCategory] = useState<any>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stockChanging, setStockChanging] = useState<number | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const userData = useSelector((state: RootState) => state?.auth?.userData);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/restraunts/?vendor_id=${userData?.vendor_id}`);
      const res1 = await axiosInstance.get(`/dishes/?res_id=${res?.data?.data?.rows[0]?.res_id}`);
      
      // Sort by stock status, in-stock items first
      const sortedDishes = res1?.data?.data?.rows.sort((a, b) => {
        if (a.stock === b.stock) return 0;
        return a.stock ? -1 : 1;
      });
      
      setDishes(sortedDishes);
      setFilteredDishes(sortedDishes);
    } catch (error) {
      console.error("Error fetching dishes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!createModalVisible) {
      fetchData();
    }
  }, [createModalVisible]);
  
  useEffect(() => {
    fetchData();
  }, [userData, restdata?.id]);

  useEffect(() => {
    // Fetch food types and dish categories
    const fetchFoodTypes = async () => {
      try {
        const response = await axiosInstance.get(`/food-type`);
        setFoodTypes(response?.data?.data?.rows);
      } catch (error) {
        console.error("Error fetching food types:", error);
      }
    };

    const fetchDishCategories = async () => {
      try {
        const response = await axiosInstance.get(`/dish-cat`);
        setDishCategories(response?.data?.data?.rows);
      } catch (error) {
        console.error("Error fetching dish categories:", error);
      }
    };

    fetchFoodTypes();
    fetchDishCategories();
  }, []);

  useEffect(() => {
    let filtered = dishes;
    
    // Filter by food type
    if (selectedFoodType !== "all") {
      filtered = filtered.filter(dish => dish.food_type === parseInt(selectedFoodType));
    }
    
    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(dish => dish.dish_cat_id === parseInt(selectedCategory));
    }
    
    // Search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(dish => 
        dish.name.toLowerCase().includes(query) || 
        (dish.description && dish.description.toLowerCase().includes(query))
      );
    }
    
    setFilteredDishes(filtered);
  }, [selectedFoodType, selectedCategory, dishes, searchQuery]);

  const handleStock = async (dish_id: any, stock: any) => {
    try {
      setStockChanging(dish_id);
      await axiosInstance.put(`/dish/${dish_id}`, { 
        stock: Number(stock), 
        updated_at: new Date().toISOString() 
      });
      await fetchData();
    } catch (error) {
      console.error("Error updating stock:", error);
    } finally {
      setStockChanging(null);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = dishCategories.find(cat => cat.dish_cat_id === categoryId);
    return category ? category.cat_name : "Uncategorized";
  };
  
  const getFoodTypeName = (typeId) => {
    const type = foodTypes.find(ft => ft.food_type_id === typeId);
    return type ? type.food_cat : "";
  };

  const activeFiltersCount = 
    (selectedFoodType !== "all" ? 1 : 0) + 
    (selectedCategory !== "all" ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0);

  const resetFilters = () => {
    setSelectedFoodType("all");
    setSelectedCategory("all");
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
          {foodTypes?.map((ft) => (
            <Chip 
              key={ft.food_type_id} 
              label={ft.food_cat}
              variant={selectedFoodType === ft.food_type_id ? "filled" : "outlined"}
              color={selectedFoodType === ft.food_type_id ? "primary" : "default"}
              onClick={() => setSelectedFoodType(ft.food_type_id)}
            />
          ))}
        </Box>
        
        <Typography variant="subtitle2" fontWeight={600} color="text.secondary" mb={1}>
          Dish Category
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
          <Chip 
            label="All" 
            variant={selectedCategory === "all" ? "filled" : "outlined"} 
            color={selectedCategory === "all" ? "primary" : "default"}
            onClick={() => setSelectedCategory("all")}
          />
          {dishCategories?.map((dc) => (
            <Chip 
              key={dc.dish_cat_id} 
              label={dc.cat_name}
              variant={selectedCategory === dc.dish_cat_id ? "filled" : "outlined"} 
              color={selectedCategory === dc.dish_cat_id ? "primary" : "default"}
              onClick={() => setSelectedCategory(dc.dish_cat_id)}
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
            {selectedFoodType !== "all" && foodTypes.length > 0 && (
              <Chip 
                size="small"
                label={`Type: ${getFoodTypeName(selectedFoodType)}`}
                onDelete={() => setSelectedFoodType("all")}
                color="primary"
                variant="outlined"
              />
            )}
            
            {selectedCategory !== "all" && dishCategories.length > 0 && (
              <Chip 
                size="small"
                label={`Category: ${getCategoryName(selectedCategory)}`}
                onDelete={() => setSelectedCategory("all")}
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
        ) : filteredDishes.length > 0 ? (
          <Stack spacing={2}>
            {filteredDishes.map((dish) => (
              <Paper
                key={dish.dish_id}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  transition: "transform 0.2s ease-in-out",
                  opacity: dish.stock ? 1 : 0.7,
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
                        src={dish?.media_url || "https://via.placeholder.com/100"}
                        alt={dish.name}
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
                      {dish?.food_type != null && (
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
                            bgcolor: dish?.food_type == 0 ? "#D6292C" : "#0A8A0A",
                            border: "2px solid white"
                          }}
                        />
                      )}
                    </Box>
                  </Grid>
                  
                  {/* Details */}
                  <Grid item xs={6} sm={7}>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                        {dish.name}
                      </Typography>
                      
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle1" fontWeight={700} color="#3B7F4B" sx={{ display: "flex", alignItems: "center" }}>
                          <CurrencyRupee fontSize="small" sx={{ mr: 0.25 }} />
                          {dish?.dish_price}
                        </Typography>
                        
                        {dish?.dish_cat_id && (
                          <Chip
                            label={getCategoryName(dish.dish_cat_id)}
                            size="small"
                            sx={{ 
                              height: 20, 
                              fontSize: "0.7rem",
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main
                            }}
                          />
                        )}
                      </Stack>
                      
                      {dish?.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: '0.8rem',
                            lineHeight: 1.4
                          }}
                        >
                          {dish.description}
                        </Typography>
                      )}
                    </Stack>
                  </Grid>
                  
                  {/* Stock Toggle */}
                  <Grid item xs={3} sm={3} textAlign="right">
                    <Stack alignItems="flex-end">
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                        In Stock
                      </Typography>
                      {stockChanging === dish.dish_id ? (
                        <CircularProgress size={24} />
                      ) : (
                        <Switch
                          edge="end"
                          checked={Boolean(dish?.stock)}
                          onChange={() => handleStock(dish.dish_id, dish.stock == 1 ? 0 : 1)}
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
      
      {/* Add Dish Modal */}
      <AddDish
        open={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        res_id={Number(restdata?.res_id)}
      />
      
      {/* Filter Drawer */}
      {renderFilterDrawer()}
    </Box>
  );
};

export default Menu;