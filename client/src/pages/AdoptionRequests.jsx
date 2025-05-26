import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Pets as PetsIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Chat from '../components/Chat';

function AdoptionRequests() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [selectedChatRequest, setSelectedChatRequest] = useState(null);

  const fetchRequests = async () => {
    try {
      if (!user?._id) {
        console.error('User ID not available');
        setError('User information not loaded');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const sellerId = String(user._id);
      console.log('Fetching requests for seller:', sellerId);
      console.log('User object:', user);
      
      const response = await axios.get(`http://localhost:5000/api/adoption-requests`, {
        params: { sellerId },
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Received response:', response.data);
      console.log('Response status:', response.status);
      setRequests(response.data);
      setError('');
    } catch (err) {
      console.error('Fetch error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.message || 'Failed to fetch adoption requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }
    
    if (user.userType !== 'business') {
      navigate('/profile');
      return;
    }
    
    fetchRequests();
  }, [user, navigate]);

  const handleAction = async (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `http://localhost:5000/api/adoption-requests/${selectedRequest._id}`,
        { status: actionType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await axios.patch(
        `http://localhost:5000/api/pets/${selectedRequest.petId._id}`,
        { 
          status: actionType === 'approved' ? 'adopted' : 'available',
          adopter: actionType === 'approved' ? selectedRequest.userId._id : null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(`Adoption request ${actionType} successfully`);
      fetchRequests();

      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${actionType} adoption request`);
      
      setTimeout(() => {
        setError('');
      }, 5000);
    } finally {
      setConfirmDialogOpen(false);
    }
  };

  const handleOpenChat = (request) => {
    setSelectedChatRequest(request);
    setChatDialogOpen(true);
  };

  const handleChatClose = () => {
    setChatDialogOpen(false);
    setSelectedChatRequest(null);
  };

  const handleMutualAcceptance = () => {
    fetchRequests();
    setSuccess('Adoption terms accepted by both parties! The adoption is now complete.');
    handleChatClose();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 4,
        background: `linear-gradient(135deg, ${alpha('#FFE8F0', 0.9)} 0%, ${alpha('#FFF5E6', 0.9)} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            color: theme.palette.primary.main,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <PetsIcon /> Adoption Requests
        </Typography>

        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}
          >
            {success}
          </Alert>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2, boxShadow: 1 }}
          >
            {error}
          </Alert>
        )}

        {requests.length === 0 ? (
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No adoption requests yet
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {requests.map((request) => (
              <Grid item xs={12} key={request._id}>
                <Card 
                  elevation={2}
                  sx={{
                    display: 'flex',
                    borderRadius: 3,
                    overflow: 'hidden',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{ width: 200, height: 200, objectFit: 'cover' }}
                    image={`http://localhost:5000/uploads/pets/${request.petId.images[0]}`}
                    alt={request.petId.name}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <CardContent sx={{ flex: '1 0 auto', p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {request.petId.name}
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                            {request.petId.breed} • {request.petId.age} • {request.petId.gender}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={request.status.toUpperCase()}
                            color={
                              request.status === 'pending' ? 'warning' :
                              request.status === 'approved' ? 'success' :
                              'error'
                            }
                            sx={{ fontWeight: 'medium' }}
                          />
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenChat(request)}
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

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar 
                          src={request.userId.avatar} 
                          alt={request.userId.name}
                          sx={{ width: 32, height: 32, mr: 1 }}
                        />
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                            {request.userId.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {request.userId.email}
                          </Typography>
                        </Box>
                      </Box>

                      {request.status === 'pending' && (
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckIcon />}
                            onClick={() => handleAction(request, 'approved')}
                            sx={{ borderRadius: 2, flex: 1 }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            startIcon={<CloseIcon />}
                            onClick={() => handleAction(request, 'rejected')}
                            sx={{ borderRadius: 2, flex: 1 }}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle>
            Confirm {actionType === 'approved' ? 'Approval' : 'Rejection'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to {actionType === 'approved' ? 'approve' : 'reject'} this adoption request?
              {actionType === 'approved' 
                ? " This will mark the pet as adopted."
                : " The pet will be available for other adoption requests."}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => setConfirmDialogOpen(false)}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color={actionType === 'approved' ? 'success' : 'error'}
              onClick={handleConfirmAction}
              sx={{ borderRadius: 2 }}
            >
              Confirm {actionType === 'approved' ? 'Approval' : 'Rejection'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Chat Dialog */}
        <Dialog
          open={chatDialogOpen}
          onClose={handleChatClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogContent sx={{ p: 2 }}>
            {selectedChatRequest && (
              <Chat 
                adoptionRequestId={selectedChatRequest._id}
                onMutualAcceptance={handleMutualAcceptance}
              />
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
}

export default AdoptionRequests; 