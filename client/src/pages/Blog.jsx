import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  InputAdornment,
  Paper,
  useTheme,
  alpha,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  Search as SearchIcon,
  Pets as PetsIcon,
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  LocalOffer as TagIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from "../contexts/AuthContext";

const pawPrints = [
  { top: '10%', left: '5%', rotation: '45deg' },
  { top: '30%', right: '8%', rotation: '-30deg' },
  { bottom: '15%', left: '12%', rotation: '15deg' },
  { top: '60%', right: '15%', rotation: '60deg' },
];

function Blog() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openNewBlog, setOpenNewBlog] = useState(false);
  const [newBlog, setNewBlog] = useState({
    title: '',
    subtitle: '',
    content: '',
    tags: [],
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [showPopular, setShowPopular] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    if (user) {
      console.log('User is authenticated:', user.name);
    }
  }, [user]);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/blogs');
      setBlogs(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch blogs');
      setLoading(false);
    }
  };

  // Unique tags for filter sidebar
  const allTags = Array.from(new Set(blogs.flatMap(blog => blog.tags)));

  // Most popular blogs (by likes)
  const mostPopular = [...blogs].sort((a, b) => b.likes.length - a.likes.length).slice(0, 5);

  // Filtered blogs
  let filteredBlogs = blogs;
  if (activeTag) {
    filteredBlogs = filteredBlogs.filter(blog => blog.tags.includes(activeTag));
  }
  if (showPopular) {
    filteredBlogs = [...filteredBlogs].sort((a, b) => b.likes.length - a.likes.length);
  }
  if (searchQuery) {
    filteredBlogs = filteredBlogs.filter(blog =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  const handleCreateBlog = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        alert('Please log in to create a blog post');
        return;
      }

      const formData = new FormData();
      formData.append('title', newBlog.title);
      formData.append('subtitle', newBlog.subtitle);
      formData.append('content', newBlog.content);
      formData.append('tags', JSON.stringify(newBlog.tags));
      
      if (selectedImage) {
        formData.append('featuredImage', selectedImage);
      }

      console.log('Sending blog data:', {
        title: newBlog.title,
        subtitle: newBlog.subtitle,
        content: newBlog.content.substring(0, 50) + '...',
        tags: newBlog.tags,
        hasImage: !!selectedImage
      });

      const response = await axios.post('http://localhost:5000/api/blogs', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Blog creation response:', response.data);
      
      setOpenNewBlog(false);
      setNewBlog({ title: '', subtitle: '', content: '', tags: [] });
      setSelectedImage(null);
      fetchBlogs();
    } catch (err) {
      console.error('Failed to create blog:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to create blog post. Please try again.');
    }
  };

  const handleImageSelect = (event) => {
    setSelectedImage(event.target.files[0]);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newBlog.tags.includes(tagInput.trim())) {
      setNewBlog({
        ...newBlog,
        tags: [...newBlog.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewBlog({
      ...newBlog,
      tags: newBlog.tags.filter(tag => tag !== tagToRemove)
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', bgcolor: alpha(theme.palette.primary.light, 0.1), pt: 10, pb: 8 }}>
      {/* Decorative paw prints */}
      {pawPrints.map((style, index) => (
        <PetsIcon
          key={index}
          sx={{
            position: 'absolute',
            ...style,
            fontSize: '3rem',
            color: alpha(theme.palette.primary.main, 0.08),
            transform: `rotate(${style.rotation})`,
            zIndex: 0,
          }}
        />
      ))}

      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Blog List */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 4, textAlign: 'center', zIndex: 1 }}>
              <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <PetsIcon sx={{ fontSize: 40 }} />
                Pet Care Blog
                <PetsIcon sx={{ fontSize: 40 }} />
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
                Discover tips, stories, and advice for your furry friends
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setOpenNewBlog(true)}
                sx={{ borderRadius: 30, px: 4, py: 1.5, fontSize: '1.1rem', boxShadow: theme.shadows[4], '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[8] }, transition: 'all 0.3s ease' }}
              >
                Write a Blog Post
              </Button>
            </Box>
            <Paper elevation={3} sx={{ p: 2, mb: 4, borderRadius: 2, bgcolor: 'white', position: 'relative', zIndex: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search blogs by title, content, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 30 },
                }}
              />
            </Paper>
            <Stack spacing={4}>
              {filteredBlogs.map((blog) => (
                <Card key={blog._id} sx={{ borderRadius: 4, boxShadow: theme.shadows[4], transition: 'all 0.3s', '&:hover': { boxShadow: theme.shadows[8], transform: 'translateY(-2px)' }, overflow: 'visible', position: 'relative' }}>
                  <CardMedia
                    component="img"
                    image={`http://localhost:5000/uploads/${blog.image}`}
                    alt={blog.title}
                    sx={{ width: '100%', height: 340, objectFit: 'cover', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {blog.title}
                    </Typography>
                    {blog.subtitle && (
                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        {blog.subtitle}
                      </Typography>
                    )}
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Avatar 
                        src={blog.author.avatar}
                        alt={blog.author.name}
                        sx={{ width: 36, height: 36 }}
                      >
                        {blog.author.name[0]}
                      </Avatar>
                      <Typography variant="body2" color="text.secondary">
                        By {blog.author.name} • {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })} • {blog.readTime} min read
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {blog.content.substring(0, 200)}...
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                      {blog.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          icon={<TagIcon />}
                          onClick={() => setActiveTag(tag)}
                          sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}
                        />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate(`/blogs/${blog._id}`)}
                        sx={{ borderRadius: 30, px: 3, '&:hover': { transform: 'scale(1.02)', bgcolor: theme.palette.primary.dark }, transition: 'all 0.2s ease' }}
                      >
                        Read More
                      </Button>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <FavoriteIcon color="error" sx={{ fontSize: 22 }} />
                          <Typography variant="body2" color="text.secondary">
                            {blog.likes.length}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CommentIcon color="primary" sx={{ fontSize: 22 }} />
                          <Typography variant="body2" color="text.secondary">
                            {blog.comments.length}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Grid>
          {/* Sidebar Filters */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 100, zIndex: 2 }}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 4, mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TagIcon color="primary" /> Topics
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {allTags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      color={activeTag === tag ? 'primary' : 'default'}
                      onClick={() => setActiveTag(tag === activeTag ? '' : tag)}
                      sx={{ cursor: 'pointer', mb: 1 }}
                    />
                  ))}
                </Box>
              </Paper>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 4, mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon color="warning" /> Most Popular
                </Typography>
                <List>
                  {mostPopular.map((blog) => (
                    <ListItemButton key={blog._id} onClick={() => navigate(`/blogs/${blog._id}`)}>
                      <ListItemText
                        primary={blog.title}
                        secondary={`${blog.likes.length} likes`}
                        primaryTypographyProps={{ fontWeight: 'bold' }}
                      />
                    </ListItemButton>
                  ))}
                </List>
                <Button
                  variant={showPopular ? 'contained' : 'outlined'}
                  color="warning"
                  onClick={() => setShowPopular((prev) => !prev)}
                  sx={{ mt: 2, borderRadius: 30 }}
                  fullWidth
                >
                  {showPopular ? 'Show All Blogs' : 'Show Most Popular'}
                </Button>
              </Paper>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PetsIcon color="primary" /> Fun Fact
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Did you know? Dogs have about 1,700 taste buds. Humans have approximately 9,000!
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* New Blog Dialog */}
      <Dialog 
        open={openNewBlog} 
        onClose={() => setOpenNewBlog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
          }
        }}
      >
        <DialogTitle sx={{ pb: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h4" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PetsIcon color="primary" />
              Write New Blog
            </Typography>
            <IconButton
              onClick={() => setOpenNewBlog(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'grey.500',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newBlog.title}
            onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Subtitle (optional)"
            fullWidth
            value={newBlog.subtitle}
            onChange={(e) => setNewBlog({ ...newBlog, subtitle: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={6}
            value={newBlog.content}
            onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
            sx={{ mb: 3 }}
          />
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ImageIcon color="primary" />
              Featured Image
            </Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="featured-image-upload"
              type="file"
              onChange={handleImageSelect}
            />
            <label htmlFor="featured-image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<ImageIcon />}
                sx={{ borderRadius: 30 }}
              >
                Upload Image
              </Button>
            </label>
            {selectedImage && (
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                Selected: {selectedImage.name}
              </Typography>
            )}
          </Box>
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TagIcon color="primary" />
              Tags
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
              {newBlog.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                />
              ))}
            </Box>
            <Box display="flex" gap={1}>
              <TextField
                size="small"
                label="Add tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="outlined"
                onClick={handleAddTag}
                sx={{ borderRadius: 30 }}
              >
                Add Tag
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenNewBlog(false)}
            sx={{ borderRadius: 30 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateBlog} 
            variant="contained" 
            color="primary"
            disabled={!newBlog.title || !newBlog.content || !selectedImage}
            sx={{ 
              borderRadius: 30,
              px: 4,
            }}
          >
            Publish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Blog; 