import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Communities = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    rules: '',
    isPrivate: false
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('all'); // 'all' or 'joined'
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view communities');
        setLoading(false);
        return;
      }

      const response = await api.communities.getAll();
      if (response.data.status === 'success') {
        setCommunities(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching communities:', error.response?.data || error);
      setError(error.response?.data?.message || 'Failed to load communities. Please try again.');
      setLoading(false);
    }
  };

  const handleCreateCommunity = async () => {
    try {
      const formData = new FormData();
      formData.append('name', newCommunity.name);
      formData.append('description', newCommunity.description);
      formData.append('rules', newCommunity.rules);
      formData.append('isPrivate', newCommunity.isPrivate);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      await api.communities.create(formData);

      setOpenDialog(false);
      setNewCommunity({
        name: '',
        description: '',
        rules: '',
        isPrivate: false
      });
      setSelectedImage(null);
      fetchCommunities();
    } catch (error) {
      console.error('Error creating community:', error);
    }
  };

  const handleJoinCommunity = async (communityId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to join the community');
        return;
      }

      const response = await api.communities.join(communityId);
      if (response.data.status === 'success') {
        setSuccessMessage('Successfully joined the community!');
        setError('');
        await fetchCommunities();
      }
    } catch (error) {
      console.error('Error joining community:', error.response?.data || error);
      setError(error.response?.data?.message || 'Failed to join community. Please try again.');
      setSuccessMessage('');
    }
  };

  const handleLeaveCommunity = async (communityId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to leave the community');
        return;
      }

      const response = await api.communities.leave(communityId);
      if (response.data.status === 'success') {
        setSuccessMessage('Successfully left the community');
        setError('');
        await fetchCommunities();
      }
    } catch (error) {
      console.error('Error leaving community:', error.response?.data || error);
      setError(error.response?.data?.message || 'Failed to leave community. Please try again.');
      setSuccessMessage('');
    }
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedCommunities = view === 'all'
    ? filteredCommunities
    : filteredCommunities.filter(community =>
        community.members.some(member => {
          if (typeof member === 'string') return member === user?._id;
          if (member && member._id) return member._id === user?._id;
          return false;
        })
      );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Communities
        </Typography>
        {user && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Create Community
          </Button>
        )}
      </Box>

      <Box display="flex" gap={2} mb={2}>
        <Button
          variant={view === 'all' ? 'contained' : 'outlined'}
          onClick={() => setView('all')}
        >
          All Communities
        </Button>
        <Button
          variant={view === 'joined' ? 'contained' : 'outlined'}
          onClick={() => setView('joined')}
          disabled={!user}
        >
          My Communities
        </Button>
      </Box>

      <Box mb={4}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search communities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {displayedCommunities.map((community) => {
          const isMember = community.members.some(member =>
            typeof member === 'string' ? member === user?._id : member?._id === user?._id
          );
          
          const imageUrl = community.image
            ? (community.image.startsWith('http') 
                ? community.image 
                : `http://localhost:5000/uploads/communities/${community.image}`)
            : 'https://placehold.co/600x400?text=Community+Image';
          
          console.log('Community Image Debug:', {
            communityId: community._id,
            imageField: community.image,
            constructedUrl: imageUrl
          });
          
          return (
            <Grid item xs={12} sm={6} md={4} key={community._id}>
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={imageUrl}
                  alt={community.name}
                  onError={(e) => {
                    console.error('Image failed to load:', imageUrl);
                    e.target.src = 'https://placehold.co/600x400?text=Community+Image';
                  }}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    {community.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {community.description}
                  </Typography>
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
                    <Box display="flex" flexDirection="column" gap={1}>
                      {isMember ? (
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={e => {
                            e.stopPropagation();
                            handleLeaveCommunity(community._id);
                          }}
                        >
                          Leave
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={e => {
                            e.stopPropagation();
                            handleJoinCommunity(community._id);
                          }}
                        >
                          Join
                        </Button>
                      )}
                      <Button
                        variant="text"
                        fullWidth
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/communities/${community._id}`);
                        }}
                      >
                        View
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Community</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Community Name"
              value={newCommunity.name}
              onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={newCommunity.description}
              onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Rules (one per line)"
              value={newCommunity.rules}
              onChange={(e) => setNewCommunity({ ...newCommunity, rules: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mt: 2 }}
            >
              Upload Community Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files[0])}
              />
            </Button>
            {selectedImage && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {selectedImage.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateCommunity}
            variant="contained"
            disabled={!newCommunity.name || !newCommunity.description}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

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

export default Communities; 