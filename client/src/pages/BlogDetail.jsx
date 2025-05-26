import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Divider,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  Chip,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from "../contexts/AuthContext";

function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');

  const fetchBlog = useCallback(async () => {
    try {
      console.log('Fetching blog with ID:', id);
      const response = await axios.get(`http://localhost:5000/api/blogs/${id}`);
      console.log('Blog data received:', response.data);
      setBlog(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching blog:', err);
      setError('Failed to fetch blog post');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/blogs/${id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update the blog state with the new likes array
      setBlog(prev => ({
        ...prev,
        likes: response.data
      }));
    } catch (err) {
      console.error('Failed to like blog:', err);
      alert('Failed to like blog. Please try again.');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!comment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/blogs/${id}/comments`,
        { content: comment },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update the blog state with the new comments array
      setBlog(prev => ({
        ...prev,
        comments: response.data
      }));
      setComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
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

  if (!blog) return null;

  // Ensure tags is always an array
  let tags = blog.tags;
  if (typeof tags === 'string') {
    try {
      tags = JSON.parse(tags);
    } catch {
      tags = [tags];
    }
  }

  const isLiked = user && blog.likes.includes(user._id);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        {blog.title}
      </Typography>
      
      {blog.subtitle && (
        <Typography variant="h5" color="text.secondary" gutterBottom>
          {blog.subtitle}
        </Typography>
      )}

      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar src={blog.author.avatar} alt={blog.author.name}>
          {blog.author.name[0]}
        </Avatar>
        <Box>
          <Typography variant="subtitle1">
            {blog.author.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {format(new Date(blog.createdAt), 'MMMM d, yyyy')} • {blog.readTime} min read
          </Typography>
        </Box>
      </Box>

      <Box display="flex" gap={1} mb={3}>
        {tags.map((tag, index) => (
          <Chip key={index} label={tag} size="small" />
        ))}
      </Box>

      <Box 
        component="img"
        src={`http://localhost:5000/uploads/${blog.image}`}
        alt={blog.title}
        sx={{
          width: '100%',
          height: 'auto',
          maxHeight: '600px',
          objectFit: 'contain',
          borderRadius: 1,
          mb: 4
        }}
      />

      <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
        {blog.content}
      </Typography>

      <Box sx={{ mt: 4, mb: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton 
            onClick={handleLike} 
            color={isLiked ? 'error' : 'default'}
            sx={{ 
              '&:hover': { 
                bgcolor: isLiked ? 'error.light' : 'action.hover' 
              } 
            }}
          >
            {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            {blog.likes.length} {blog.likes.length === 1 ? 'like' : 'likes'}
          </Typography>
          <IconButton 
            onClick={handleShare}
            sx={{ '&:hover': { bgcolor: 'action.hover' } }}
          >
            <ShareIcon />
          </IconButton>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Comments Section */}
      <Typography variant="h6" gutterBottom>
        Comments ({blog.comments.length})
      </Typography>

      {user ? (
        <Box component="form" onSubmit={handleComment} sx={{ mb: 4 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!comment.trim()}
            sx={{
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            Post Comment
          </Button>
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          Please <Button color="primary" onClick={() => navigate('/login')}>log in</Button> to comment on this blog post.
        </Alert>
      )}

      <Box sx={{ mt: 4 }}>
        {blog.comments.map((comment, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Avatar 
                src={comment.author?.avatar} 
                alt={comment.author?.name}
              >
                {comment.author?.name?.[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle2">
                  {comment.author?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2">
              {comment.content}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Container>
  );
}

export default BlogDetail; 