import React, { useEffect, useState } from "react";
import { 
  Card, CardContent, Typography, IconButton, Box, Tabs, Tab, Switch, 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, 
  Select, MenuItem, FormControl, InputLabel,
  Avatar
} from "@mui/material";
import { Add, Fastfood } from "@mui/icons-material";
import { useSelector } from "react-redux";
import axiosInstance from "../../interceptor/axiosInstance";
import { RootState } from "../../store/store";

const Menu = () => {
  const [dishes, setDishes] = useState<any>([]);
  const [filteredDishes, setFilteredDishes] = useState<any>([]);
  const [foodTypes, setFoodTypes] = useState<any>([]);
  const [dishCategories, setDishCategories] = useState<any>([]);
  const [selectedFoodType, setSelectedFoodType] = useState<any>("all");
  const [selectedCategory, setSelectedCategory] = useState<any>("all");
  const [open, setOpen] = useState(false);
  const [newDish, setNewDish] = useState({ name: "", price: "", image: "", inStock: true, dish_type: 0 });
  
  const userData = useSelector((state: RootState) => state?.auth?.userData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/dishes/?res_id=7`);
        setDishes(res?.data?.data?.rows);
        setFilteredDishes(res?.data?.data?.rows);
      } catch (error) {
        console.error("Error fetching dishes:", error);
      }
    };

    fetchData();
  }, [userData]);

  useEffect(() => {
    // Fetch food types and dish categories
    const fetchFoodTypes = async () => {
      const response = await axiosInstance.get(`/food-type`);
      setFoodTypes(response?.data?.data?.rows);
    };

    const fetchDishCategories = async () => {
      const response = await axiosInstance.get(`/dish-cat`);
      console.log(response?.data?.data?.rows)
      setDishCategories(response?.data?.data?.rows);
    };

    fetchFoodTypes();
    fetchDishCategories();
  }, []);

  useEffect(() => {
    let filtered = dishes;
    if (selectedFoodType !== "all") {
      filtered = filtered.filter(dish => dish.food_type === parseInt(selectedFoodType));
    }
    if (selectedCategory !== "all") {
      filtered = filtered.filter(dish => dish.dish_cat_id === parseInt(selectedCategory));
    }
    setFilteredDishes(filtered);
  }, [selectedFoodType, selectedCategory, dishes]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mx: 1 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} width={'100%'}>

        <FormControl  sx={{ width:'100%'}}>
          <InputLabel>Food Type</InputLabel>
          <Select sx={{border:'none',bgcolor:'white',width:'100%'}} value={selectedFoodType} onChange={(e) => setSelectedFoodType(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            {foodTypes.map((ft:any) => (
              <MenuItem key={ft.food_type_id} value={ft.food_type_id}>{ft.food_cat}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl  sx={{ width:'100%'}}>
          <InputLabel>Category</InputLabel>
          <Select sx={{border:'none',bgcolor:'white',width:'100%'}} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            {dishCategories.map((dc:any) => (
              <MenuItem key={dc.dish_cat_id} value={dc.dish_cat_id}>{dc.cat_name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button endIcon={<Add/>} sx={{bgcolor:'#EB8041',color:'white'}}></Button>
      </Stack>

      <Card sx={{ width: "100%", p: 1, borderRadius: 3, boxShadow: "none", mt: 2 }} variant="outlined">
        <Typography fontSize="larger" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Fastfood sx={{ color: "#E07A5F" }} /> Item Stock List
        </Typography>
        <CardContent>
          {filteredDishes.map((dish, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 2, borderBottom: "3px solid #eee",gap:4 }}>
              <img src={dish?.media_url} height={70} style={{borderRadius:'10px',objectFit:'cover'}} width={70}/>
              <Stack>
                <Typography fontWeight={600} fontSize={'larger'} textTransform={'uppercase'}>{dish.name}</Typography>
                
                <Stack direction={'row'} gap={2}>
              {dish?.dish_price?.map((pri,index)=>(
                <Typography >{index==0?<b>QTR</b>:index==1?<b>HALF</b>:<b>FULL</b>} ₹<b style={{color:'#3B7F4B'}}>{pri}</b></Typography>
              ))}
              </Stack>
              </Stack>
              <Stack width={'100%'}>
              <Typography>In Stock</Typography>
              <Switch sx={{color:'orange'}} checked={dish.stock == 1}  />
              </Stack>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Menu;
