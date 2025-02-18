import {
  Box,
  Card,
  CardContent,
  Typography,
  Rating,
  Avatar,
  Divider,
  List,
  ListItem
} from '@mui/material';

interface FeedbackItem {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

const mockFeedback: FeedbackItem[] = [
  {
    id: 1,
    customerName: "Priya Sharma",
    rating: 5,
    comment: "Amazing food and quick delivery! The biryani was perfect.",
    date: "2 days ago"
  },
  {
    id: 2,
    customerName: "Rajesh Kumar",
    rating: 4,
    comment: "Good food but delivery was a bit delayed. Overall satisfied.",
    date: "3 days ago"
  },
  {
    id: 3,
    customerName: "Sneha Patel",
    rating: 5,
    comment: "Best restaurant in the area! Love the paneer dishes.",
    date: "4 days ago"
  },
  {
    id: 4,
    customerName: "Amit Singh",
    rating: 3,
    comment: "Food was okay. Could improve the packaging.",
    date: "1 week ago"
  }
];

export default function Feedback() {
  const averageRating = mockFeedback.reduce((acc, item) => acc + item.rating, 0) / mockFeedback.length;

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Overall Rating
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h3">
              {averageRating.toFixed(1)}
            </Typography>
            <Box>
              <Rating value={averageRating} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary">
                Based on {mockFeedback.length} reviews
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        Recent Feedback
      </Typography>

      <List>
        {mockFeedback.map((feedback) => (
          <ListItem key={feedback.id} disablePadding>
            <Card sx={{ width: '100%', mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar>
                    {feedback.customerName.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {feedback.customerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {feedback.date}
                    </Typography>
                  </Box>
                </Box>

                <Rating value={feedback.rating} readOnly size="small" />
                
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {feedback.comment}
                </Typography>
              </CardContent>
            </Card>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
