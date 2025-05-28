import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Link,
  Alert,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  useTheme,
  alpha,
  Avatar,
  IconButton,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PetsIcon from '@mui/icons-material/Pets';
import PawsIcon from '@mui/icons-material/Pets';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { keyframes } from '@mui/system';

// Create animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-15px); }
  60% { transform: translateY(-7px); }
`;

function Register() {
  const theme = useTheme();
  const { register, error: authError } = useAuth();
  const [userType, setUserType] = useState('regular');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    businessName: '',
    businessType: 'shelter',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    licenseNumber: '',
    licenseExpiry: '',
    taxId: '',
  });
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Phone number validation
    if (!formData.phoneNumber) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      errors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    // Regular user specific validations
    if (userType === 'regular') {
      if (!formData.firstName) {
        errors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        errors.lastName = 'Last name is required';
      }
    }

    // Business user specific validations
    if (userType === 'business') {
      if (!formData.businessName) {
        errors.businessName = 'Business name is required';
      }
      if (!formData.address) {
        errors.address = 'Business address is required';
      }
      if (!formData.licenseNumber) {
        errors.licenseNumber = 'License number is required for business accounts';
      }
      if (!formData.licenseExpiry) {
        errors.licenseExpiry = 'License expiry date is required for business accounts';
      }
    }

    setFormErrors(errors);
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.isValid) {
      setError('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Create a name field from first and last name for regular users
      // or use the business name for business users
      const name = userType === 'regular' 
        ? `${formData.firstName} ${formData.lastName}` 
        : formData.businessName;
      
      // Create FormData object for file upload
      const formDataObj = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword') {
          formDataObj.append(key, formData[key]);
        }
      });
      
      formDataObj.append('userType', userType);
      formDataObj.append('name', name);
      
      // Append profile picture if selected
      if (profilePic) {
        formDataObj.append('profilePicture', profilePic);
      }

      const result = await register(formDataObj);
      if (result.success) {
        await new Promise(resolve => setTimeout(resolve, 100));
        navigate('/');
      } else {
        // Handle specific error messages
        if (result.error.toLowerCase().includes('email')) {
          setFormErrors({ 
            email: 'Email already exists' 
          });
        } else if (result.error.toLowerCase().includes('password')) {
          setFormErrors({ 
            password: 'Invalid password format' 
          });
        } else if (result.error.toLowerCase().includes('phone')) {
          setFormErrors({ 
            phoneNumber: 'Invalid phone number' 
          });
        } else if (result.error.toLowerCase().includes('business')) {
          setFormErrors({ 
            businessName: 'Business name already exists',
            licenseNumber: 'Invalid license number'
          });
        } else {
          setError('Invalid registration details');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.data?.errors) {
        const serverErrors = err.response.data.errors;
        setFormErrors(serverErrors);
        setError('Please fix the errors in the form');
      } else if (err.response?.status === 409) {
        setFormErrors({ 
          email: 'Email already exists' 
        });
      } else if (err.response?.status === 400) {
        setFormErrors({ 
          password: 'Invalid password format',
          phoneNumber: 'Invalid phone number'
        });
      } else {
        setError('Invalid registration details');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: `radial-gradient(circle, ${theme.palette.background.default} 0%, ${theme.palette.grey[100]} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        py: 6,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          backgroundColor: '#FFD6E0',
          opacity: 0.6,
          animation: `${float} 7s infinite ease-in-out`,
          zIndex: 0
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          backgroundColor: '#E2F0CB',
          opacity: 0.6,
          animation: `${float} 9s infinite ease-in-out`,
          zIndex: 0
        }
      }}
    >
      <Container component="main" maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={5}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 4,
            width: '100%',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3,
              position: 'relative'
            }}
          >
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'center',
              mb: 2,
              position: 'relative'
            }}>
              <PetsIcon 
                sx={{ 
                  color: theme.palette.primary.main, 
                  fontSize: 60,
                  animation: `${bounce} 2s infinite`,
                  transform: 'translateZ(0)' // For better performance
                }} 
              />
              <FavoriteIcon 
                sx={{ 
                  position: 'absolute',
                  color: theme.palette.secondary.main,
                  fontSize: 24,
                  bottom: 0,
                  right: -5,
                  animation: `${pulse} 2s infinite ease-in-out`,
                  transform: 'translateZ(0)' // For better performance
                }} 
              />
            </Box>
            <Typography 
              component="h1" 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                textAlign: 'center',
                mb: 1
              }}
            >
              Create your Paws & Hearts Account
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                textAlign: 'center', 
                mb: 2,
                maxWidth: '600px'
              }}
            >
              Join our community of pet lovers and find your perfect furry companion!
            </Typography>
          </Box>

          {authError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                width: '100%',
                borderRadius: 2
              }}
            >
              {authError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            {/* Profile Picture Upload */}
            <Box 
              sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3
              }}
            >
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Profile Picture
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={profilePicPreview}
                  sx={{
                    width: 100,
                    height: 100,
                    mb: 1,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  {profilePicPreview ? null : <PetsIcon sx={{ fontSize: 50 }} />}
                </Avatar>
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="label"
                  sx={{
                    position: 'absolute',
                    right: -10,
                    bottom: 0,
                    bgcolor: 'white',
                    '&:hover': { bgcolor: alpha(theme.palette.primary.light, 0.1) }
                  }}
                >
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleProfilePicChange}
                  />
                  <PhotoCameraIcon />
                </IconButton>
              </Box>
            </Box>

            <FormControl 
              component="fieldset" 
              sx={{ 
                mb: 3, 
                width: '100%',
                '& .MuiFormLabel-root': {
                  fontWeight: 'medium',
                  color: theme.palette.primary.main
                }
              }}
            >
              <FormLabel component="legend">Account Type</FormLabel>
              <RadioGroup
                row
                aria-label="account-type"
                name="account-type"
                value={userType}
                onChange={handleUserTypeChange}
                sx={{
                  '& .MuiRadio-root': {
                    color: alpha(theme.palette.primary.main, 0.7),
                    '&.Mui-checked': {
                      color: theme.palette.primary.main,
                    }
                  }
                }}
              >
                <FormControlLabel 
                  value="regular" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography>Individual</Typography>
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="business" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography>Business</Typography>
                    </Box>
                  } 
                />
              </RadioGroup>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="phoneNumber"
                  label="Phone Number"
                  name="phoneNumber"
                  autoComplete="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  variant="outlined"
                  error={!!formErrors.phoneNumber}
                  helperText={formErrors.phoneNumber}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  variant="outlined"
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  variant="outlined"
                  error={!!formErrors.confirmPassword}
                  helperText={formErrors.confirmPassword}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ 
              my: 3,
              '&::before, &::after': {
                borderColor: alpha(theme.palette.primary.main, 0.3),
              }
            }}>
              <Box 
                sx={{ 
                  px: 2, 
                  display: 'flex', 
                  alignItems: 'center',
                  color: theme.palette.primary.main
                }}
              >
                <PawsIcon 
                  fontSize="small" 
                  sx={{ 
                    mr: 1,
                    animation: `${pulse} 2s infinite ease-in-out`
                  }} 
                />
                <Typography variant="body2" fontWeight="medium">
                  {userType === 'regular' ? 'Personal Information' : 'Business Information'}
                </Typography>
              </Box>
            </Divider>

            {userType === 'regular' ? (
              // Individual user fields
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    name="firstName"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    variant="outlined"
                    error={!!formErrors.firstName}
                    helperText={formErrors.firstName}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    variant="outlined"
                    error={!!formErrors.lastName}
                    helperText={formErrors.lastName}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
              </Grid>
            ) : (
              // Business user fields
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="businessName"
                    label="Business Name"
                    name="businessName"
                    autoComplete="organization"
                    value={formData.businessName}
                    onChange={handleChange}
                    variant="outlined"
                    error={!!formErrors.businessName}
                    helperText={formErrors.businessName}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <FormLabel component="legend">Business Type</FormLabel>
                    <RadioGroup
                      row
                      aria-label="business-type"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                    >
                      <FormControlLabel value="shelter" control={<Radio />} label="Animal Shelter" />
                      <FormControlLabel value="shop" control={<Radio />} label="Pet Shop" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="address"
                    label="Street Address"
                    name="address"
                    autoComplete="street-address"
                    value={formData.address}
                    onChange={handleChange}
                    variant="outlined"
                    error={!!formErrors.address}
                    helperText={formErrors.address}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    id="city"
                    label="City"
                    name="city"
                    autoComplete="address-level2"
                    value={formData.city}
                    onChange={handleChange}
                    variant="outlined"
                    error={!!formErrors.city}
                    helperText={formErrors.city}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    id="state"
                    label="State"
                    name="state"
                    autoComplete="address-level1"
                    value={formData.state}
                    onChange={handleChange}
                    variant="outlined"
                    error={!!formErrors.state}
                    helperText={formErrors.state}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    id="zipCode"
                    label="Zip Code"
                    name="zipCode"
                    autoComplete="postal-code"
                    value={formData.zipCode}
                    onChange={handleChange}
                    variant="outlined"
                    error={!!formErrors.zipCode}
                    helperText={formErrors.zipCode}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                
                {/* License information fields */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="licenseNumber"
                    label="License Number"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    variant="outlined"
                    error={!!formErrors.licenseNumber}
                    helperText={formErrors.licenseNumber}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="licenseExpiry"
                    label="License Expiry Date"
                    name="licenseExpiry"
                    type="date"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    value={formData.licenseExpiry}
                    onChange={handleChange}
                    variant="outlined"
                    error={!!formErrors.licenseExpiry}
                    helperText={formErrors.licenseExpiry}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="taxId"
                    label="Tax ID / EIN"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    variant="outlined"
                    error={!!formErrors.taxId}
                    helperText={formErrors.taxId}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
              </Grid>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                mt: 4, 
                mb: 2, 
                py: 1.5, 
                borderRadius: 8,
                fontWeight: 'bold',
                fontSize: '1.1rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
            
            <Grid container justifyContent="center">
              <Grid item>
                <Link 
                  component={RouterLink} 
                  to="/login" 
                  variant="body2"
                  sx={{ 
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontWeight: 'medium',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Already have an account? Sign In
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        {/* Decorative paw prints */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: -20, 
          left: 20, 
          color: theme.palette.primary.light,
          opacity: 0.2,
          transform: 'rotate(-15deg)'
        }}>
          <PawsIcon sx={{ fontSize: 30 }} />
        </Box>
        <Box sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 20, 
          color: theme.palette.secondary.light,
          opacity: 0.2,
          transform: 'rotate(45deg)'
        }}>
          <PawsIcon sx={{ fontSize: 40 }} />
        </Box>
        <Box sx={{ 
          position: 'absolute', 
          top: '40%', 
          left: -10, 
          color: alpha(theme.palette.primary.main, 0.3),
          opacity: 0.2,
          transform: 'rotate(20deg)'
        }}>
          <PawsIcon sx={{ fontSize: 25 }} />
        </Box>
      </Container>
    </Box>
  );
}

export default Register; 