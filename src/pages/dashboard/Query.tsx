import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Stack,
  useTheme,
  useMediaQuery,
  Card,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Example message data structure
interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'agent';
}

// Hard-coded messages to replicate the sample conversation
const initialMessages: ChatMessage[] = [
  {
    id: 1,
    text: 'I have problem with the taste.',
    sender: 'user',
  },
  {
    id: 2,
    text: `Hello Shashank, I’m sorry to hear that you didn’t like the food. I apologise!\n\nCould you please let me know more?`,
    sender: 'agent',
  },
  {
    id: 3,
    text: 'The food had too much salt that I wasn’t able to take next bite.',
    sender: 'user',
  },
  {
    id: 4,
    text: `Okay, I’ll make sure that it won’t happen again.\n\nLet me initiate your refund immediately. You must get it in next few hours.`,
    sender: 'agent',
  },
  {
    id: 5,
    text: 'Thank you so much!',
    sender: 'user',
  },
  {
    id: 5,
    text: 'Thank you so much!',
    sender: 'user',
  },
  {
    id: 5,
    text: 'Thank you so much!',
    sender: 'user',
  },

  {
    id: 5,
    text: 'Thank you so much!',
    sender: 'user',
  },
  {
    id: 5,
    text: 'Thank you so much!',
    sender: 'user',
  },
  {
    id: 5,
    text: 'Thank you so much!',
    sender: 'user',
  },
  {
    id: 5,
    text: 'Thank you so much!',
    sender: 'user',
  },
];

const Query: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navigate = useNavigate();
  // State to hold messages (in a real app, you might fetch or use WebSocket)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');

  // Handle sending new message
  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: messages.length + 1,
      text: inputValue.trim(),
      sender: 'user', // For demo, new messages are from "user"
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
  };

  // Pressing Enter key also sends the message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        width:'100%',
        display: 'flex',
        flexDirection: 'column',
        height: '90vh', // optional fixed height
        overflowY:'scroll',
        backgroundColor: '#fff',
        overflowX:'hidden'
      }}
    >

        <Card
                sx={{
                  overflow: "hidden",
                  borderBottomLeftRadius: "40px",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  height: "10vh",
                  width:'100vw',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  boxShadow: 1,
                  border: 'none',
                  mb: 2,
                  borderBottomRightRadius: "40px",
                }}
                variant="outlined"
              >
                <Stack  width={'100%'} mx={2}>
               <Typography color='gray'>Order ID: <b>#12121342</b></Typography>
               <Typography fontSize={'larger'} fontWeight={400}><b>Shashank Tiwari</b> +919045153128</Typography>
                </Stack>
              </Card>
      {/* Messages container */}
      <ArrowBack sx={{mx:2}} onClick={()=>navigate('/dashboard/queries')}/>
      <Box
        sx={{
          flex: 1,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          overflowY: 'auto',
          // On very small screens, reduce padding
          [theme.breakpoints.down('sm')]: {
            p: 1,
          },
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <Box
              key={msg.id}
              sx={{
                alignSelf: isUser ? 'flex-start' : 'flex-end',
                maxWidth: '80%',
              }}
            >
              <Box
                sx={{
                  backgroundColor: isUser ? '#FFE8D2' : '#FF9800',
                  color: isUser ? 'inherit' : '#fff',
                  borderRadius: isUser
                    ? '12px 12px 12px 0px' // round top, left, bottom corners
                    : '12px 12px 0px 12px', // round top, right, bottom corners
                  p: 1.5,
                  whiteSpace: 'pre-line', // preserve line breaks
                  fontSize: 14,
                }}
              >
                {msg.text}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Input area */}
      <Box
        sx={{
          borderTop: '1px solid #eee',
          p: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <TextField
          variant="outlined"
          size="small"
          placeholder="Type here..."
          fullWidth
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '50px',
            },
          }}
        />
        <IconButton
          onClick={handleSend}
          sx={{
            backgroundColor: '#FF9800',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#FB8C00',
            },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Query;
