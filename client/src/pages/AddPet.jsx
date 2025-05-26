import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { PhotoCamera, Clear } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const petTypes = ['Dog', 'Cat', 'Bird', 'Fish', 'Small Animal', 'Reptile', 'Other'];
const petAges = ['Baby', 'Young', 'Adult', 'Senior'];

// Styled component for hidden file input
const Input = styled('input')({
  display: 'none',
});

function AddPet() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [petData, setPetData] = useState({
    name: '',
    type: '',
    breed: '',
    age: '',
    gender: '',
    price: '',
    description: '',
    images: [],
    status: 'available',
    healthInfo: '',
    requirements: '',
  });
  const [imagePreviews, setImagePreviews] = useState([]);

  // Cleanup previews when component unmounts
  React.useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        URL.revokeObjectURL(preview.preview);
      });
    };
  }, [imagePreviews]);

  // Redirect if not a business user
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!user) {
          navigate('/login');
          return;
        }
        
        if (user.userType !== 'business') {
          navigate('/profile');
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };

    checkAuth();
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPetData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Create previews for the new images
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    // Update state with new files and previews
    setPetData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setPetData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    // Revoke the old preview URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index].preview);
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (petData.images.length === 0) {
        throw new Error('Please select at least one image');
      }

      const formData = new FormData();
      Object.keys(petData).forEach(key => {
        if (key === 'images') {
          petData.images.forEach(file => {
            formData.append('images', file);
          });
        } else if (key === 'price') {
          formData.append(key, parseFloat(petData[key]) || 0);
        } else {
          formData.append(key, petData[key]);
        }
      });

      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/pets', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      console.error('Error adding pet:', err);
      setError(err.response?.data?.message || err.message || 'Failed to add pet');
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything while checking authentication
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Only business users can access this page
  if (user.userType !== 'business') {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 8,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
      }}
    >
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
            Add a Pet for Adoption/Sale
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              Pet added successfully! Redirecting...
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pet Name"
                  name="name"
                  value={petData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Pet Type</InputLabel>
                  <Select
                    name="type"
                    value={petData.type}
                    onChange={handleChange}
                    label="Pet Type"
                  >
                    {petTypes.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Breed"
                  name="breed"
                  value={petData.breed}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Age</InputLabel>
                  <Select
                    name="age"
                    value={petData.age}
                    onChange={handleChange}
                    label="Age"
                  >
                    {petAges.map(age => (
                      <MenuItem key={age} value={age}>{age}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={petData.gender}
                    onChange={handleChange}
                    label="Gender"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={petData.price}
                  onChange={handleChange}
                  required
                  helperText="Enter 0 for adoption"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={petData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <label htmlFor="pet-images">
                    <Input
                      accept="image/*"
                      id="pet-images"
                      multiple
                      type="file"
                      onChange={handleImageChange}
                    />
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCamera />}
                      sx={{
                        borderRadius: 2,
                        p: 1.5,
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        '&:hover': {
                          borderColor: theme.palette.primary.dark,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      Upload Pet Images
                    </Button>
                  </label>
                  
                  {imagePreviews.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {imagePreviews.map((preview, index) => (
                        <Box
                          key={index}
                          sx={{
                            position: 'relative',
                            width: 100,
                            height: 100,
                            borderRadius: 2,
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={preview.preview}
                            alt={`Preview ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              },
                            }}
                            onClick={() => removeImage(index)}
                          >
                            <Clear fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Health Information"
                  name="healthInfo"
                  value={petData.healthInfo}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adoption Requirements"
                  name="requirements"
                  value={petData.requirements}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 2,
                    borderRadius: 2,
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Add Pet'
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

export default AddPet; 