

import React, { useState } from "react";
import { Card, CardContent, Typography, IconButton, Box, Tabs, Tab, Switch, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack } from "@mui/material";
import { Add, Fastfood } from "@mui/icons-material";
import { VeganIcon } from "lucide-react";

const initialDishes = {
  "North Indian": [
    { name: "Palak Paneer", price: 299, image: "https://www.seriouseats.com/thmb/lhYY8CqBJoDwxj57KFAiY9pORhI=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/20220629-PalakPaneer-Amanda-Suarez-hero-a2fdf0f3ff5141dfbf44d3977678c578.JPG", inStock: true,dish_type:0 },
    { name: "Shahi Paneer", price: 349, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-j1XdLKn31g1i4xhsLYgRw0eiuPzxMgyHpw&s", inStock: true,dish_type:0 },
    { name: "Dal Makhni", price: 249, image: "https://sinfullyspicy.com/wp-content/uploads/2015/03/4-1.jpg", inStock: true ,dish_type:0},
    { name: "Aloo Gobhi", price: 149, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlmS7qVvLisBtTcTn6QXhOcLLHqSYwRwFcbg&s", inStock: true,dish_type:0 },
  ],
  "South Indian": [
    { name: "Dosa", price: 99, image: "dosa.jpg", inStock: true,dish_type:0 },
    { name: "Idli", price: 79, image: "idli.jpg", inStock: true,dish_type:0 },
    { name: "Vada", price: 69, image: "vada.jpg", inStock: false,dish_type:0 }
  ],
  "Chinese": [
    { name: "Hakka Noodles", price: 199, image: "hakka_noodles.jpg", inStock: true,dish_type:0 },
    { name: "Manchurian", price: 179, image: "manchurian.jpg", inStock: false ,dish_type:0}
  ]
};

const Menu = () => {
  const [selectedTab, setSelectedTab] = useState("North Indian");
  const [dishes, setDishes] = useState(initialDishes);
  const [open, setOpen] = useState(false);
  const [newDish, setNewDish] = useState({ name: "", price: "", image: "", inStock: true });

  const toggleStock = (category, index) => {
    setDishes(prev => {
      const updatedDishes = { ...prev };
      updatedDishes[category][index].inStock = !updatedDishes[category][index].inStock;
      return updatedDishes;
    });
  };

  const addDish = () => {
    if (newDish.name && newDish.price) {
      setDishes(prev => ({
        ...prev,
        [selectedTab]: [...prev[selectedTab], { ...newDish, price: parseInt(newDish.price), image: "placeholder.jpg" }]
      }));
      setOpen(false);
      setNewDish({ name: "", price: "", image: "", inStock: true });
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center",mx:3 }}>
      <Stack direction={'row'}>
      <Tabs value={selectedTab} variant="scrollable"  onChange={(_, newValue) => setSelectedTab(newValue)} centered>
        {Object.keys(initialDishes).map(category => (
          <Tab key={category} label={category} value={category} />
        ))}
      </Tabs>
      
      <IconButton
              color="inherit"
              edge="end"
              onClick={() => setOpen(true)}
              sx={{ bgcolor: '#EB8041', borderRadius: 2,color:'white' }}
            >
              <Add  />
            </IconButton> 
              </Stack>
      <Card sx={{ width: "100%", p: 1, borderRadius: 3,boxShadow:'none',mt:2 }} variant="outlined">
        <Typography fontSize={"larger"} fontFamily={"font-katibeh"} sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
          <Fastfood sx={{ color: "#E07A5F" }} /> Item Stock List
        </Typography>
        <CardContent >
          {dishes[selectedTab].map((dish, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 2, borderBottom: "3px solid #eee" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <img src={dish.image} alt={dish.name} width={60}   style={{ borderRadius: "20%",height:"70px" }} />
                <Box>
                  <Stack direction={'row'} gap={1}>
                  <Typography fontFamily={"Poppins"} sx={{ fontWeight: "bold" }}>{dish.name}</Typography>
                   {dish?.dish_type==0?

                     <img src="https://i.pinimg.com/736x/e4/1f/f3/e41ff3b10a26b097602560180fb91a62.jpg"  width={20} height={20} style={{ borderRadius: "20%" }} />:
                  <img src="https://cdn.vectorstock.com/i/500p/00/43/non-vegetarian-sign-veg-logo-symbol-vector-50890043.jpg"  width={20} height={20} style={{ borderRadius: "20%" }} />
                  
                   }
                  </Stack>
                  <Typography fontFamily={"font-katibeh"} sx={{ color: "green" }}>₹{dish.price}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center",flexDirection:'column' }}>
                <Typography fontFamily={"font-katibeh"} sx={{ fontSize: "0.85rem" }}>In Stock</Typography>
                <Switch checked={dish.inStock} onChange={() => toggleStock(selectedTab, index)} color="warning" />
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Dish</DialogTitle>
        <DialogContent>
          <TextField label="Dish Name" fullWidth margin="dense" value={newDish.name} onChange={e => setNewDish({ ...newDish, name: e.target.value })} />
          <TextField label="Price" type="number" fullWidth margin="dense" value={newDish.price} onChange={e => setNewDish({ ...newDish, price: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={addDish}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Menu;
