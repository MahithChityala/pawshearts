import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Paper,
  alpha,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  ExpandMore as ExpandMoreIcon,
  Pets as PetsIcon,
  Favorite as FavoriteIcon,
  CreateRounded as CreateIcon,
  HistoryRounded as HistoryIcon,
  LocalFloristRounded as FlowerIcon,
  EmojiNatureRounded as ButterflyIcon,
  AutoAwesomeRounded as SparkleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { keyframes } from '@mui/system';
import { useAuth } from "../contexts/AuthContext";

// Create animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const sparkle = keyframes`
  0% { opacity: 0.2; transform: scale(1) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.2) rotate(45deg); }
  100% { opacity: 0.2; transform: scale(1) rotate(90deg); }
`;

const MyBlogs = () => {
  const { user, loading } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [expandedBlog, setExpandedBlog] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  // Define pastel colors for blog cards
  const cardColors = [
    '#FFD6E0', // Pink
    '#FFEFCF', // Yellow
    '#D4F0F0', // Teal
    '#E2F0CB', // Light green
    '#DAEAF6', // Light blue
    '#F8E1F4', // Lavender
  ];

  useEffect(() => {
    if (!loading && user) {
      fetchBlogs();
    }
  }, [loading, user]);

  const fetchBlogs = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/blogs/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setBlogs(data);
      } else {
        setError(data.message || 'Failed to fetch blogs');
      }
    } catch (err) {
      setError('Error fetching blogs');
      console.error('Error fetching blogs:', err);
    }
  };

  const handleDelete = async () => {
    if (!selectedBlog) return;

    try {
      const response = await fetch(`http://localhost:5000/api/blogs/${selectedBlog._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setBlogs(blogs.filter(blog => blog._id !== selectedBlog._id));
        setDeleteDialogOpen(false);
        setSelectedBlog(null);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete blog');
      }
    } catch (err) {
      setError('Error deleting blog');
      console.error(err);
    }
  };

  const handleAccordionChange = (blogId) => (event, isExpanded) => {
    setExpandedBlog(isExpanded ? blogId : null);
  };

  // Function to get icon based on blog content
  const getBlogIcon = (blog) => {
    if (blog.tags.some(tag => tag.toLowerCase().includes('cat') || tag.toLowerCase().includes('dog'))) {
      return <PetsIcon />;
    } else if (blog.tags.some(tag => tag.toLowerCase().includes('love'))) {
      return <FavoriteIcon />;
    } else if (blog.tags.some(tag => tag.toLowerCase().includes('nature'))) {
      return <ButterflyIcon />;
    } else if (blog.tags.some(tag => tag.toLowerCase().includes('garden'))) {
      return <FlowerIcon />;
    } else {
      return <SparkleIcon />;
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="200px"
        sx={{
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '100px',
            height: '100px',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.2)} 0%, transparent 70%)`,
            animation: `${pulse} 2s infinite ease-in-out`,
            borderRadius: '50%'
          }
        }}
      >
        <CircularProgress 
          sx={{ 
            color: theme.palette.secondary.main,
          }} 
        />
      </Box>
    );
  }

  if (!user) {
    return <Alert severity="error">Authentication required</Alert>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (blogs.length === 0) {
    return (
      <Box 
        textAlign="center" 
        sx={{ 
          position: 'relative',
          py: 5,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '10%',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#FFD6E0',
            animation: `${float} 5s infinite ease-in-out`,
            zIndex: -1
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '20%',
            right: '15%',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: '#D4F0F0',
            animation: `${float} 7s infinite ease-in-out`,
            zIndex: -1
          }
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            maxWidth: 500, 
            mx: 'auto',
            borderRadius: 4,
            background: 'linear-gradient(135deg, #FFF6F9 0%, #F0F8FF 100%)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -20,
              right: -20,
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #FFD6E0 0%, transparent 70%)',
              opacity: 0.6
            }
          }}
        >
          <Box sx={{ mb: 3, animation: `${float} 3s infinite ease-in-out` }}>
            <CreateIcon sx={{ fontSize: 60, color: '#F4A261' }} />
          </Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#2A9D8F' }}>
            Your Blog Journey Starts Here!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: '#555' }}>
            Share your thoughts, stories, and pet adventures with the world.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/blogs/add')}
            sx={{
              bgcolor: '#F4A261',
              borderRadius: 8,
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              boxShadow: '0 8px 16px rgba(244, 162, 97, 0.3)',
              transition: 'all 0.3s',
              animation: `${pulse} 2s infinite ease-in-out`,
              '&:hover': {
                bgcolor: '#E76F51',
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 20px rgba(231, 111, 81, 0.4)',
              }
            }}
            startIcon={<CreateIcon />}
          >
            Write Your First Blog
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '5%',
        left: '5%',
        width: '15px',
        height: '15px',
        borderRadius: '50%',
        backgroundColor: '#FFD6E0',
        animation: `${float} 6s infinite ease-in-out`,
        zIndex: -1
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '10%',
        right: '8%',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: '#E2F0CB',
        animation: `${float} 8s infinite ease-in-out`,
        zIndex: -1
      }
    }}>
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#2A9D8F',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <SparkleIcon 
            sx={{ 
              color: '#F4A261',
              animation: `${sparkle} 3s infinite ease-in-out`
            }} 
          />
          Your Creative Corner
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/blogs/add')}
          sx={{
            bgcolor: '#F4A261',
            borderRadius: '50px',
            px: 3,
            py: 1,
            boxShadow: '0 4px 8px rgba(244, 162, 97, 0.3)',
            transition: 'all 0.3s',
            '&:hover': {
              bgcolor: '#E76F51',
              transform: 'translateY(-3px) scale(1.05)',
              boxShadow: '0 8px 16px rgba(231, 111, 81, 0.4)',
            }
          }}
          startIcon={<CreateIcon />}
        >
          Write New Blog
        </Button>
      </Box>

      <Grid container spacing={3}>
        {blogs.map((blog, index) => (
          <Grid item xs={12} md={6} key={blog._id}>
            <Card 
              sx={{ 
                borderRadius: 4,
                boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                background: cardColors[index % cardColors.length],
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 16px 32px rgba(0,0,0,0.12)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '60px',
                  height: '60px',
                  borderRadius: '0 0 0 100%',
                  backgroundColor: alpha('#fff', 0.3)
                }
              }}
            >
              <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  mb: 2,
                  gap: 2
                }}>
                  <Box sx={{ 
                    width: 45, 
                    height: 45, 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: alpha('#fff', 0.7),
                    color: theme.palette.primary.main,
                    animation: `${float} 3s infinite ease-in-out`,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  }}>
                    {getBlogIcon(blog)}
                  </Box>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 'bold',
                        color: '#264653'
                      }}
                    >
                      {blog.title}
                    </Typography>
                    <Chip 
                      label={blog.status || 'Draft'} 
                      size="small" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: blog.status === 'Published' ? '#2A9D8F' : '#E76F51',
                        backgroundColor: blog.status === 'Published' 
                          ? alpha('#2A9D8F', 0.15) 
                          : alpha('#E76F51', 0.15),
                        border: blog.status === 'Published' 
                          ? `1px solid ${alpha('#2A9D8F', 0.3)}` 
                          : `1px solid ${alpha('#E76F51', 0.3)}`,
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex' }}>
                    <Tooltip title="Edit Blog">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/edit-blog/${blog._id}`);
                        }}
                        sx={{ 
                          color: '#2A9D8F',
                          bgcolor: alpha('#2A9D8F', 0.1),
                          '&:hover': {
                            bgcolor: alpha('#2A9D8F', 0.2),
                          },
                          mr: 1
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Blog">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBlog(blog);
                          setDeleteDialogOpen(true);
                        }}
                        sx={{ 
                          color: '#E76F51',
                          bgcolor: alpha('#E76F51', 0.1),
                          '&:hover': {
                            bgcolor: alpha('#E76F51', 0.2),
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  {blog.tags.map((tag, i) => (
                    <Chip
                      key={i}
                      label={tag}
                      size="small"
                      sx={{ 
                        mr: 1, 
                        mb: 1, 
                        borderRadius: '50px',
                        backgroundColor: alpha('#fff', 0.5),
                        border: '1px solid rgba(0,0,0,0.05)',
                        fontWeight: 'medium',
                        color: '#264653',
                        '&:hover': {
                          backgroundColor: alpha('#fff', 0.7),
                        }
                      }}
                    />
                  ))}
                </Box>

                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#264653',
                    opacity: 0.8,
                    mb: 3,
                    flexGrow: 1
                  }}
                >
                  {blog.content.substring(0, 120)}...
                </Typography>

                <Box sx={{ mt: 'auto' }}>
                  <Accordion 
                    expanded={expandedBlog === blog._id}
                    onChange={handleAccordionChange(blog._id)}
                    sx={{ 
                      boxShadow: 'none',
                      '&:before': { display: 'none' },
                      bgcolor: 'transparent',
                      '& .MuiAccordionSummary-root': {
                        minHeight: '40px',
                        padding: '0'
                      }
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: '#264653' }} />}
                      sx={{ 
                        '& .MuiAccordionSummary-content': { margin: '0' }
                      }}
                    >
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          color: '#264653',
                          opacity: 0.7
                        }}
                      >
                        <HistoryIcon fontSize="small" />
                        View Blog History
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0, pt: 1 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 2,
                        position: 'relative',
                        pl: 4,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: '20px',
                          top: 0,
                          bottom: 0,
                          width: '2px',
                          backgroundColor: alpha('#264653', 0.2)
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Box sx={{ 
                            width: '30px', 
                            height: '30px', 
                            borderRadius: '50%', 
                            bgcolor: alpha('#F4A261', 0.8),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            flexShrink: 0,
                            position: 'relative',
                            zIndex: 1,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}>
                            <Typography variant="caption">1</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#264653' }}>
                              Created on {format(new Date(blog.createdAt), 'MMM d, yyyy')}
                            </Typography>
                          </Box>
                        </Box>
                        {blog.history && blog.history.length > 0 ? (
                          blog.history.map((event, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                              <Box sx={{ 
                                width: '30px', 
                                height: '30px', 
                                borderRadius: '50%', 
                                bgcolor: event.type === 'edit' ? alpha('#2A9D8F', 0.8) : alpha('#E76F51', 0.8),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                flexShrink: 0,
                                position: 'relative',
                                zIndex: 1,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}>
                                <Typography variant="caption">{index + 2}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: '#264653' }}>
                                  {event.type === 'edit' ? 'Edited' : 'Published'} on {format(new Date(event.timestamp), 'MMM d, yyyy')}
                                </Typography>
                              </Box>
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" sx={{ pl: 6, color: '#264653', opacity: 0.7 }}>
                            No edit history available
                          </Typography>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  <Button
                    variant="contained"
                    size="medium"
                    onClick={() => navigate(`/blogs/${blog._id}`)}
                    sx={{
                      mt: 2,
                      borderRadius: '50px',
                      py: 1,
                      px: 3,
                      backgroundColor: alpha('#264653', 0.8),
                      color: 'white',
                      fontWeight: 'medium',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      '&:hover': {
                        backgroundColor: '#264653',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    Read More
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#E76F51',
          fontWeight: 'bold'
        }}>
          Delete Blog
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#264653' }}>
            Are you sure you want to delete this blog? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 8,
              borderColor: alpha('#264653', 0.5),
              color: '#264653',
              '&:hover': {
                borderColor: '#264653',
                backgroundColor: alpha('#264653', 0.05)
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            variant="contained"
            sx={{ 
              borderRadius: 8,
              backgroundColor: '#E76F51',
              '&:hover': {
                backgroundColor: '#E63946',
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyBlogs; 