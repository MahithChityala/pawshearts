import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  Paper,
  Link,
  Avatar,
  TextField,
  CircularProgress,
  Alert,
  CardMedia,
} from '@mui/material';
import {
  Pets as PetsIcon,
  Favorite as FavoriteIcon,
  Search as SearchIcon,
  VolunteerActivism as VolunteerIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Comment as CommentIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import Wave from '../components/Wave';
import CustomCursor from '../components/CustomCursor';
import axios from 'axios';
import { format } from 'date-fns';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { API_URL } from '../config';

// Hero image URL
const heroImage = 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2560&q=80';

// Fun animations
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const wag = keyframes`
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(15deg); }
  75% { transform: rotate(-15deg); }
`;

const bounce = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

const sparkle = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
`;

const wiggle = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
  75% { transform: rotate(-5deg); }
  100% { transform: rotate(0deg); }
`;

const pawPrints = [
  { top: '5%', left: '8%', rotation: '45deg' },
  { top: '20%', right: '12%', rotation: '-30deg' },
  { bottom: '15%', left: '15%', rotation: '15deg' },
  { bottom: '30%', right: '8%', rotation: '-15deg' },
];

const features = [
  {
    title: 'Find Your Perfect Pet',
    description: 'Browse through our collection of adorable pets looking for their forever homes.',
    icon: <SearchIcon sx={{ fontSize: 40 }} />,
    color: '#FF6B6B',
  },
  {
    title: 'Adopt with Love',
    description: 'Give a loving home to a pet in need and experience the joy of pet companionship.',
    icon: <FavoriteIcon sx={{ fontSize: 40 }} />,
    color: '#4ECDC4',
  },
  {
    title: 'Support Pet Welfare',
    description: 'Join our community in making a difference in the lives of pets everywhere.',
    icon: <VolunteerIcon sx={{ fontSize: 40 }} />,
    color: '#45B7D1',
  },
];

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Advanced scroll animations
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  // Parallax effects
  const y = useMotionValue(0);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  
  // Mouse position for interactive animations
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        console.log('Fetching blogs from:', `${API_URL}/blogs`); // Debug log
        const response = await axios.get(`${API_URL}/blogs`, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        });
        console.log('Response:', response.data); // Debug log
        // Sort blogs by date and take only the 3 most recent ones
        const sortedBlogs = response.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        ).slice(0, 3);
        setBlogs(sortedBlogs);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        console.error('API URL used:', `${API_URL}/blogs`); // Debug log
        setError('Failed to fetch blogs');
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <Box>
      <CustomCursor />
      
      {/* Hero Section with advanced animations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{ y }}
      >
        <Box
          sx={{
            position: 'relative',
            height: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Animated background elements */}
          <motion.div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.1) 0%, transparent 50%)',
              opacity: 0.5,
            }}
            animate={{
              '--mouse-x': mouseX,
              '--mouse-y': mouseY,
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 30 }}
          />

          {/* Decorative paw prints with advanced animations */}
          {pawPrints.map((style, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0, rotate: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                rotate: 360,
                x: [0, 10, -10, 0],
                y: [0, -10, 10, 0],
              }}
              transition={{ 
                duration: 2,
                delay: index * 0.2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <PetsIcon
                sx={{
                  position: 'absolute',
                  ...style,
                  fontSize: '3rem',
                  color: alpha(theme.palette.primary.main, 0.1),
                  transform: `rotate(${style.rotation})`,
                  zIndex: 1,
                }}
              />
            </motion.div>
          ))}
          
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.2,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ scale: 1.05 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                  fontWeight: 'bold',
                  mb: 2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  fontFamily: 'Doggies-Silhouette-Font, sans-serif !important',
                  color: '#FFFACD',
                  letterSpacing: '2px',
                }}
              >
                Welcome to PawsHearts
              </Typography>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.4,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ scale: 1.02 }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  mb: 4,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                  fontFamily: 'Doggies-Silhouette-Font, sans-serif !important',
                  color: '#FFEFD5',
                  letterSpacing: '1px',
                }}
              >
                Where Love Finds Its Home
              </Typography>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.6,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.1,
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/pets')}
                sx={{
                  bgcolor: '#FF9F5A',
                  fontSize: '1.1rem',
                  py: 2,
                  px: 4,
                  borderRadius: 30,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#ff8c3b',
                    animation: `${wiggle} 0.5s ease-in-out`,
                  },
                }}
              >
                Browse Pets
              </Button>
            </motion.div>
          </Container>
          <Wave />
        </Box>
      </motion.div>

      {/* Features Section with advanced animations */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ 
            duration: 0.6,
            type: "spring",
            stiffness: 100
          }}
        >
          <Typography
            variant="h3"
            align="center"
            sx={{
              mb: 6,
              color: theme.palette.primary.main,
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '4px',
                backgroundColor: theme.palette.secondary.main,
                borderRadius: '2px',
              }
            }}
          >
            Why Choose Us?
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -10,
                  transition: { duration: 0.5 }
                }}
              >
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'visible',
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: alpha(feature.color, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <Box sx={{ color: feature.color }}>{feature.icon}</Box>
                    </Box>
                    <Typography variant="h5" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                  <PetsIcon 
                    sx={{ 
                      position: 'absolute',
                      top: -15,
                      right: -15,
                      color: alpha(feature.color, 0.2),
                      fontSize: '2rem',
                    }} 
                  />
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Latest Updates Section */}
      <Box sx={{ 
        my: 8, 
        position: 'relative',
        background: 'linear-gradient(135deg, #FFF5F7 0%, #FFF 100%)',
        py: 8,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FF9F5A' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat`,
          opacity: 0.5,
          zIndex: 0,
        }
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ 
              textAlign: 'center',
              mb: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Typography 
                variant="subtitle1" 
                component="p"
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 600,
                  mb: 2,
                  display: 'inline-block',
                  background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
                  px: 3,
                  py: 0.5,
                  borderRadius: '20px',
                  boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)',
                }}
              >
                Our Blog
              </Typography>
              <Typography 
                variant="h3" 
                component="h2"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  color: '#2B2B2B',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  display: 'inline-block',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 80,
                    height: 3,
                    background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
                    borderRadius: '10px',
                  }
                }}
              >
                Latest Updates
              </Typography>
            </Box>
          </motion.div>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress sx={{ color: '#FF6B6B' }} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
          ) : (
            <>
              <Grid container spacing={4}>
                {blogs.map((blog, index) => (
                  <Grid item xs={12} md={4} key={blog._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.2 }}
                      whileHover={{ y: -10 }}
                    >
                      <Card 
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.3s ease-in-out',
                          borderRadius: '20px',
                          overflow: 'hidden',
                          boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                          position: 'relative',
                          '&:hover': {
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                            '& .blog-image': {
                              transform: 'scale(1.1)',
                            }
                          },
                        }}
                      >
                        <Box sx={{ position: 'relative', overflow: 'hidden', pt: '60%' }}>
                          <CardMedia
                            component="img"
                            image={blog.image ? `http://localhost:5000/uploads/${blog.image}` : 'default-blog-image.jpg'}
                            alt={blog.title}
                            className="blog-image"
                            sx={{ 
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease-in-out',
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                              p: 2,
                            }}
                          >
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                color: 'white',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                                fontWeight: 600,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {blog.title}
                            </Typography>
                          </Box>
                        </Box>
                        <CardContent sx={{ 
                          flexGrow: 1, 
                          p: 3,
                          background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 2,
                            pb: 2,
                            borderBottom: '1px solid rgba(0,0,0,0.08)',
                          }}>
                            <Avatar
                              src={blog.author.profilePicture}
                              alt={blog.author.name}
                              sx={{ 
                                width: 40, 
                                height: 40, 
                                mr: 2,
                                border: '2px solid #FF6B6B',
                                boxShadow: '0 2px 8px rgba(255,107,107,0.2)',
                              }}
                            />
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2B2B2B' }}>
                                {blog.author.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {format(new Date(blog.createdAt), 'MMM d, yyyy')}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography 
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              mb: 2,
                              lineHeight: 1.6,
                              fontSize: '0.95rem',
                            }}
                          >
                            {blog.content}
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mt: 'auto',
                            pt: 2,
                            borderTop: '1px solid rgba(0,0,0,0.08)',
                          }}>
                            <Button 
                              onClick={() => navigate(`/blogs/${blog._id}`)}
                              endIcon={<ArrowForwardIcon />}
                              sx={{
                                color: '#FF6B6B',
                                fontWeight: 600,
                                '&:hover': {
                                  backgroundColor: 'rgba(255,107,107,0.08)',
                                  transform: 'translateX(5px)',
                                },
                                transition: 'all 0.2s ease-in-out',
                              }}
                            >
                              Read More
                            </Button>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                background: 'rgba(255,107,107,0.1)',
                                borderRadius: '20px',
                                px: 1.5,
                                py: 0.5,
                              }}>
                                <FavoriteIcon sx={{ fontSize: 16, mr: 0.5, color: '#FF6B6B' }} />
                                <Typography variant="caption" sx={{ color: '#FF6B6B', fontWeight: 600 }}>
                                  {blog.likes?.length || 0}
                                </Typography>
                              </Box>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                background: 'rgba(0,0,0,0.05)',
                                borderRadius: '20px',
                                px: 1.5,
                                py: 0.5,
                              }}>
                                <CommentIcon sx={{ fontSize: 16, mr: 0.5, color: '#666' }} />
                                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                                  {blog.comments?.length || 0}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/blogs')}
                    sx={{
                      borderRadius: '50px',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                      boxShadow: '0 3px 10px rgba(255, 107, 107, 0.3)',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #FF5252 30%, #FF7043 90%)',
                        boxShadow: '0 5px 15px rgba(255, 107, 107, 0.4)',
                      },
                    }}
                  >
                    View All Posts
                  </Button>
                </Box>
              </motion.div>
            </>
          )}
        </Container>
      </Box>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Box
          sx={{
            position: 'relative',
            height: '80vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            backgroundImage: 'url(/images/blur.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              zIndex: 1,
            },
          }}
        >
          <Container 
            maxWidth="lg" 
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              pl: { xs: 2, md: 8 },
              position: 'relative',
              zIndex: 2,
            }}
          >
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  maxWidth: '600px',
                  color: 'white',
                  textShadow: '2px 2px 0px #ff8c3b, 3px 3px 0px #FF6B6B',
                  fontFamily: "'Trebuchet MS', sans-serif",
                  letterSpacing: '0.5px',
                }}
              >
                Want a pet for your loved ones?
              </Typography>
            </motion.div>
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  maxWidth: '500px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 1.6,
                  fontFamily: "'Trebuchet MS', sans-serif",
                  fontWeight: 300,
                }}
              >
                Looking for the perfect companion? We have a wonderful selection of pets waiting to bring joy and love to your family. Our adoption process is simple, caring, and focused on finding the best match for both you and your future pet.
              </Typography>
            </motion.div>
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/register')}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 30,
                  bgcolor: '#ff6b6b',
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: 'none',
                  fontFamily: "'Trebuchet MS', sans-serif",
                  fontWeight: 500,
                  '&:hover': {
                    bgcolor: '#ff4c4c',
                    boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)',
                  },
                }}
              >
                Apply Today
              </Button>
            </motion.div>
          </Container>
        </Box>
      </motion.div>

      {/* Contact Us Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Box
          sx={{
            py: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff7e6',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background Icons */}
          {[...Array(10)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <PetsIcon
                sx={{
                  position: 'absolute',
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  fontSize: '2.5rem',
                  color: alpha('#ff8c3b', 0.1),
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </motion.div>
          ))}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h3"
              sx={{
                color: '#ff8c3b',
                fontWeight: 'bold',
                mb: 4,
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <PetsIcon sx={{ fontSize: '2.5rem' }} />
              Get in Touch
              <PetsIcon sx={{ fontSize: '2.5rem' }} />
            </Typography>
          </motion.div>
          <Typography variant="body1" sx={{ mb: 6, color: '#555', maxWidth: '600px', textAlign: 'center' }}>
            We'd love to hear from you! Drop us a message.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 6,
              width: '100%',
              maxWidth: '1200px',
              px: 3,
            }}
          >
            {/* Contact Form */}
            <Paper
              elevation={3}
              sx={{
                flex: 1,
                p: 5,
                borderRadius: 3,
                bgcolor: '#fff',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                },
              }}
            >
              <form>
                <TextField
                  fullWidth
                  label="Your Name *"
                  name="name"
                  sx={{ mb: 3, bgcolor: '#fff', borderRadius: 1 }}
                />
                <TextField
                  fullWidth
                  label="Email Address *"
                  name="email"
                  type="email"
                  sx={{ mb: 3, bgcolor: '#fff', borderRadius: 1 }}
                />
                <TextField
                  fullWidth
                  label="Your Message *"
                  name="message"
                  multiline
                  rows={4}
                  sx={{ mb: 3, bgcolor: '#fff', borderRadius: 1 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    bgcolor: '#ff8c3b',
                    color: '#fff',
                    borderRadius: 30,
                    '&:hover': { bgcolor: '#e67e35' },
                  }}
                >
                  Send Message
                </Button>
              </form>
            </Paper>

            {/* Contact Details */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  bgcolor: '#fff3e0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                <EmailIcon sx={{ color: '#ff8c3b', fontSize: '2rem' }} />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Email Us
                  </Typography>
                  <Typography variant="body2">contact@pawshearts.com</Typography>
                </Box>
              </Paper>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  bgcolor: '#f0f4c3',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                <PhoneIcon sx={{ color: '#ff8c3b', fontSize: '2rem' }} />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Call Us
                  </Typography>
                  <Typography variant="body2">+1 (555) 123-4567</Typography>
                </Box>
              </Paper>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  bgcolor: '#c8e6c9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                <LocationIcon sx={{ color: '#ff8c3b', fontSize: '2rem' }} />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Visit Us
                  </Typography>
                  <Typography variant="body2">123 Pet Street, Pawsome City, PC 12345</Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Box
          sx={{
            bgcolor: '#333',
            color: 'white',
            py: 3,
            textAlign: 'center',
            mt: 0,
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="body2" sx={{ mb: 1 }}>
              © 2023 PawsHearts. All rights reserved.
            </Typography>
            <Typography variant="body2">
              <Link href="/privacy" color="inherit" sx={{ mx: 1 }}>
                Privacy Policy
              </Link>
              |
              <Link href="/terms" color="inherit" sx={{ mx: 1 }}>
                Terms of Service
              </Link>
              |
              <Link href="/contact" color="inherit" sx={{ mx: 1 }}>
                Contact Us
              </Link>
            </Typography>
          </Container>
        </Box>
      </motion.div>
    </Box>
  );
}

export default Home; 