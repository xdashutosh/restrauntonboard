import { 
  Box, 
  Card, 
  CardContent, 
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const salesData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 5000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 6390 },
  { name: 'Sun', sales: 3490 },
];

const topItems = [
  { name: 'Butter Chicken', sales: 145, revenue: 14500 },
  { name: 'Paneer Tikka', sales: 125, revenue: 11250 },
  { name: 'Biryani', sales: 98, revenue: 9800 },
  { name: 'Naan', sales: 200, revenue: 4000 },
  { name: 'Dal Makhani', sales: 88, revenue: 7040 },
];

export default function Reports() {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Weekly Reports
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sales Overview
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      <Paper sx={{ overflow: 'hidden' }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Top Selling Items
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell align="right">Units Sold</TableCell>
              <TableCell align="right">Revenue (₹)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topItems.map((item) => (
              <TableRow key={item.name}>
                <TableCell component="th" scope="row">
                  {item.name}
                </TableCell>
                <TableCell align="right">{item.sales}</TableCell>
                <TableCell align="right">{item.revenue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
