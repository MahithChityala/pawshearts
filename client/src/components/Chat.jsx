import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Send as SendIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from "../contexts/AuthContext";
import { formatDistanceToNow } from 'date-fns';

function Chat({ adoptionRequestId, onMutualAcceptance }) {
  const theme = useTheme();
  const { user } = useAuth();
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChat = async () => {
    if (!adoptionRequestId) {
      console.error('No adoptionRequestId provided');
      setError('Missing adoption request information');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      console.log('Fetching chat for adoption request:', adoptionRequestId);
      const response = await axios.get(
        `http://localhost:5000/api/chats/adoption/${adoptionRequestId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('Chat data received:', response.data);
      setChat(response.data);
      setError('');
    } catch (err) {
      console.error('Error in fetchChat:', err.response || err);
      
      if (err.response?.status === 404) {
        // Chat doesn't exist yet, try to create it
        try {
          console.log('Creating new chat for adoption request:', adoptionRequestId);
          const token = localStorage.getItem('token');
          const createResponse = await axios.post(
            `http://localhost:5000/api/chats/adoption/${adoptionRequestId}`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          console.log('New chat created:', createResponse.data);
          setChat(createResponse.data);
          setError('');
        } catch (createErr) {
          console.error('Error creating chat:', createErr.response || createErr);
          setError(createErr.response?.data?.message || 'Failed to create chat');
        }
      } else {
        setError(err.response?.data?.message || 'Failed to load chat');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChat();
  }, [adoptionRequestId, fetchChat]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      if (!chat?._id) {
        setError('Chat not initialized');
        return;
      }

      console.log('Sending message to chat:', chat._id);
      const response = await axios.post(
        `http://localhost:5000/api/chats/${chat._id}/messages`,
        { content: message },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('Message sent, updated chat:', response.data);
      setChat(response.data);
      setMessage('');
      setError('');
    } catch (err) {
      console.error('Error sending message:', err.response || err);
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  const handleAcceptTerms = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      if (!chat?._id) {
        setError('Chat not initialized');
        return;
      }

      console.log('Accepting terms for chat:', chat._id);
      const response = await axios.post(
        `http://localhost:5000/api/chats/${chat._id}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('Terms accepted, updated chat:', response.data);
      setChat(response.data);
      setError('');
      
      // If both parties have accepted, notify parent component
      if (response.data.buyerAccepted && response.data.sellerAccepted) {
        onMutualAcceptance();
      }
    } catch (err) {
      console.error('Error accepting terms:', err.response || err);
      setError(err.response?.data?.message || 'Failed to accept terms');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ m: 2 }}
        action={
          <Button color="inherit" size="small" onClick={fetchChat}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!chat) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        Unable to load chat. Please try again later.
      </Alert>
    );
  }

  const isBuyer = user?._id === chat?.buyer?._id;
  const userHasAccepted = isBuyer ? chat?.buyerAccepted : chat?.sellerAccepted;
  const otherPartyHasAccepted = isBuyer ? chat?.sellerAccepted : chat?.buyerAccepted;

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        height: '500px', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: theme.palette.primary.main,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h6">
          Chat with {isBuyer ? chat?.seller?.businessName || chat?.seller?.name : chat?.buyer?.name}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          {userHasAccepted && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <CheckCircleIcon color="success" />
              <Typography variant="caption">You accepted</Typography>
            </Box>
          )}
          {otherPartyHasAccepted && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <CheckCircleIcon color="success" />
              <Typography variant="caption">They accepted</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: alpha(theme.palette.background.default, 0.6)
        }}
      >
        {chat?.messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary'
            }}
          >
            <Typography variant="body1">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          chat?.messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: msg.sender._id === user?._id ? 'row-reverse' : 'row',
                gap: 1,
                alignItems: 'flex-start'
              }}
            >
              <Avatar
                src={msg.sender.avatar}
                alt={msg.sender.name}
                sx={{ width: 32, height: 32 }}
              />
              <Box
                sx={{
                  maxWidth: '70%',
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: msg.sender._id === user?._id ? 
                    theme.palette.primary.main : 
                    theme.palette.background.paper,
                  color: msg.sender._id === user?._id ? 
                    'white' : 
                    'inherit',
                  boxShadow: 1
                }}
              >
                <Typography variant="body1">
                  {msg.content}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    mt: 0.5,
                    color: msg.sender._id === user?._id ? 
                      'rgba(255,255,255,0.7)' : 
                      'text.secondary'
                  }}
                >
                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                </Typography>
              </Box>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Accept Terms Button */}
      {!userHasAccepted && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            onClick={handleAcceptTerms}
            startIcon={<CheckIcon />}
          >
            Accept Terms and Proceed with Adoption
          </Button>
        </Box>
      )}

      {/* Message Input */}
      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: theme.palette.background.paper,
          display: 'flex',
          gap: 1
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{ bgcolor: 'white' }}
        />
        <IconButton 
          type="submit" 
          color="primary"
          disabled={!message.trim()}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}

export default Chat; 