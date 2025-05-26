import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import CommunityChat from '../components/CommunityChat';
import axios from 'axios';

const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState(1);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCommunity();
    fetchMessages();
  }, [id]);

  const fetchCommunity = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      console.log('Fetching community details:', id);
      const response = await api.communities.getById(id);

      console.log('Community response:', response.data);
      setCommunity(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching community:', error);
      setError(error.response?.data?.message || 'Failed to fetch community details');
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/community-chat/community/${id}`);
      setMessages(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const handleJoinCommunity = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to join the community');
        return;
      }

      console.log('Joining community:', id);
      const response = await api.communities.join(id);

      console.log('Join response:', response.data);
      if (response.data.status === 'success') {
        setCommunity(prev => ({
          ...prev,
          members: [...(prev.members || []), user._id]
        }));
        setSuccessMessage('Successfully joined the community!');
        setError('');
      }
    } catch (error) {
      console.error('Error joining community:', error.response?.data || error);
      setError(error.response?.data?.message || 'Failed to join community. Please try again.');
      setSuccessMessage('');
    }
  };

  const handleLeaveCommunity = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to leave the community');
        return;
      }

      console.log('Leaving community:', id);
      const response = await api.communities.leave(id);

      console.log('Leave response:', response.data);
      if (response.data.status === 'success') {
        setCommunity(prev => ({
          ...prev,
          members: prev.members.filter(memberId => memberId !== user._id)
        }));
        setSuccessMessage('Successfully left the community');
        setError('');
      }
    } catch (error) {
      console.error('Error leaving community:', error.response?.data || error);
      setError(error.response?.data?.message || 'Failed to leave community. Please try again.');
      setSuccessMessage('');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedImage) return;

    try {
      const formData = new FormData();
      formData.append('communityId', id);
      formData.append('message', newMessage);
      if (selectedImage) {
        formData.append('attachments', selectedImage);
      }

      // Optimistically add the message to the UI
      setMessages(prev => [
        ...((Array.isArray(prev) ? prev : [])),
        {
          _id: 'temp-' + Date.now(),
          sender: user,
          message: newMessage,
          attachments: selectedImage ? [URL.createObjectURL(selectedImage)] : [],
          likes: [],
          replies: [],
          createdAt: new Date().toISOString()
        }
      ]);

      await api.post('/community-chat', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setNewMessage('');
      setSelectedImage(null);
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleReply = async (messageId) => {
    if (!replyText.trim()) return;

    try {
      await api.post(`/community-chat/${messageId}/reply`, {
        message: replyText
      });

      setReplyText('');
      setReplyTo(null);
      fetchMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const handleLike = async (messageId) => {
    try {
      await api.post(`/community-chat/${messageId}/like`);
      fetchMessages();
    } catch (error) {
      console.error('Error liking message:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await api.delete(`/community-chat/${messageId}`);
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Update the isMember check to handle both string and object IDs
  const isMember = community && Array.isArray(community.members) &&
    community.members.some(member => 
      (typeof member === 'string' ? member : member._id) === user?._id
    );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!community) {
    return (
      <Container>
        <Typography variant="h5" color="error">
          Community not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box
              component="img"
              src={community.image
                ? (community.image.startsWith('http')
                    ? community.image
                    : `http://localhost:5000${community.image}`)
                : '/default-community.jpg'}
              alt={community.name}
              sx={{
                width: '100%',
                height: 200,
                objectFit: 'cover',
                borderRadius: 1,
                mb: 2
              }}
            />
            <Typography variant="h4" gutterBottom>
              {community.name}
            </Typography>
            <Typography variant="body1" paragraph>
              {community.description}
            </Typography>
            <Box mb={2}>
              <Typography variant="subtitle1" gutterBottom>
                Rules:
              </Typography>
              {Array.isArray(community.rules) && community.rules.map((rule, index) => (
                <Typography key={index} variant="body2" color="text.secondary">
                  • {rule}
                </Typography>
              ))}
            </Box>
            <Box display="flex" alignItems="center" mb={2}>
              <Chip
                avatar={<Avatar>{community.members.length}</Avatar>}
                label="Members"
                size="small"
                sx={{ mr: 1 }}
              />
              {community.isPrivate && (
                <Chip label="Private" size="small" color="primary" />
              )}
            </Box>
            {user && (
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  if (isMember) {
                    handleLeaveCommunity();
                  } else {
                    handleJoinCommunity();
                  }
                }}
              >
                {isMember ? 'Leave Community' : 'Join Community'}
              </Button>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <CommunityChat communityId={id} />
          </Paper>
        </Grid>
      </Grid>

      <Snackbar 
        open={Boolean(error)} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={Boolean(successMessage)} 
        autoHideDuration={6000} 
        onClose={() => setSuccessMessage('')}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CommunityDetail; 