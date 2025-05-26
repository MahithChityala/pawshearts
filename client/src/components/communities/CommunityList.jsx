import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCommunity } from '../../context/CommunityContext';
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
  Pagination
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const CommunityList = () => {
  const { communities, loading, error, pagination } = useCommunity();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCommunities, setFilteredCommunities] = useState([]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = communities.filter(community =>
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCommunities(filtered);
    } else {
      setFilteredCommunities(communities);
    }
  }, [communities, searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handlePageChange = (event, value) => {
    // Implement pagination logic here
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

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Communities
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SearchIcon sx={{ mr: 1 }} />
          <input
            type="text"
            placeholder="Search communities..."
            value={searchQuery}
            onChange={handleSearch}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '100%',
              maxWidth: '400px'
            }}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {filteredCommunities.map((community) => (
          <Grid item xs={12} sm={6} md={4} key={community._id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
            >
              <CardMedia
                component="img"
                height="140"
                image={community.coverImage || '/default-community-cover.jpg'}
                alt={community.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {community.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {community.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={community.category}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`${community.memberCount} members`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    component={Link}
                    to={`/communities/${community._id}`}
                    variant="contained"
                    size="small"
                  >
                    View Community
                  </Button>
                  {community.isPrivate && (
                    <Chip
                      label="Private"
                      color="secondary"
                      size="small"
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {pagination.pages > 1 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={pagination.pages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {filteredCommunities.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 4
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No communities found
          </Typography>
          <Button
            component={Link}
            to="/communities/create"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Create a Community
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CommunityList; 