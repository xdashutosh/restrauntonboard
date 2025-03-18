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
import AddDish from "../../components/ui/AddDish";

interface props {
  restdata:any;
}

const Menu: React.FC<props> = ({restdata}) => {
  const [dishes, setDishes] = useState<any>([]);
  const [filteredDishes, setFilteredDishes] = useState<any>([]);
  const [foodTypes, setFoodTypes] = useState<any>([]);
  const [dishCategories, setDishCategories] = useState<any>([]);
  const [selectedFoodType, setSelectedFoodType] = useState<any>("all");
  const [selectedCategory, setSelectedCategory] = useState<any>("all");
  const [open, setOpen] = useState(false);
  const [newDish, setNewDish] = useState({ name: "", price: "", image: "", inStock: true, dish_type: 0 });
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const userData = useSelector((state: RootState) => state?.auth?.userData);

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get(`/restraunts/?vendor_id=${userData?.vendor_id}`);
      const res1 = await axiosInstance.get(`/dishes/?res_id=${res?.data?.data?.rows[0]?.res_id}`);
      setDishes(res1?.data?.data?.rows);
      setFilteredDishes(res1?.data?.data?.rows);
    } catch (error) {
      console.error("Error fetching dishes:", error);
    }
  };

  useEffect(()=>{
    if(!createModalVisible)
    {
      fetchData();
    }
  },[createModalVisible])
  useEffect(() => {
    fetchData();
  }, [userData,restdata?.id]);

  useEffect(() => {
    // Fetch food types and dish categories
    const fetchFoodTypes = async () => {
      const response = await axiosInstance.get(`/food-type`);
      setFoodTypes(response?.data?.data?.rows);
    };

    const fetchDishCategories = async () => {
      const response = await axiosInstance.get(`/dish-cat`);
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


  const handlestock = async(dish_id:any, stock:any)=>{
    try {
      axiosInstance.put(`/dish/${dish_id}`, { stock: Number(stock), updated_at: new Date().toISOString() });
      fetchData();

    } catch (error) {
      
    }
  }
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mx: 1 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} width={'100%'}>

        <FormControl  sx={{ width:'100%'}}>
          <InputLabel>Food Type</InputLabel>
          <Select sx={{border:'none',bgcolor:'white',width:'100%'}} value={selectedFoodType} onChange={(e) => setSelectedFoodType(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            {foodTypes?.map((ft:any) => (
              <MenuItem key={ft.food_type_id} value={ft.food_type_id}>{ft.food_cat}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl  sx={{ width:'100%'}}>
          <InputLabel>Category</InputLabel>
          <Select sx={{border:'none',bgcolor:'white',width:'100%'}} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            {dishCategories?.map((dc:any) => (
              <MenuItem key={dc.dish_cat_id} value={dc.dish_cat_id}>{dc.cat_name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <AddDish
                open={createModalVisible}
                onClose={() => setCreateModalVisible(false)}
                res_id={Number(restdata?.res_id)}
            />
        <Button  onClick={() => { setCreateModalVisible(true) }} sx={{bgcolor:'#EB8041',color:'white'}}><Add/></Button>
      </Stack>

      <Card sx={{ width: "100%", p: 1, borderRadius: 3, boxShadow: "none", mt: 2 }} variant="outlined">
        <Typography fontSize="larger" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Fastfood sx={{ color: "#E07A5F" }} /> Item Stock List
        </Typography>
        <CardContent>
          {filteredDishes.map((dish, index) => (
            <Stack direction={'row'} alignItems={'center'}py={2} borderBottom={1}  justifyContent={'space-between'} width={'100%'}>
             
             <Stack direction={'row'} gap={2} >
             <img src={dish?.media_url}  style={{borderRadius:'10px',height:'70px',width:'70px',objectFit:'cover'}}/>
             <Stack>
              <Stack direction={'row'} gap={1}>
             <Typography  textTransform={'uppercase'}>{dish.name}  </Typography>
             <img src= {dish?.dish_type==0?"https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Non_veg_symbol.svg/2048px-Non_veg_symbol.svg.png":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSJYsxDcY54DyakasGzFfguhpYHbDb1B9hwg&s"} height={20} width={20} />
              </Stack>
             <Typography fontSize={"larger"} color="#3B7F4B" fontWeight={600}>₹{dish?.dish_price}</Typography>
             <Typography fontSize={"small"} color="gray">{dish?.description}</Typography>
             </Stack>
             </Stack>
             <Stack>
             <Typography>In Stock</Typography>
<Switch
    edge="end"
    checked={Boolean(dish?.stock)}
    onClick={() =>  handlestock(dish.dish_id,dish.stock == 1 ? 0 : 1 ) }  
                          />
             </Stack>
          
              </Stack>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Menu;
