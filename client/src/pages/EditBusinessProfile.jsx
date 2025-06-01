import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
  MenuItem,
  InputAdornment,
  Divider,
  Chip,
} from '@mui/material';
import { PhotoCamera, Description, Verified, Warning } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const businessTypes = [
  'Pet Shop',
  'Veterinary Clinic',
  'Pet Grooming',
  'Pet Training',
  'Pet Boarding',
  'Pet Daycare',
  'Other'
];

const EditBusinessProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [licenseDoc, setLicenseDoc] = useState(null);

  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    email: '',
    phoneNumber: '',
    licenseNumber: '',
    licenseExpiry: '',
    taxId: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    description: '',
    openingHours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    },
    verificationStatus: 'pending',
    verificationNotes: '',
    isVerified: false,
    verificationMessage: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        businessName: user.businessName || '',
        businessType: user.businessType || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        licenseNumber: user.licenseNumber || '',
        licenseExpiry: user.licenseExpiry ? new Date(user.licenseExpiry).toISOString().split('T')[0] : '',
        taxId: user.taxId || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          country: user.address?.country || '',
          zipCode: user.address?.zipCode || ''
        },
        description: user.description || '',
        openingHours: user.openingHours || {
          monday: '',
          tuesday: '',
          wednesday: '',
          thursday: '',
          friday: '',
          saturday: '',
          sunday: ''
        },
        verificationStatus: user.verificationStatus || 'pending',
        verificationNotes: user.verificationNotes || '',
        isVerified: user.isVerified || false,
        verificationMessage: user.verificationMessage || ''
      });
      setPreviewUrl(user.profilePicture ? `http://localhost:5000/uploads/profiles/${user.profilePicture}` : '');
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleLicenseDocChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLicenseDoc(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataObj = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'address' || key === 'openingHours') {
          formDataObj.append(key, JSON.stringify(formData[key]));
        } else {
          formDataObj.append(key, formData[key]);
        }
      });

      // Append profile picture if selected
      if (profilePic) {
        formDataObj.append('profilePicture', profilePic);
      }

      // Append license document if selected
      if (licenseDoc) {
        formDataObj.append('licenseDocument', licenseDoc);
      }

      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/users/profile',
        formDataObj,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update user context
      updateUser(response.data);
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 8,
        background: 'linear-gradient(135deg, #FFE8F0 0%, #FFF5E6 100%)',
      }}
    >
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Edit Business Profile
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Update your business information
          </Typography>

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

          {/* Verification Status */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Chip
              icon={formData.isVerified ? <Verified /> : <Warning />}
              label={`Verification Status: ${formData.verificationStatus.toUpperCase()}`}
              color={getVerificationStatusColor(formData.verificationStatus)}
              sx={{ mb: 1 }}
            />
            {formData.verificationMessage && (
              <Typography variant="body2" color="text.secondary">
                {formData.verificationMessage}
              </Typography>
            )}
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Profile Picture */}
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={previewUrl}
                    sx={{ width: 120, height: 120, border: '3px solid #F67280' }}
                  />
                  <input
                    accept="image/*"
                    type="file"
                    id="profile-pic"
                    hidden
                    onChange={handleProfilePicChange}
                  />
                  <label htmlFor="profile-pic">
                    <IconButton
                      component="span"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: '#F67280',
                        '&:hover': { backgroundColor: '#F67280' },
                      }}
                    >
                      <PhotoCamera sx={{ color: 'white' }} />
                    </IconButton>
                  </label>
                </Box>
              </Grid>

              {/* Business Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#F67280' }}>
                  Business Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Business Name"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Business Type"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  required
                >
                  {businessTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Contact Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#F67280', mt: 2 }}>
                  Contact Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {/* License Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#F67280', mt: 2 }}>
                  License Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="License Number"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="License Expiry Date"
                  name="licenseExpiry"
                  type="date"
                  value={formData.licenseExpiry}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tax ID"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="License Document"
                  type="file"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Description />
                      </InputAdornment>
                    ),
                  }}
                  onChange={handleLicenseDocChange}
                  required
                />
              </Grid>

              {/* Business Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Business Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
              </Grid>

              {/* Address Fields */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#F67280', mt: 2 }}>
                  Address Information
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                />
              </Grid>

              {/* Opening Hours */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#F67280', mt: 2 }}>
                  Opening Hours
                </Typography>
              </Grid>
              {Object.keys(formData.openingHours).map((day) => (
                <Grid item xs={12} sm={6} key={day}>
                  <TextField
                    fullWidth
                    label={day.charAt(0).toUpperCase() + day.slice(1)}
                    name={`openingHours.${day}`}
                    value={formData.openingHours[day]}
                    onChange={handleChange}
                    placeholder="e.g., 9:00 AM - 6:00 PM"
                  />
                </Grid>
              ))}

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 2,
                    backgroundColor: '#F67280',
                    '&:hover': {
                      backgroundColor: '#F67280',
                      transform: 'scale(1.02)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Profile'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default EditBusinessProfile; 