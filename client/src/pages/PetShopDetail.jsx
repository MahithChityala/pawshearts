import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Card,
  CardContent,
  CardMedia,
  Button,
  Divider,
  IconButton,
  Chip,
  Rating,
  TextField,
  Avatar,
} from '@mui/material';
import {
  Store,
  Pets,
  LocationOn,
  Phone,
  Email,
  AccessTime,
  Verified,
  Star,
  Facebook,
  Instagram,
  Twitter,
  Send,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const PetShopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    rating: 0,
    review: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchShopData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get shop details
      const shopResponse = await axios.get(`http://localhost:5000/api/users/${id}`);
      const shopData = shopResponse.data;
      
      // Ensure ratings are properly populated
      if (shopData.ratings) {
        const populatedRatings = await Promise.all(
          shopData.ratings.map(async (rating) => {
            try {
              const userResponse = await axios.get(`http://localhost:5000/api/users/${rating.userId}`);
              return {
                ...rating,
                userId: userResponse.data
              };
            } catch (err) {
              console.error('Error fetching user details:', err);
              return rating;
            }
          })
        );
        shopData.ratings = populatedRatings;
      }

      setShop(shopData);
      setReviews(shopData.ratings || []);

      // Get shop's pets
      const petsResponse = await axios.get(`http://localhost:5000/api/pets/seller/${id}`);
      setPets(petsResponse.data);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching shop data:', err);
      setError(err.response?.data?.message || 'Failed to fetch shop details. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchShopData();
    }
  }, [id]);

  const handleReviewSubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (newReview.rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!newReview.review.trim()) {
      setError('Please write a review');
      return;
    }

    try {
      setSubmittingReview(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to submit a review');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/users/${id}/ratings`,
        {
          rating: newReview.rating,
          review: newReview.review.trim()
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        // Update the shop's ratings and average rating
        setShop(prev => ({
          ...prev,
          ratings: response.data.ratings,
          averageRating: response.data.averageRating
        }));

        // Update the reviews list with all ratings
        setReviews(response.data.ratings);

        // Clear the form
        setNewReview({ rating: 0, review: '' });

        // Show success message
        setSuccess('Review submitted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit review. Please try again.';
      setError(errorMessage);
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            '& .MuiAlert-message': {
              fontSize: '1rem'
            }
          }}
        >
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Loading shop details...
        </Typography>
      </Box>
    );
  }

  if (!shop) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert 
          severity="info"
          sx={{ 
            mb: 2,
            '& .MuiAlert-message': {
              fontSize: '1rem'
            }
          }}
        >
          Shop not found
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 4,
        pt: 10,
        background: `linear-gradient(135deg, ${alpha('#FFE8F0', 0.9)} 0%, ${alpha('#FFF5E6', 0.9)} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Paper 
          elevation={3} 
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            backgroundColor: 'white',
            mb: 4,
            mt: 0
          }}
        >
          <Box
            sx={{
              height: '200px',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-end',
              p: 3
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                bottom: '-50px',
                left: '50px',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: 'white',
                padding: '5px',
                boxShadow: 3
              }}
            >
              <Box
                component="img"
                src={shop.profilePicture || '/default-shop.png'}
                alt={shop.businessName}
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            </Box>
          </Box>

          <Box sx={{ p: 4, pt: 8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
              <Box>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  {shop.businessName || shop.name}
                  {shop.verified && (
                    <Verified color="primary" sx={{ fontSize: 28 }} />
                  )}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  {shop.businessType}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Star sx={{ color: 'gold', mr: 0.5 }} />
                    <Typography>{shop.averageRating?.toFixed(1) || '0.0'} ({reviews.length} reviews)</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Pets sx={{ color: 'primary.main', mr: 0.5 }} />
                    <Typography>{pets.length} Pets Available</Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton color="primary" size="large">
                  <Facebook />
                </IconButton>
                <IconButton color="primary" size="large">
                  <Instagram />
                </IconButton>
                <IconButton color="primary" size="large">
                  <Twitter />
                </IconButton>
              </Box>
            </Box>

            <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main }}>
                About Our Shop
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {shop.description || 'Welcome to our pet shop! We are dedicated to providing loving homes for all our pets and ensuring the best care for them.'}
              </Typography>
            </Paper>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                  <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main }}>
                    Contact Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn color="primary" />
                      <Typography>{shop.address}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone color="primary" />
                      <Typography>{shop.phone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email color="primary" />
                      <Typography>{shop.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime color="primary" />
                      <Typography>Open 9:00 AM - 6:00 PM</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                Available Pets
              </Typography>
              <Grid container spacing={3}>
                {pets.map((pet) => (
                  <Grid item key={pet._id} xs={12} sm={6} md={4}>
                    <Card 
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        borderRadius: 2,
                        overflow: 'hidden',
                        position: 'relative',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                        },
                        '&:hover .pet-overlay': {
                          opacity: 1
                        },
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      onClick={() => navigate(`/pets/${pet._id}`)}
                    >
                      <CardMedia
                        component="img"
                        height="240"
                        image={`http://localhost:5000/uploads/pets/${pet.images[0]}`}
                        alt={pet.name}
                        sx={{
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease',
                          '&:hover': {
                            transform: 'scale(1.1)'
                          }
                        }}
                      />
                      <Box className="pet-overlay" sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '240px',
                        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 100%)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      }} />
                      <CardContent>
                        <Typography 
                          gutterBottom 
                          variant="h6" 
                          component="h2"
                          sx={{
                            fontWeight: 'bold',
                            color: theme.palette.primary.main
                          }}
                        >
                          {pet.name}
                          <Chip 
                            size="small" 
                            label={pet.status.toUpperCase()}
                            color={
                              pet.status === 'available' ? 'success' :
                              pet.status === 'pending' ? 'warning' :
                              pet.status === 'adopted' ? 'primary' :
                              'default'
                            }
                            sx={{
                              ml: 1,
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 'bold'
                            }}
                          />
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <Chip 
                            label={pet.breed}
                            size="small"
                            sx={{ backgroundColor: '#FFE8F0' }}
                          />
                          <Chip 
                            label={pet.age}
                            size="small"
                            sx={{ backgroundColor: '#F0F8FF' }}
                          />
                          <Chip 
                            label={pet.gender}
                            size="small"
                            sx={{ backgroundColor: '#F5FFE8' }}
                          />
                        </Box>
                        <Typography 
                          variant="h6" 
                          sx={{
                            color: '#F67280',
                            fontWeight: 'bold',
                            mt: 2
                          }}
                        >
                          {pet.price === 0 ? '❤️ Free Adoption' : `$${pet.price}`}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box sx={{ mt: 6 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                Reviews & Ratings
              </Typography>

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
              
              {user && (
                <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                  <Typography variant="h6" gutterBottom>
                    Write a Review
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Rating
                      value={newReview.rating}
                      onChange={(event, newValue) => {
                        setNewReview(prev => ({ ...prev, rating: newValue }));
                      }}
                      size="large"
                    />
                    <TextField
                      multiline
                      rows={4}
                      placeholder="Share your experience with this shop..."
                      value={newReview.review}
                      onChange={(e) => setNewReview(prev => ({ ...prev, review: e.target.value }))}
                      fullWidth
                      error={!!error}
                      helperText={error}
                    />
                    <Button
                      variant="contained"
                      onClick={handleReviewSubmit}
                      disabled={submittingReview}
                      startIcon={<Send />}
                      sx={{
                        alignSelf: 'flex-end',
                        borderRadius: '50px',
                        px: 4
                      }}
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </Box>
                </Paper>
              )}

              <Grid container spacing={3}>
                {reviews.map((review) => (
                  <Grid item xs={12} md={6} key={review._id || `${review.userId._id}-${review.date}`}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 3, 
                        backgroundColor: 'white',
                        borderRadius: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar 
                          src={review.userId?.profilePicture} 
                          alt={review.userId?.name}
                          sx={{ 
                            width: 48, 
                            height: 48,
                            border: '2px solid',
                            borderColor: 'primary.main'
                          }}
                        >
                          {review.userId?.name?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                            {review.userId?.name || 'Anonymous User'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(review.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Rating value={review.rating} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                          ({review.rating} stars)
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {review.review}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PetShopDetail; 