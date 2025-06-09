import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { format } from 'date-fns';

// Helper function to format address
const formatAddress = (address) => {
  if (!address || !address.street || !address.city || !address.state || !address.zipCode) {
    return 'No address provided';
  }
  const { street, city, state, country = 'United States', zipCode } = address;
  return `${street}, ${city}, ${state}, ${country} ${zipCode}`;
};

// Color palette constants
const colors = {
  primary: '#FF9B9B',         // Soft coral
  secondary: '#00C4B4',       // Soft teal
  accent: '#FFB562',          // Soft orange
  neutral: '#666666',         // Soft gray
  background: '#FFFFFF',      // Pure white
  pink: 'rgba(255, 192, 192, 0.08)',   // Very light pink
  mint: 'rgba(0, 196, 180, 0.08)',     // Very light mint
  textPink: '#FF7E7E',       // Text pink
  textMint: '#00B8A9',       // Text mint
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
};

const Overview = ({ user, formatMemberSince }) => {
  return (
    <Box sx={{
      background: 'linear-gradient(120deg, #FFF8F8 0%, #F8FFFD 100%)',
      minHeight: '100%',
      p: 3,
      borderRadius: '20px',
      boxShadow: 'inset 0 0 20px rgba(255, 192, 192, 0.05)',
    }}>
      <Grid container spacing={4}>
        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              background: colors.pink,
              borderRadius: '16px',
              height: '100%',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: colors.boxShadow,
              }
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                color: colors.textPink, 
                mb: 3,
                fontWeight: 500,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                '&::before': {
                  content: '""',
                  width: '3px',
                  height: '20px',
                  background: colors.textPink,
                  borderRadius: '4px',
                  marginRight: '12px',
                },
              }}
            >
              Contact Information
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { icon: <EmailIcon />, value: user?.email || 'No email provided' },
                { icon: <PhoneIcon />, value: user?.phoneNumber || 'No phone number provided' },
                { icon: <LocationOnIcon />, value: formatAddress(user?.address) }
              ].map((item, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 2,
                    background: colors.background,
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: colors.boxShadow,
                    }
                  }}
                >
                  <Box sx={{ 
                    p: 1,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {React.cloneElement(item.icon, { 
                      sx: { 
                        color: colors.textPink,
                        fontSize: '1.2rem',
                      } 
                    })}
                  </Box>
                  <Typography sx={{ 
                    color: colors.neutral,
                    fontSize: '0.9rem'
                  }}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Pet Parent Information */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              background: colors.mint,
              borderRadius: '16px',
              height: '100%',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: colors.boxShadow,
              }
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                color: colors.textMint, 
                mb: 3,
                fontWeight: 500,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                '&::before': {
                  content: '""',
                  width: '3px',
                  height: '20px',
                  background: colors.textMint,
                  borderRadius: '4px',
                  marginRight: '12px',
                },
              }}
            >
              Pet Parent Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ 
                p: 2,
                background: colors.background,
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: colors.boxShadow,
                }
              }}>
                {[
                  { label: 'Account Type', value: user?.userType === 'business' ? 'Business' : 'Regular User' },
                  { label: 'Member Since', value: formatMemberSince() }
                ].map((item, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: index === 0 ? 2 : 0,
                    }}
                  >
                    <Typography sx={{ 
                      color: colors.neutral,
                      fontSize: '0.9rem'
                    }}>
                      {item.label}
                    </Typography>
                    <Typography sx={{ 
                      color: colors.textMint,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview; 