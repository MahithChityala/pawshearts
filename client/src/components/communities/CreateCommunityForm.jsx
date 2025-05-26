import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunity } from '../../context/CommunityContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const CreateCommunityForm = () => {
  const navigate = useNavigate();
  const { createCommunity, loading, error } = useCommunity();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isPrivate: false,
    rules: [{ title: '', description: '' }],
    tags: [],
    avatar: null,
    coverImage: null
  });
  const [newTag, setNewTag] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [previewCover, setPreviewCover] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      setFormData({ ...formData, [name]: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === 'avatar') {
          setPreviewAvatar(reader.result);
        } else {
          setPreviewCover(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRuleChange = (index, field, value) => {
    const newRules = [...formData.rules];
    newRules[index][field] = value;
    setFormData({ ...formData, rules: newRules });
  };

  const addRule = () => {
    setFormData({
      ...formData,
      rules: [...formData.rules, { title: '', description: '' }]
    });
  };

  const removeRule = (index) => {
    const newRules = formData.rules.filter((_, i) => i !== index);
    setFormData({ ...formData, rules: newRules });
  };

  const handleTagAdd = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCommunity(formData);
      navigate('/communities');
    } catch (error) {
      console.error('Error creating community:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Community
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Community Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                SelectProps={{
                  native: true
                }}
              >
                <option value="">Select a category</option>
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
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Community Avatar
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  name="avatar"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="avatar-upload"
                />
                <label htmlFor="avatar-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                  >
                    Upload Avatar
                  </Button>
                </label>
                {previewAvatar && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={previewAvatar}
                      alt="Avatar preview"
                      style={{ maxWidth: '100%', maxHeight: '200px' }}
                    />
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Cover Image
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  name="coverImage"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="cover-upload"
                />
                <label htmlFor="cover-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                  >
                    Upload Cover Image
                  </Button>
                </label>
                {previewCover && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={previewCover}
                      alt="Cover preview"
                      style={{ maxWidth: '100%', maxHeight: '200px' }}
                    />
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Community Rules
              </Typography>
              {formData.rules.map((rule, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        label="Rule Title"
                        value={rule.title}
                        onChange={(e) => handleRuleChange(index, 'title', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Rule Description"
                        value={rule.description}
                        onChange={(e) => handleRuleChange(index, 'description', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton
                        color="error"
                        onClick={() => removeRule(index)}
                        disabled={formData.rules.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={addRule}
                sx={{ mb: 2 }}
              >
                Add Rule
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {formData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleTagRemove(tag)}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Add Tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTagAdd();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleTagAdd}
                  disabled={!newTag.trim()}
                >
                  Add
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Community'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreateCommunityForm; 