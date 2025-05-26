import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import PetsIcon from '@mui/icons-material/Pets';

const petTypes = ['All', 'Dog', 'Cat', 'Bird', 'Fish', 'Small Animal', 'Reptile', 'Other'];
const petAges = ['All', 'Baby', 'Young', 'Adult', 'Senior'];

function Pets() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedAge, setSelectedAge] = useState('All');
  const [filters, setFilters] = useState({
    type: '',
    breed: '',
    status: ''
  });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/pets', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPets(response.data);
        setFilteredPets(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching pets:', err);
        setError('Failed to fetch pets');
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  useEffect(() => {
    let filtered = pets;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(pet =>
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (selectedType !== 'All') {
      filtered = filtered.filter(pet => pet.type === selectedType);
    }

    // Apply age filter
    if (selectedAge !== 'All') {
      filtered = filtered.filter(pet => pet.age === selectedAge);
    }

    // Apply additional filters
    if (filters.type) {
      filtered = filtered.filter(pet => pet.type === filters.type);
    }
    if (filters.breed) {
      filtered = filtered.filter(pet => pet.breed === filters.breed);
    }
    if (filters.status) {
      filtered = filtered.filter(pet => pet.status === filters.status);
    }

    setFilteredPets(filtered);
  }, [searchTerm, selectedType, selectedAge, pets, filters]);

  const handleAdopt = async (petId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Get the pet data to retrieve seller ID
      const petResponse = await axios.get(`http://localhost:5000/api/pets/${petId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const pet = petResponse.data;
      
      if (!pet || !pet.seller || !pet.seller._id) {
        setError('Cannot find pet details or seller information');
        return;
      }
      
      // Create adoption request
      console.log('Creating adoption request for pet:', {
        petId,
        sellerId: pet.seller._id,
        userId: user._id
      });
      
      // First create the adoption request
      await axios.post(
        'http://localhost:5000/api/adoption-requests',
        {
          petId: String(petId),
          sellerId: String(pet.seller._id)
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Then update pet status
      await axios.patch(
        `http://localhost:5000/api/pets/${petId}`,
        { status: 'pending' },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update the pet's status in the local state
      setPets(pets.map(pet => 
        pet._id === petId ? { ...pet, status: 'pending' } : pet
      ));
      
      // Show success message
      setSuccess("Adoption request sent successfully! The business owner will review your request.");
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err) {
      console.error('Error adopting pet:', err);
      setError(err.response?.data?.message || 'Failed to adopt pet');
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  const uniqueTypes = [...new Set(pets.map(pet => pet.type))];
  const uniqueBreeds = [...new Set(pets.map(pet => pet.breed))];

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
        py: 8,
        background: `linear-gradient(135deg, ${alpha('#FFE8F0', 0.9)} 0%, ${alpha('#FFF5E6', 0.9)} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: theme.palette.primary.main, 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '& svg': {
                animation: 'bounce 2s infinite'
              },
              '@keyframes bounce': {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-10px)' }
              }
            }}
          >
            <PetsIcon /> Available Pets
          </Typography>
          {user?.userType === 'business' && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/add-pet')}
              sx={{
                borderRadius: '50px',
                px: 4,
                py: 1.5,
                backgroundColor: '#F8B195',
                '&:hover': {
                  backgroundColor: '#F67280',
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Add New Pet 🐾
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Filters */}
        <Box 
          sx={{ 
            mb: 4,
            p: 2,
            borderRadius: '50px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: '8px'
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#FFD6D6',
              borderRadius: '4px',
              '&:hover': {
                background: '#FFB6B6'
              }
            }
          }}
        >
          <TextField
            placeholder="Search pets"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{
              minWidth: '200px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '50px',
                backgroundColor: 'transparent',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
                },
                transition: 'all 0.3s ease'
              }
            }}
            InputProps={{
              startAdornment: <PetsIcon sx={{ mr: 1, color: '#F67280' }} />
            }}
          />

          <FormControl size="small" sx={{ minWidth: '120px' }}>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              displayEmpty
              sx={{
                borderRadius: '50px',
                backgroundColor: 'transparent',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFE8F0'
                }
              }}
            >
              <MenuItem value="All">All Types</MenuItem>
              {petTypes.filter(type => type !== 'All').map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: '120px' }}>
            <Select
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}
              displayEmpty
              sx={{
                borderRadius: '50px',
                backgroundColor: 'transparent',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFE8F0'
                }
              }}
            >
              <MenuItem value="All">All Ages</MenuItem>
              {petAges.filter(age => age !== 'All').map(age => (
                <MenuItem key={age} value={age}>{age}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: '120px' }}>
            <Select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              displayEmpty
              sx={{
                borderRadius: '50px',
                backgroundColor: 'transparent',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFE8F0'
                }
              }}
            >
              <MenuItem value="">Pet Type</MenuItem>
              {uniqueTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: '120px' }}>
            <Select
              value={filters.breed}
              onChange={(e) => setFilters(prev => ({ ...prev, breed: e.target.value }))}
              displayEmpty
              sx={{
                borderRadius: '50px',
                backgroundColor: 'transparent',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFE8F0'
                }
              }}
            >
              <MenuItem value="">All Breeds</MenuItem>
              {uniqueBreeds.map(breed => (
                <MenuItem key={breed} value={breed}>{breed}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: '120px' }}>
            <Select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              displayEmpty
              sx={{
                borderRadius: '50px',
                backgroundColor: 'transparent',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFE8F0'
                }
              }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="adopted">Adopted</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Pet Grid */}
        <Grid container spacing={3}>
          {filteredPets.map((pet) => (
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
                <CardContent sx={{ 
                  flexGrow: 1, 
                  backgroundColor: 'transparent',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -15,
                    left: 0,
                    right: 0,
                    height: '30px',
                    background: 'transparent',
                    borderRadius: '50%',
                    zIndex: 1
                  }
                }}>
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
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mb: 1
                    }}
                  >
                    <span style={{ 
                      backgroundColor: '#FFE8F0', 
                      padding: '4px 12px', 
                      borderRadius: '50px',
                      fontSize: '0.85rem'
                    }}>
                      {pet.breed}
                    </span>
                    •
                    <span style={{ 
                      backgroundColor: '#F0F8FF', 
                      padding: '4px 12px', 
                      borderRadius: '50px',
                      fontSize: '0.85rem'
                    }}>
                      {pet.age}
                    </span>
                    •
                    <span style={{ 
                      backgroundColor: '#F5FFE8', 
                      padding: '4px 12px', 
                      borderRadius: '50px',
                      fontSize: '0.85rem'
                    }}>
                      {pet.gender}
                    </span>
                  </Typography>
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
                <CardActions sx={{ p: 2, backgroundColor: 'transparent' }}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/pets/${pet._id}`);
                    }}
                    sx={{ 
                      borderRadius: '50px',
                      py: 1.5,
                      backgroundColor: '#F8B195',
                      '&:hover': {
                        backgroundColor: '#F67280',
                        transform: 'scale(1.02)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    View Details 🐾
                  </Button>
                  {pet.status === 'available' && (
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdopt(pet._id);
                      }}
                      sx={{ 
                        borderRadius: '50px',
                        py: 1.5,
                        ml: 1,
                        borderColor: '#F67280',
                        color: '#F67280',
                        '&:hover': {
                          borderColor: '#F67280',
                          backgroundColor: 'rgba(246, 114, 128, 0.1)',
                          transform: 'scale(1.02)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Adopt ❤️
                    </Button>
                  )}
                  {pet.status === 'pending' && (
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      disabled
                      sx={{ 
                        borderRadius: '50px',
                        py: 1.5,
                        ml: 1
                      }}
                    >
                      Pending 🐾
                    </Button>
                  )}
                  {pet.status === 'adopted' && (
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      disabled
                      sx={{ 
                        borderRadius: '50px',
                        py: 1.5,
                        ml: 1,
                        borderColor: 'success.light',
                        color: 'success.main'
                      }}
                    >
                      Adopted ❤️
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredPets.length === 0 && (
          <Box 
            textAlign="center" 
            py={8}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '24px',
              backdropFilter: 'blur(8px)'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.text.secondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}
            >
              <PetsIcon /> No pets found matching your criteria
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default Pets; 