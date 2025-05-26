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
  Image as ImageIcon,
  ThumbUp as ThumbUpIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from "../contexts/AuthContext";
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

function CommunityChat({ communityId }) {
  const theme = useTheme();
  const { user } = useAuth();
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChat = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      console.log('Fetching messages for community:', communityId);
      const response = await axios.get(
        `http://localhost:5000/api/community-chat/community/${communityId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Chat response:', response.data);
      
      // Handle different response structures
      const messages = response.data.messages || response.data.data || response.data;
      setChat({ messages: Array.isArray(messages) ? messages : [] });
      setError('');
    } catch (err) {
      console.error('Error fetching messages:', {
        error: err,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Failed to load messages. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChat();
    // Set up polling for new messages
    const interval = setInterval(fetchChat, 5000);
    return () => clearInterval(interval);
  }, [communityId]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() && !selectedImage) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      console.log('Sending message to community:', communityId);
      const formData = new FormData();
      formData.append('message', message);
      formData.append('communityId', communityId);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      await axios.post(
        'http://localhost:5000/api/community-chat',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setMessage('');
      setSelectedImage(null);
      await fetchChat();
    } catch (err) {
      console.error('Error sending message:', {
        error: err,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Failed to send message. Please try again.'
      );
    }
  };

  const handleLike = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/community-chat/${messageId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchChat();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to like message');
    }
  };

  const handleReply = async (messageId, replyText) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/community-chat/${messageId}/reply`,
        { message: replyText },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchChat();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reply to message');
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
        }}
      >
        <Typography variant="h6">
          Community Chat
        </Typography>
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
        {!chat?.messages || chat.messages.length === 0 ? (
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
          chat.messages.map((msg, index) => (
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
                src={msg.sender.profileImage}
                alt={msg.sender.name}
                sx={{ width: 32, height: 32 }}
              >
                {msg.sender.name[0]}
              </Avatar>
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
                  {msg.message}
                </Typography>
                {msg.attachments?.map((attachment, i) => (
                  <Box
                    key={i}
                    component="img"
                    src={`http://localhost:5000${attachment}`}
                    alt="Attachment"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 200,
                      borderRadius: 1,
                      mt: 1
                    }}
                  />
                ))}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: 1
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleLike(msg._id)}
                    sx={{ 
                      color: msg.likes.includes(user?._id) ? 
                        theme.palette.error.main : 
                        'inherit'
                    }}
                  >
                    <ThumbUpIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="caption">
                    {msg.likes.length}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {/* Handle reply */}}
                  >
                    <ReplyIcon fontSize="small" />
                  </IconButton>
                  {msg.sender._id === user?._id && (
                    <IconButton
                      size="small"
                      onClick={() => {/* Handle delete */}}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      ml: 'auto',
                      color: msg.sender._id === user?._id ? 
                        'rgba(255,255,255,0.7)' : 
                        'text.secondary'
                    }}
                  >
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </Typography>
                </Box>
                {msg.replies?.length > 0 && (
                  <Box sx={{ mt: 1, pl: 2, borderLeft: `2px solid ${theme.palette.divider}` }}>
                    {msg.replies.map((reply, i) => (
                      <Box key={i} sx={{ mt: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          {reply.sender.name}:
                        </Typography>
                        <Typography variant="body2">
                          {reply.message}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

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
        <input
          accept="image/*"
          type="file"
          id="image-upload"
          hidden
          onChange={(e) => setSelectedImage(e.target.files[0])}
        />
        <label htmlFor="image-upload">
          <IconButton component="span" color="primary">
            <ImageIcon />
          </IconButton>
        </label>
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
          disabled={!message.trim() && !selectedImage}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}

export default CommunityChat; 