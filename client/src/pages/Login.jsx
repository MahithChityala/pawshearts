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
  useTheme,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import PetsIcon from '@mui/icons-material/Pets';
import FavoriteIcon from '@mui/icons-material/Favorite';
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

const wag = keyframes`
  0% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
  100% { transform: rotate(-5deg); }
`;

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      const result = await login(formData.email, formData.password);
      if (result.success) {
        await new Promise(resolve => setTimeout(resolve, 100));
        navigate('/');
      } else {
        // Handle specific error messages
        if (result.error.toLowerCase().includes('email')) {
          setFormErrors({ 
            email: 'Invalid email' 
          });
        } else if (result.error.toLowerCase().includes('password')) {
          setFormErrors({ 
            password: 'Invalid password' 
          });
        } else if (result.error.toLowerCase().includes('invalid')) {
          setFormErrors({ 
            email: 'Invalid email',
            password: 'Invalid password'
          });
        } else {
          setError('Invalid credentials');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.data?.errors) {
        const serverErrors = err.response.data.errors;
        setFormErrors(serverErrors);
        setError('Please fix the errors in the form');
      } else if (err.response?.status === 401) {
        setFormErrors({ 
          password: 'Invalid password' 
        });
      } else if (err.response?.status === 404) {
        setFormErrors({ 
          email: 'Invalid email' 
        });
      } else {
        setError('Invalid credentials');
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
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(circle, ${theme.palette.background.default} 0%, ${theme.palette.grey[100]} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        py: 4,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#FFD6E0',
          opacity: 0.6,
          animation: `${float} 6s infinite ease-in-out`,
          zIndex: 0
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#D4F0F0',
          opacity: 0.6,
          animation: `${float} 8s infinite ease-in-out`,
          zIndex: 0
        }
      }}
    >
      <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={5}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 4,
            width: '100%',
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
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
            }}
          >
            <Box sx={{ 
              position: 'relative', 
              mb: 1,
              animation: `${pulse} 3s infinite ease-in-out`,
            }}>
              <PetsIcon sx={{ 
                color: theme.palette.primary.main, 
                fontSize: 50,
                animation: `${wag} 2s infinite ease-in-out`,
                transform: 'translateZ(0)' // For better performance
              }} />
              <FavoriteIcon sx={{ 
                position: 'absolute',
                bottom: -5,
                right: -10,
                color: theme.palette.secondary.main,
                fontSize: 20,
                animation: `${pulse} 2s infinite ease-in-out`,
                transform: 'translateZ(0)' // For better performance
              }} />
            </Box>
            <Typography 
              component="h1" 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                textAlign: 'center',
                mb: 1
              }}
            >
              Sign in to Paws & Hearts
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ textAlign: 'center', mb: 2 }}
            >
              Welcome back, we missed you!
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%', borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5, 
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                }
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            <Grid container justifyContent="center">
              <Grid item>
                <Link 
                  component={RouterLink} 
                  to="/register" 
                  variant="body2"
                  sx={{ 
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        {/* Decorative paw prints */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: -20, 
          left: 10, 
          color: theme.palette.primary.light,
          opacity: 0.2,
          transform: 'rotate(-15deg)'
        }}>
          <PetsIcon sx={{ fontSize: 30 }} />
        </Box>
        <Box sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          color: theme.palette.secondary.light,
          opacity: 0.2,
          transform: 'rotate(45deg)'
        }}>
          <PetsIcon sx={{ fontSize: 40 }} />
        </Box>
      </Container>
    </Box>
  );
}

export default Login; 