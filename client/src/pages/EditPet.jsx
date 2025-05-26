import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const petTypes = ['Dog', 'Cat', 'Bird', 'Fish', 'Small Animal', 'Reptile', 'Other'];
const petAges = ['Baby', 'Young', 'Adult', 'Senior'];

function EditPet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
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

  // Fetch pet data
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/pets/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPetData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch pet details');
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  // Redirect if not a business user
  useEffect(() => {
    if (!user || user.userType !== 'business') {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPetData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setPetData(prev => ({
      ...prev,
      newImages: e.target.files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('name', petData.name);
      formDataToSend.append('type', petData.type);
      formDataToSend.append('breed', petData.breed);
      formDataToSend.append('age', petData.age);
      formDataToSend.append('gender', petData.gender);
      formDataToSend.append('price', petData.price);
      formDataToSend.append('description', petData.description);
      formDataToSend.append('healthInfo', petData.healthInfo);
      formDataToSend.append('requirements', petData.requirements);
      formDataToSend.append('status', petData.status);
      formDataToSend.append('seller', user._id);

      if (petData.images && petData.images.length > 0) {
        Array.from(petData.images).forEach((image) => {
          formDataToSend.append('images', image);
        });
      }

      await axios.put(`http://localhost:5000/api/pets/${id}`, formDataToSend, {
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
      console.error('Error updating pet:', err);
      setError(err.response?.data?.message || 'Failed to update pet');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.userType !== 'business') {
    return null;
  }

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
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
      }}
    >
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
            Edit Pet
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              Pet updated successfully! Redirecting...
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
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Current Images
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {petData.images.map((image, index) => (
                      <Box
                        key={index}
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={`http://localhost:5000/uploads/pets/${image}`}
                          alt={`Pet ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="pet-images"
                  multiple
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="pet-images">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{ height: '56px' }}
                  >
                    Upload New Images
                  </Button>
                </label>
                {petData.newImages && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    {Array.from(petData.newImages).length} new images selected
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 2,
                    height: '56px',
                    bgcolor: theme.palette.success.main,
                    '&:hover': {
                      bgcolor: theme.palette.success.dark,
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Pet'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

export default EditPet; 