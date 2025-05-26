import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCommunity } from '../../context/CommunityContext';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Send as SendIcon,
  ExitToApp as LeaveIcon
} from '@mui/icons-material';

const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentCommunity,
    loading,
    error,
    posts,
    chatMessages,
    getCommunity,
    updateCommunity,
    deleteCommunity,
    joinCommunity,
    leaveCommunity,
    getCommunityPosts,
    getCommunityChat,
    sendCommunityMessage
  } = useCommunity();
  const [activeTab, setActiveTab] = useState(0);
  const [newMessage, setNewMessage] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: '',
    isPrivate: false,
    rules: [],
    tags: []
  });

  useEffect(() => {
    if (id) {
      getCommunity(id);
      getCommunityPosts(id);
      getCommunityChat(id);
    }
  }, [id, getCommunity, getCommunityPosts, getCommunityChat]);

  useEffect(() => {
    if (currentCommunity) {
      setEditForm({
        name: currentCommunity.name,
        description: currentCommunity.description,
        category: currentCommunity.category,
        isPrivate: currentCommunity.isPrivate,
        rules: currentCommunity.rules,
        tags: currentCommunity.tags
      });
    }
  }, [currentCommunity]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      await sendCommunityMessage(id, newMessage);
      setNewMessage('');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await updateCommunity(id, editForm);
    setEditDialogOpen(false);
  };

  const handleDelete = async () => {
    await deleteCommunity(id);
    setDeleteDialogOpen(false);
    navigate('/communities');
  };

  const handleJoin = async () => {
    await joinCommunity(id);
  };

  const handleLeave = async () => {
    await leaveCommunity(id);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!currentCommunity) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        Community not found
      </Alert>
    );
  }

  const isAdmin = currentCommunity.creator._id === user._id;
  const isMember = currentCommunity.members.some(
    member => member.user._id === user._id
  );

  return (
    <Box>
      <Card sx={{ mb: 4 }}>
        <CardMedia
          component="img"
          height="200"
          image={currentCommunity.coverImage || '/default-community-cover.jpg'}
          alt={currentCommunity.name}
        />
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">
              {currentCommunity.name}
            </Typography>
            <Box>
              {isAdmin && (
                <>
                  <IconButton onClick={() => setEditDialogOpen(true)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => setDeleteDialogOpen(true)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </>
              )}
              {!isMember ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleJoin}
                >
                  Join Community
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<LeaveIcon />}
                  onClick={handleLeave}
                >
                  Leave Community
                </Button>
              )}
            </Box>
          </Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {currentCommunity.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip label={currentCommunity.category} color="primary" />
            <Chip label={`${currentCommunity.memberCount} members`} />
            {currentCommunity.isPrivate && <Chip label="Private" color="secondary" />}
          </Box>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Posts" />
        <Tab label="Chat" />
        <Tab label="Members" />
        <Tab label="Rules" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {posts.map((post) => (
            <Grid item xs={12} key={post._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={post.author.avatar}
                      alt={post.author.username}
                      sx={{ mr: 2 }}
                    />
                    <Box>
                      <Typography variant="subtitle1">
                        {post.author.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1">{post.content}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 1 && (
        <Box>
          <Box sx={{ height: '400px', overflowY: 'auto', mb: 2 }}>
            {chatMessages.map((message) => (
              <Box
                key={message._id}
                sx={{
                  display: 'flex',
                  mb: 2,
                  justifyContent: message.sender._id === user._id ? 'flex-end' : 'flex-start'
                }}
              >
                <Box
                  sx={{
                    maxWidth: '70%',
                    bgcolor: message.sender._id === user._id ? 'primary.main' : 'grey.100',
                    color: message.sender._id === user._id ? 'white' : 'text.primary',
                    p: 2,
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar
                      src={message.sender.avatar}
                      alt={message.sender.username}
                      sx={{ mr: 1, width: 24, height: 24 }}
                    />
                    <Typography variant="subtitle2">
                      {message.sender.username}
                    </Typography>
                  </Box>
                  <Typography variant="body1">{message.content}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <Box component="form" onSubmit={handleMessageSubmit} sx={{ display: 'flex' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              sx={{ mr: 1 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
            >
              Send
            </Button>
          </Box>
        </Box>
      )}

      {activeTab === 2 && (
        <Grid container spacing={2}>
          {currentCommunity.members.map((member) => (
            <Grid item xs={12} sm={6} md={4} key={member.user._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={member.user.avatar}
                      alt={member.user.username}
                      sx={{ mr: 2 }}
                    />
                    <Box>
                      <Typography variant="subtitle1">
                        {member.user.username}
                      </Typography>
                      <Chip
                        label={member.role}
                        size="small"
                        color={member.role === 'admin' ? 'primary' : 'default'}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 3 && (
        <Box>
          {currentCommunity.rules.map((rule, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {rule.title}
                </Typography>
                <Typography variant="body1">{rule.description}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Community</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              select
              label="Category"
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              sx={{ mb: 2 }}
            >
              {[
                'Pets',
                'Dogs',
                'Cats',
                'Birds',
                'Fish',
                'Reptiles',
                'Small Animals',
                'Wildlife',
                'Pet Care',
                'Pet Training',
                'Pet Health',
                'Pet Adoption',
                'Pet Rescue',
                'Pet Events',
                'Pet Products',
                'Other'
              ].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Community</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this community? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommunityDetail; 