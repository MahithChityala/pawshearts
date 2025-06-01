import React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  Badge,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PetsIcon from '@mui/icons-material/Pets';
import HomeIcon from '@mui/icons-material/Home';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { alpha } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import LogoutIcon from '@mui/icons-material/Logout';
import ArticleIcon from '@mui/icons-material/Article';
import GroupsIcon from '@mui/icons-material/Groups';

// Create cute animations
const wag = keyframes`
  0%, 100% { transform: rotate(-8deg); }
  50% { transform: rotate(8deg); }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const sparkle = keyframes`
  0% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
  100% { opacity: 0; transform: scale(0) rotate(360deg); }
`;

const rainbow = keyframes`
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
`;

const glow = keyframes`
  0%, 100% { text-shadow: 0 0 10px rgba(255,255,255,0.3), 0 0 20px rgba(255,255,255,0.2), 0 0 30px rgba(255,255,255,0.1); }
  50% { text-shadow: 0 0 20px rgba(255,255,255,0.5), 0 0 30px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.2); }
`;

const Navbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  const handleProfileNav = () => {
    handleClose();
    navigate('/dashboard');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        background: 'linear-gradient(180deg, rgba(20,20,35,0.95) 0%, rgba(30,30,45,0.95) 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
        borderBottom: '2px solid',
        borderImage: `linear-gradient(to right, 
          ${alpha(theme.palette.primary.main, 0.7)}, 
          ${alpha(theme.palette.secondary.main, 0.7)}) 1`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, 
            ${alpha(theme.palette.primary.main, 0.8)}, 
            ${alpha(theme.palette.secondary.main, 0.8)})`,
          animation: `${rainbow} 10s linear infinite`
        }
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            animation: `${bounce} 4s infinite ease-in-out`,
            cursor: 'pointer',
            '&:hover': {
              '& .logo-icon': {
                animation: `${wag} 0.5s infinite ease-in-out`,
              },
              '& .logo-text': {
                color: theme.palette.primary.light,
                transform: 'scale(1.05)',
                animation: `${glow} 2s infinite ease-in-out`,
              }
            }
          }}
          onClick={() => navigate('/')}
        >
          <IconButton
            edge="start"
            aria-label="menu"
            className="logo-icon"
            sx={{ 
              mr: 1,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '150%',
                height: '150%',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.3)} 0%, transparent 70%)`,
                animation: `${pulse} 3s infinite ease-in-out`,
              }
            }}
          >
            <PetsIcon 
              sx={{ 
                color: theme.palette.primary.light,
                fontSize: '2.2rem',
                filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))',
              }} 
            />
          </IconButton>
          
          <Typography 
            variant="h6" 
            className="logo-text"
            sx={{
              color: '#fff',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              textShadow: '0 0 10px rgba(255,255,255,0.2)',
              mr: 4,
              letterSpacing: '1px',
              fontFamily: 'Doggies-Silhouette-Font, sans-serif',
            }}
          >
            PawsHearts
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          {[
            { path: '/', icon: <HomeIcon />, label: 'Home' },
            { path: '/pets', icon: <PetsIcon />, label: 'Adopt' },
            { path: '/services', icon: <LocalHospitalIcon />, label: 'Services' },
            { path: '/blogs', icon: <ArticleIcon sx={{ mr: 1 }} />, label: 'Blogs' },
            { path: '/communities', icon: <GroupsIcon />, label: 'Communities' },
            ...(user?.userType === 'business' ? [{ path: '/add-pet', icon: null, label: 'Add Pet' }] : [])
          ].map((item) => (
            <Button
              key={item.path}
              color="inherit"
              onClick={() => navigate(item.path)}
              startIcon={item.icon}
              sx={{
                color: '#fff',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  width: isActive(item.path) ? '100%' : '0%',
                  height: '2px',
                  background: `linear-gradient(90deg, 
                    ${alpha(theme.palette.primary.main, 0.8)}, 
                    ${alpha(theme.palette.secondary.main, 0.8)})`,
                  transform: isActive(item.path) ? 'translateX(-50%)' : 'translateX(-50%)',
                  transition: 'width 0.3s ease',
                },
                '&:hover::after': {
                  width: '100%',
                }
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={handleMenu}
              sx={{
                color: '#fff',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              <Avatar
                src={user?.profilePicture || '/default-profile.png'}
                alt={user?.name}
                sx={{
                  width: 40,
                  height: 40,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                  boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                  fontWeight: 'bold',
                  fontSize: 20,
                  bgcolor: theme.palette.primary.main,
                  color: '#fff',
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || user?.businessName?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              sx={{
                '& .MuiPaper-root': {
                  background: 'rgba(20,20,35,0.98)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                  minWidth: 220,
                  borderRadius: 3,
                  p: 0,
                }
              }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 2,
                pb: 1,
                borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`
              }}>
                <Avatar
                  src={user?.profilePicture || '/default-profile.png'}
                  alt={user?.name}
                  sx={{ width: 56, height: 56, mb: 1, fontWeight: 'bold', fontSize: 28, bgcolor: theme.palette.primary.main, color: '#fff' }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || user?.businessName?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: 16, mb: 0.5, textAlign: 'center' }}>
                  {user?.name || user?.businessName || 'User'}
                </Typography>
                <Typography sx={{ color: alpha('#fff', 0.7), fontSize: 13, mb: 0.5, textAlign: 'center' }}>
                  {user?.email}
                </Typography>
              </Box>
              <Box sx={{ py: 1 }}>
                <MenuItem onClick={handleProfileNav} sx={{ color: '#fff', fontWeight: 500, fontSize: 15, borderRadius: 2, mx: 1, my: 0.5, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) } }}>
                  <HomeIcon sx={{ mr: 1, fontSize: 20, color: theme.palette.primary.main }} /> Dashboard
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: '#fff', fontWeight: 500, fontSize: 15, borderRadius: 2, mx: 1, my: 0.5, '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.12) } }}>
                  <LogoutIcon sx={{ mr: 1, fontSize: 20, color: theme.palette.error.main }} /> Logout
                </MenuItem>
              </Box>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              onClick={() => navigate('/login')}
              sx={{
                color: '#fff',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/register')}
              sx={{
                background: `linear-gradient(45deg, 
                  ${theme.palette.primary.main} 0%, 
                  ${theme.palette.secondary.main} 100%)`,
                '&:hover': {
                  background: `linear-gradient(45deg, 
                    ${theme.palette.primary.dark} 0%, 
                    ${theme.palette.secondary.dark} 100%)`,
                }
              }}
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 