import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Paper,
  Grid,
  IconButton,
  Chip,
} from '@mui/material';
import {
  ArrowForward,
  ArrowBack,
  Favorite,
  MonetizationOn,
  Info,
  MedicalServices,
  Assignment,
} from '@mui/icons-material';
import { useAuth } from "../contexts/AuthContext";
import axios from 'axios';

function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/pets/${id}`);
        setPet(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch pet details');
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  const handleAdopt = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Validate required data
      if (!id || !pet?.seller?._id) {
        setError('Missing required pet or seller information');
        console.error('Missing data:', { id, sellerId: pet?.seller?._id });
        return;
      }

      // Convert IDs to strings to ensure consistent format
      const petId = String(id);
      const sellerId = String(pet.seller._id);
      
      const requestData = {
        petId,
        sellerId
      };
      
      console.log('Creating adoption request with data:', requestData);
      console.log('Current user:', user);
      
      // Create adoption request
      const response = await axios.post(
        'http://localhost:5000/api/adoption-requests',
        requestData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Adoption request created:', response.data);
      console.log('Response status:', response.status);

      // Update pet status
      await axios.patch(
        `http://localhost:5000/api/pets/${id}`,
        { status: 'pending' },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setPet(prev => ({ ...prev, status: 'pending' }));
      setSuccess('Adoption request sent successfully! The business owner will review your request.');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err) {
      console.error('Adoption request error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.message || err.message || 'Failed to submit adoption request');
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setError('');
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === pet.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? pet.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!pet) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">Pet not found</Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 4,
        pt: 8,
        background: `linear-gradient(135deg, ${alpha('#FFE8F0', 0.9)} 0%, ${alpha('#FFF5E6', 0.9)} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        {/* Shop Banner */}
        {pet.seller && (
          <Box 
            sx={{ 
              mb: 3,
              p: 2,
              mt: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: 2,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.15),
                transform: 'translateY(-2px)',
                boxShadow: 2,
              },
              transition: 'all 0.3s ease-in-out'
            }}
            onClick={() => navigate(`/shop/${pet.seller._id}`)}
          >
            <Box>
              <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                {pet.seller.businessName || pet.seller.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View shop details and discover more adorable pets
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              color="primary"
              sx={{ 
                borderRadius: '20px',
                textTransform: 'none',
                px: 2
              }}
            >
              Visit Shop
            </Button>
          </Box>
        )}

        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 2, 
              borderRadius: 2,
              boxShadow: 1
            }}
          >
            {success}
          </Alert>
        )}
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              borderRadius: 2,
              boxShadow: 1
            }}
          >
            {error}
          </Alert>
        )}

        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: 4,
            overflow: 'hidden',
            backgroundColor: 'white',
          }}
        >
          {/* Image Carousel Section */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: { xs: '300px', sm: '400px', md: '500px' },
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#000',
            }}
          >
            <img
              src={`http://localhost:5000/uploads/pets/${pet.images[currentImageIndex]}`}
              alt={pet.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
            
            {pet.images.length > 1 && (
              <>
                <IconButton
                  onClick={prevImage}
                  sx={{
                    position: 'absolute',
                    left: 16,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                  }}
                >
                  <ArrowBack />
                </IconButton>
                <IconButton
                  onClick={nextImage}
                  sx={{
                    position: 'absolute',
                    right: 16,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                  }}
                >
                  <ArrowForward />
                </IconButton>
              </>
            )}
          </Box>

          {/* Pet Details */}
          <Box sx={{ p: 3 }}>
            {/* Main Pet Information */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mr: 2 }}>
                {pet.name}
              </Typography>
              <Chip 
                label={pet.status.toUpperCase()}
                color={
                  pet.status === 'available' ? 'success' :
                  pet.status === 'pending' ? 'warning' :
                  pet.status === 'adopted' ? 'primary' :
                  'error'
                }
                sx={{ fontWeight: 'medium', height: 28 }}
              />
            </Box>

            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              {pet.breed} • {pet.age} • {pet.gender}
            </Typography>

            {/* Grid Layout for Details */}
            <Grid container spacing={3}>
              {/* Pet Details */}
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Info /> About {pet.name}
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {pet.description}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                      Details:
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Type: {pet.type}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Breed: {pet.breed}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Age: {pet.age}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Gender: {pet.gender}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Color: {pet.color || 'Not specified'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Size: {pet.size || 'Not specified'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Grid>

              {/* Health Information */}
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MedicalServices /> Health Information
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {pet.healthInfo || 'No specific health information provided.'}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                      Vaccinations:
                    </Typography>
                    <Typography variant="body1">
                      {pet.vaccinated ? 'Up to date' : 'Information not available'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Adoption Cost */}
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MonetizationOn /> Adoption Details
                  </Typography>
                  <Typography variant="h4" sx={{ color: theme.palette.primary.main, mb: 2 }}>
                    ${pet.price}
                  </Typography>
                  {pet.status === 'available' && user?.userType === 'regular' && (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleAdopt}
                      startIcon={<Favorite />}
                      disabled={loading}
                      sx={{
                        mt: 'auto',
                        borderRadius: '50px',
                        py: 1.5,
                        backgroundColor: '#F67280',
                        '&:hover': {
                          backgroundColor: '#F8B195',
                          transform: 'scale(1.02)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {loading ? 'Submitting...' : 'Adopt Me ❤️'}
                    </Button>
                  )}
                  {pet.status === 'pending' && (
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label="PENDING" 
                        color="warning" 
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                      <Typography variant="body1" color="warning.main">
                      This pet has a pending adoption request
                    </Typography>
                    </Box>
                  )}
                  {pet.status === 'adopted' && (
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label="ADOPTED" 
                        color="success" 
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                      <Typography variant="body1" color="success.main">
                      This pet has been adopted ❤️
                    </Typography>
                    </Box>
                  )}
                  {pet.status === 'available' && (!user || user.userType !== 'regular') && (
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label="AVAILABLE" 
                        color="success" 
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                      <Typography variant="body1" color="info.main">
                        Please log in as a regular user to adopt this pet
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Adoption Requirements */}
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assignment /> Adoption Requirements
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {pet.requirements}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default PetDetail; 