import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Pets as PetsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const pawPrints = [
  { top: '5%', left: '8%', rotation: '45deg' },
  { top: '20%', right: '12%', rotation: '-30deg' },
  { bottom: '15%', left: '15%', rotation: '15deg' },
  { bottom: '30%', right: '8%', rotation: '-15deg' },
];

function EditProfile() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user: authUser, updateProfile, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authUser) {
      navigate('/login');
      return;
    }

    setFormData({
      name: authUser.name || '',
      email: authUser.email || '',
      phoneNumber: authUser.phoneNumber || '',
      address: authUser.address || '',
    });
    setPreviewUrl(authUser.profilePicture || '');
    setLoading(false);
  }, [authUser, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size should not exceed 5MB');
        return;
      }
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      
      // Append user data
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append profile picture if changed
      if (profilePicture) {
        formDataToSend.append('profilePicture', profilePicture);
      }

      const result = await updateProfile(formDataToSend);
      
      if (result.success) {
        setSuccess('Profile updated successfully!');
        // Wait a moment before redirecting
        setTimeout(() => navigate('/profile'), 1500);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      position: 'relative',
      minHeight: '100vh',
      bgcolor: alpha(theme.palette.primary.light, 0.1),
      pt: 4,
      pb: 8
    }}>
      {/* Decorative paw prints */}
      {pawPrints.map((style, index) => (
        <PetsIcon
          key={index}
          sx={{
            position: 'absolute',
            ...style,
            fontSize: '3rem',
            color: alpha(theme.palette.primary.main, 0.1),
            transform: `rotate(${style.rotation})`,
            zIndex: 0,
          }}
        />
      ))}

      <Container maxWidth="md">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            borderRadius: 3,
            position: 'relative',
            background: `linear-gradient(45deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/profile')}
            sx={{ mb: 3 }}
          >
            Back to Profile
          </Button>

          <Typography 
            variant="h4" 
            gutterBottom
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: theme.palette.primary.main,
              fontWeight: 'bold',
              mb: 4,
            }}
          >
            <PetsIcon />
            Edit Profile
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <input
                accept="image/*"
                type="file"
                id="profile-picture-input"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="profile-picture-input">
                <Avatar
                  src={previewUrl}
                  sx={{ 
                    width: 150,
                    height: 150,
                    mx: 'auto',
                    mb: 2,
                    cursor: 'pointer',
                    border: `4px solid ${theme.palette.primary.main}`,
                    boxShadow: theme.shadows[4],
                    '&:hover': {
                      opacity: 0.8,
                    },
                  }}
                >
                  {formData.name.charAt(0)}
                </Avatar>
                <IconButton
                  color="primary"
                  component="span"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0,
                    transition: 'opacity 0.3s',
                    '&:hover': {
                      opacity: 1,
                    },
                  }}
                >
                  <PhotoCameraIcon />
                </IconButton>
              </label>
              <Typography variant="body2" color="text.secondary">
                Click to change profile picture
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                variant="outlined"
                type="email"
              />
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                variant="outlined"
                multiline
                rows={3}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={saving}
                sx={{ 
                  mt: 2,
                  py: 1.5,
                  borderRadius: 30,
                  boxShadow: theme.shadows[4],
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8],
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

export default EditProfile; 