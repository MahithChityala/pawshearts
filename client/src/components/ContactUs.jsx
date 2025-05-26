import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex',
        minHeight: '100vh',
        background: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left 5% empty section */}
      <Box sx={{ width: '5%' }} />

      {/* Left 20% section with fur-babies image */}
      <Box 
        sx={{ 
          width: '20%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          position: 'relative',
          pr: 2
        }}
      >
        <Box
          component="img"
          src="/images/fur-babies.png"
          sx={{
            width: '100%',
            height: 'auto',
            objectFit: 'contain',
            maxWidth: '300px'
          }}
        />
      </Box>

      {/* Middle 50% section with contact form */}
      <Box 
        sx={{ 
          width: '50%',
          py: 4,
          px: 4,
        }}
      >
        <Box 
          sx={{ 
            textAlign: 'center',
            mb: 2,
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#FF8C3B',
              fontWeight: 400,
              fontSize: '2rem',
              mb: 1
            }}
          >
            <span style={{ color: '#6B4CD5' }}>🐾</span> Get in Touch <span style={{ color: '#6B4CD5' }}>🐾</span>
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#666',
              fontSize: '1rem'
            }}
          >
            We'd love to hear from you! Drop us a message.
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: '100%',
            bgcolor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.05)',
            p: 3,
          }}
        >
          <TextField
            fullWidth
            placeholder="Your Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#f5f5f5',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: 'none',
                },
                '&.Mui-focused fieldset': {
                  border: 'none',
                },
              }
            }}
          />
          <TextField
            fullWidth
            placeholder="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#f5f5f5',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: 'none',
                },
                '&.Mui-focused fieldset': {
                  border: 'none',
                },
              }
            }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Your Message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#f5f5f5',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: 'none',
                },
                '&.Mui-focused fieldset': {
                  border: 'none',
                },
              }
            }}
          />
          <Button
            type="submit"
            fullWidth
            sx={{
              py: 1.5,
              bgcolor: '#FF8C3B',
              color: '#fff',
              borderRadius: '50px',
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                bgcolor: '#ff7b1c',
              }
            }}
          >
            Send Message →
          </Button>
        </Box>
      </Box>

      {/* Right 20% section with dog-cat duo image */}
      <Box 
        sx={{ 
          width: '25%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          position: 'relative',
          pl: 2
        }}
      >
        <Box
          component="img"
          src="/images/image.png"
          sx={{
            width: '100%',
            height: '40%',
            objectFit: 'contain',
            maxWidth: '300px'
          }}
        />
      </Box>

      {/* Right 5% empty section */}
      <Box sx={{ width: '5%' }} />
    </Box>
  );
};

export default ContactUs; 