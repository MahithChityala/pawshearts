import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  TextField,
  IconButton
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import SendIcon from '@mui/icons-material/Send';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/blogs/${id}`);
      setBlog(response.data);
    } catch (err) {
      setError('Failed to fetch blog post');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/edit-blog/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/blogs/${id}`);
      navigate('/blogs');
    } catch (err) {
      setError('Failed to delete blog post');
      console.error(err);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    try {
      const response = await axios.post(`http://localhost:5000/api/blogs/${id}/comments`, {
        content: commentText
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setBlog(prev => ({
        ...prev,
        comments: response.data
      }));
      setCommentText('');
    } catch (err) {
      setError('Failed to add comment');
      console.error(err);
    }
  };

  const handleLike = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/api/blogs/${id}/like`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setBlog(prev => ({
        ...prev,
        likes: response.data,
        isLiked: !prev.isLiked
      }));
    } catch (err) {
      setError('Failed to like/unlike blog');
      console.error(err);
    }
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
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!blog) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">Blog post not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom>
            {blog.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar src={blog.author?.avatar} alt={blog.author?.name}>
              {blog.author?.name?.[0]}
            </Avatar>
            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle1">
                {blog.author?.name || 'Unknown Author'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {format(new Date(blog.createdAt), 'MMMM d, yyyy')}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            {blog.tags?.map((tag, index) => (
              <Chip 
                key={index} 
                label={tag} 
                size="small"
                sx={{
                  bgcolor: 'rgba(244, 162, 97, 0.1)',
                  color: '#F4A261',
                }}
              />
            ))}
          </Box>

          {blog.image && (
            <Box 
              component="img"
              src={`/uploads/${blog.image}`}
              alt={blog.title}
              sx={{
                width: '100%',
                height: 400,
                objectFit: 'cover',
                borderRadius: 1,
                mb: 4
              }}
            />
          )}
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Content */}
        <Typography variant="body1" sx={{ 
          mb: 4,
          lineHeight: 1.8,
          fontSize: '1.1rem',
          whiteSpace: 'pre-wrap'
        }}>
          {blog.content}
        </Typography>

        {/* Like Button */}
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={handleLike} sx={{ color: blog.isLiked ? '#e91e63' : 'inherit' }}>
              {blog.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {blog.likes?.length || 0} likes
            </Typography>
          </Box>
        )}

        {/* Comments Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Comments ({blog.comments?.length || 0})
          </Typography>
          
          {user && (
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                multiline
                rows={2}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#F4A261',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#F4A261',
                    },
                  },
                }}
              />
              <IconButton 
                onClick={handleComment}
                sx={{ 
                  alignSelf: 'flex-end',
                  color: '#F4A261',
                  '&:hover': {
                    color: '#E76F51'
                  }
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            {blog.comments?.map((comment, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar 
                    src={comment.author?.avatar}
                    sx={{ width: 32, height: 32, mr: 1 }}
                  >
                    {comment.author?.name?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">
                      {comment.author?.name || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ ml: 5 }}>
                  {comment.content}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Actions */}
        {user?._id === blog.author?._id && (
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={handleEdit}
              sx={{ 
                bgcolor: '#F4A261',
                '&:hover': { bgcolor: '#E76F51' }
              }}
            >
              Edit Post
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={handleDelete}
            >
              Delete Post
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default BlogDetails; 