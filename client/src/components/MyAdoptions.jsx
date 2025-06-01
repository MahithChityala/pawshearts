import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Chat as ChatIcon,
} from '@mui/icons-material';
import axios from 'axios';
import Chat from './Chat';
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from 'react-router-dom';

const MyAdoptions = () => {
  const theme = useTheme();
  const { user, loading } = useAuth();
  const [adoptions, setAdoptions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      fetchAdoptions();
    }
  }, [loading, user]);

  const fetchAdoptions = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      const response = await axios.get('http://localhost:5000/api/adoption-requests/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Adoption requests retrieved:', response.data);
      setAdoptions(response.data);
    } catch (err) {
      console.error('Error fetching adoptions:', err);
      setError(err.response?.data?.message || 'Failed to fetch adoption requests');
    }
  };

  const handleOpenChat = (request) => {
    setSelectedRequest(request);
    setChatDialogOpen(true);
  };

  const handleCloseChat = () => {
    setChatDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleMutualAcceptance = () => {
    fetchAdoptions();
    setSuccess('Adoption terms accepted by both parties! The adoption is now complete.');
    handleCloseChat();
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccess('');
    }, 5000);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Alert severity="error">Authentication required</Alert>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (adoptions.length === 0) {
    return (
      <Alert severity="info">
        You haven't made any adoption requests yet.
      </Alert>
    );
  }

  return (
    <Box>
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {adoptions.map((adoption) => (
          <Grid item xs={12} md={6} key={adoption._id}>
            <Card 
              elevation={2}
              sx={{ 
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={`http://localhost:5000/uploads/pets/${adoption.petId.images[0]}`}
                alt={adoption.petId.name}
                sx={{ objectFit: 'cover' }}
              />
              
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {adoption.petId.name}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip 
                      label={adoption.status.toUpperCase()}
                      sx={{
                        bgcolor: 
                          adoption.status === 'approved' ? 'success.light' :
                          adoption.status === 'pending' ? 'warning.light' :
                          'error.light',
                        color: 
                          adoption.status === 'approved' ? 'success.dark' :
                          adoption.status === 'pending' ? 'warning.dark' :
                          'error.dark'
                      }}
                    />
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenChat(adoption)}
                      sx={{ 
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.2)
                        }
                      }}
                    >
                      <ChatIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {adoption.petId.breed} • {adoption.petId.age} • {adoption.petId.gender}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Submitted on: {new Date(adoption.createdAt).toLocaleDateString()}
                </Typography>

                {adoption.status === 'approved' && (
                  <Box mt={2}>
                    <Typography variant="body2" color="success.main" gutterBottom>
                      Congratulations! Your adoption request has been approved.
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" mt={1}>
                      This pet is now yours! ❤️
                    </Typography>
                  </Box>
                )}

                {adoption.status === 'pending' && (
                  <Typography variant="body2" color="warning.main">
                    Your request is being reviewed by {adoption.sellerId.businessName || adoption.sellerId.name}.
                  </Typography>
                )}

                {adoption.status === 'rejected' && (
                  <Typography variant="body2" color="error.main">
                    Your adoption request was declined.
                  </Typography>
                )}
                
                {adoption.status === 'approved' && (
                  <Box mt={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ 
                        borderRadius: '50px',
                        mt: 1
                      }}
                      onClick={() => navigate(`/pets/${adoption.petId._id}`)}
                    >
                      View Pet Details
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Chat Dialog */}
      <Dialog
        open={chatDialogOpen}
        onClose={handleCloseChat}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogContent sx={{ p: 2 }}>
          {selectedRequest && (
            <Chat 
              adoptionRequestId={selectedRequest._id}
              onMutualAcceptance={handleMutualAcceptance}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MyAdoptions; 