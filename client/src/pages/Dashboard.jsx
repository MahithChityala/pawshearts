import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Avatar, 
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import PetsIcon from '@mui/icons-material/Pets';
import ArticleIcon from '@mui/icons-material/Article';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import HomeIcon from '@mui/icons-material/Home';
import MyPets from '../components/MyPets';
import MyAdoptions from '../components/MyAdoptions';
import MyBlogs from '../components/MyBlogs';
import MyOrders from '../components/MyOrders';
import AdoptionRequests from './AdoptionRequests';
import Overview from '../components/dashboard/Overview';
import backgroundPattern from '../images/background-pattern.jpg';

// TabPanel component for tab content
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <div>{children}</div>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [value, setValue] = useState(0);
  const isBusiness = user?.userType === 'business';

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  // Get first letter of name for avatar fallback
  const getInitial = () => {
    const firstName = user?.firstName || user?.businessName || user?.name || '';
    console.log('Getting initial from:', firstName);
    return firstName.charAt(0) || 'U';
  };

  // Format date to display member since
  const formatMemberSince = () => {
    if (!user?.createdAt) return 'April 2025'; // Fallback date
    const date = new Date(user.createdAt);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Get display name
  const getDisplayName = () => {
    if (user?.userType === 'regular') {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user?.businessName || user?.name || 'User';
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Define tabs based on user type
  const tabs = [
    {
      icon: <HomeIcon />,
      label: "Overview",
      index: 0
    },
    {
      icon: <PetsIcon />,
      label: isBusiness ? "My Pets" : "My Adoptions",
      index: 1
    },
    {
      icon: <ArticleIcon />,
      label: "My Blogs",
      index: 2
    },
    {
      icon: <ShoppingBagIcon />,
      label: isBusiness ? "Adoption Requests" : "My Orders",
      index: 3
    }
  ];

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography>Loading profile...</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{
      background: '#fce8f3',
      minHeight: '100vh',
      pt: 8,
      pb: 6,
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `url(${backgroundPattern})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        opacity: 0.6,
        zIndex: 0,
      }
    }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Profile Section */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            mb: 3,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 30px rgba(255, 159, 159, 0.2)',
            }
          }}
        >
          {/* Edit Profile Button */}
          <IconButton 
            sx={{ 
              position: 'absolute',
              top: 20,
              right: 20,
              color: '#F4A261',
              bgcolor: 'rgba(244, 162, 97, 0.1)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: 'rgba(244, 162, 97, 0.2)',
                transform: 'scale(1.05)',
              },
              '& .MuiSvgIcon-root': {
                transition: 'transform 0.2s ease-in-out',
              },
              '&:hover .MuiSvgIcon-root': {
                transform: 'rotate(15deg)',
              }
            }}
            onClick={handleEditProfile}
          >
            <EditIcon /> <Typography sx={{ ml: 1, color: '#F4A261' }}>Edit Profile</Typography>
          </IconButton>

          {/* Profile Header */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 2
          }}>
            <Avatar
              src={user?.profilePicture || '/default-profile.jpg'}
              sx={{
                width: 140,
                height: 140,
                bgcolor: '#F4A261',
                fontSize: '3.5rem',
                mb: 3,
                border: '4px solid #fff',
                boxShadow: '0 4px 20px rgba(244, 162, 97, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: 'float 3s ease-in-out infinite',
                '@keyframes float': {
                  '0%': {
                    transform: 'translateY(0px)',
                  },
                  '50%': {
                    transform: 'translateY(-10px)',
                  },
                  '100%': {
                    transform: 'translateY(0px)',
                  },
                },
                '&:hover': {
                  transform: 'scale(1.05) rotate(5deg)',
                  boxShadow: '0 8px 30px rgba(244, 162, 97, 0.3)',
                }
              }}
            >
              {getInitial()}
            </Avatar>
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#F4A261', 
                fontWeight: 600,
                textShadow: '1px 1px 1px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  textShadow: '2px 2px 4px rgba(244, 162, 97, 0.3)',
                }
              }}
            >
              {getDisplayName()}
        </Typography>
      </Box>
        </Paper>

        {/* Dashboard Tabs */}
        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: '24px',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 30px rgba(255, 159, 159, 0.15)',
            }
          }}
        >
          <Box>
            <Tabs 
              value={value} 
              onChange={handleChange} 
              aria-label="dashboard tabs"
              variant="fullWidth"
              sx={{
                bgcolor: '#fff',
                borderBottom: '1px solid rgba(244, 162, 97, 0.1)',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '1rem',
                  minHeight: '64px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    width: 0,
                    height: '3px',
                    backgroundColor: '#F4A261',
                    transition: 'all 0.3s ease',
                    transform: 'translateX(-50%)',
                    borderRadius: '3px 3px 0 0',
                  },
                  '&.Mui-selected': {
                    color: '#F4A261',
                    fontWeight: 600,
                    '&::after': {
                      width: '80%',
                    },
                    '& .MuiSvgIcon-root': {
                      transform: 'scale(1.2) rotate(360deg)',
                    }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(244, 162, 97, 0.05)',
                    '& .MuiSvgIcon-root': {
                      transform: 'scale(1.1) rotate(10deg)',
                    }
                  },
                  '& .MuiTab-iconWrapper': {
                    marginRight: '8px',
                    marginBottom: '0 !important',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }
                },
                '& .MuiTabs-indicator': {
                  display: 'none'
                }
              }}
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.index}
                  icon={tab.icon}
                  iconPosition="start"
                  label={tab.label}
                  {...a11yProps(tab.index)}
                />
              ))}
            </Tabs>
          </Box>

          <Box 
            sx={{ 
              mt: 2, 
              p: 2,
              transition: 'all 0.3s ease',
              transform: 'translateY(0)',
              opacity: 1,
              '&[hidden]': {
                transform: 'translateY(20px)',
                opacity: 0,
              }
            }}
          >
            <TabPanel value={value} index={0}>
              <Overview user={user} formatMemberSince={formatMemberSince} />
            </TabPanel>

            <TabPanel value={value} index={1}>
              {isBusiness ? <MyPets /> : (
                <Box>
                  <MyAdoptions />
                  <Box mt={4}>
                    <MyPets />
                  </Box>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={value} index={2}>
              <MyBlogs />
            </TabPanel>

            <TabPanel value={value} index={3}>
              {isBusiness ? <AdoptionRequests /> : <MyOrders />}
            </TabPanel>
        </Box>
      </Paper>
    </Container>
    </Box>
  );
};

export default Dashboard; 