import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useState } from 'react';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  isAvailable: boolean;
}

const initialMenuItems: MenuItem[] = [
  {
    id: 1,
    name: "Butter Chicken",
    price: 350,
    category: "Main Course",
    description: "Tender chicken in rich tomato gravy",
    isAvailable: true
  },
  {
    id: 2,
    name: "Paneer Tikka",
    price: 250,
    category: "Starters",
    description: "Grilled cottage cheese with spices",
    isAvailable: true
  },
  {
    id: 3,
    name: "Biryani",
    price: 300,
    category: "Main Course",
    description: "Fragrant rice with spices and meat",
    isAvailable: false
  }
];

export default function Menu() {
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  
  const handleDelete = (id: number) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const handleEdit = (item: MenuItem) => {
    setEditItem(item);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditItem(null);
    setDialogOpen(true);
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newItem: MenuItem = {
      id: editItem?.id || menuItems.length + 1,
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      isAvailable: Boolean(formData.get('isAvailable')),
    };

    if (editItem) {
      setMenuItems(menuItems.map(item => 
        item.id === editItem.id ? newItem : item
      ));
    } else {
      setMenuItems([...menuItems, newItem]);
    }
    
    setDialogOpen(false);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Menu Items
      </Typography>

      <Grid container spacing={2}>
        {menuItems.map((item) => (
          <Grid item xs={12} key={item.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    {item.name}
                    {!item.isAvailable && (
                      <Typography 
                        component="span" 
                        color="error" 
                        sx={{ ml: 1, fontSize: '0.8rem' }}
                      >
                        (Unavailable)
                      </Typography>
                    )}
                  </Typography>
                  <Typography variant="h6">
                    ₹{item.price}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {item.category}
                  </Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleEdit(item)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(item.id)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Fab 
        color="primary" 
        sx={{ position: 'fixed', bottom: 72, right: 16 }}
        onClick={handleAdd}
      >
        <Add />
      </Fab>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <form onSubmit={handleSave}>
          <DialogTitle>
            {editItem ? 'Edit Menu Item' : 'Add Menu Item'}
          </DialogTitle>
          <DialogContent>
            <TextField
              name="name"
              label="Item Name"
              fullWidth
              margin="normal"
              defaultValue={editItem?.name}
              required
            />
            <TextField
              name="price"
              label="Price"
              type="number"
              fullWidth
              margin="normal"
              defaultValue={editItem?.price}
              required
            />
            <TextField
              name="category"
              label="Category"
              fullWidth
              margin="normal"
              defaultValue={editItem?.category}
              required
            />
            <TextField
              name="description"
              label="Description"
              fullWidth
              margin="normal"
              multiline
              rows={2}
              defaultValue={editItem?.description}
              required
            />
            <FormControlLabel
              control={
                <Switch
                  name="isAvailable"
                  defaultChecked={editItem?.isAvailable ?? true}
                />
              }
              label="Available"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
