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
  useTheme,
  alpha,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Pets as PetsIcon } from '@mui/icons-material';

const MyPets = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [adoptedPets, setAdoptedPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdoptedPets = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      if (user?.userType === 'business') {
        // For business users, we show pets they listed
        const response = await axios.get('http://localhost:5000/api/pets/seller', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Business user pets retrieved:', response.data);
        setAdoptedPets(response.data);
      } else {
        // For regular users, we show pets they adopted
        const response = await axios.get('http://localhost:5000/api/pets/adopted', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Adopted pets retrieved:', response.data);
        setAdoptedPets(response.data);
      }
    } catch (err) {
      console.error('Error fetching pets:', err);
      setError(err.response?.data?.message || 'Failed to fetch pets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdoptedPets();
  }, [user]); // Only depend on user changes

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (adoptedPets.length === 0) {
    return (
      <Alert severity="info">
        {user?.userType === 'business' 
          ? "You haven't listed any pets yet." 
          : "You haven't adopted any pets yet."}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PetsIcon /> {user?.userType === 'business' ? 'My Listed Pets' : 'My Adopted Pets'}
      </Typography>
      
      <Grid container spacing={3}>
        {adoptedPets.map((pet) => (
          <Grid item xs={12} md={6} key={pet._id}>
            <Card sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              boxShadow: 2,
              overflow: 'hidden',
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease'
            }}>
              {pet.images?.length > 0 && (
                <CardMedia
                  component="img"
                  height="200"
                  image={`http://localhost:5000/uploads/pets/${pet.images[0]}`}
                  alt={pet.name}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {pet.name}
                  </Typography>
                  <Chip 
                    label={user?.userType === 'business' ? pet.status.toUpperCase() : "ADOPTED"}
                    color={
                      pet.status === 'available' ? 'success' :
                      pet.status === 'adopted' ? 'primary' :
                      pet.status === 'pending' ? 'warning' :
                      'default'
                    }
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {pet.breed} • {pet.age} • {pet.gender}
                </Typography>
                
                {user?.userType !== 'business' && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>From:</strong> {pet.seller.businessName || pet.seller.name}
                  </Typography>
                )}
                
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ 
                      borderRadius: '50px',
                      mt: 1
                    }}
                    onClick={() => navigate(`/pets/${pet._id}`)}
                  >
                    View Pet Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyPets; 