import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SecurityIcon from '@mui/icons-material/Security';
import SupportIcon from '@mui/icons-material/Support';

function About() {
  const values = [
    {
      icon: <PetsIcon sx={{ fontSize: 40 }} />,
      title: 'Pet Care Excellence',
      description: 'We provide the highest standard of care for all our pets.',
    },
    {
      icon: <FavoriteIcon sx={{ fontSize: 40 }} />,
      title: 'Love & Compassion',
      description: 'Every pet receives love, attention, and compassionate care.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Safe Adoption Process',
      description: 'Our adoption process ensures pets go to loving, suitable homes.',
    },
    {
      icon: <SupportIcon sx={{ fontSize: 40 }} />,
      title: '24/7 Support',
      description: "We're always here to help with any pet-related concerns.",
    },
  ];

  const team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Head Veterinarian',
      image: '/team1.jpg',
    },
    {
      name: 'Mike Wilson',
      role: 'Pet Behavior Specialist',
      image: '/team2.jpg',
    },
    {
      name: 'Emily Davis',
      role: 'Adoption Coordinator',
      image: '/team3.jpg',
    },
  ];

  return (
    <Box>
      {/* Header Section */}
      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" gutterBottom>
            About Us
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
            We are dedicated to connecting loving homes with pets in need. Our mission is to ensure every pet finds their perfect forever family.
          </Typography>
        </Container>
      </Box>

      {/* Values Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Our Values
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {values.map((value, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  backgroundColor: 'transparent',
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    mb: 2,
                  }}
                >
                  {value.icon}
                </Box>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {value.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {value.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Story Section */}
      <Box sx={{ backgroundColor: '#f5f5f5', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" gutterBottom>
                Our Story
              </Typography>
              <Typography variant="body1" paragraph>
                Founded in 2010, Tailwag has been at the forefront of pet adoption and care. We believe that every pet deserves a loving home, and every family deserves the joy of pet companionship.
              </Typography>
              <Typography variant="body1" paragraph>
                Over the years, we've successfully matched thousands of pets with their perfect families. Our comprehensive adoption process and post-adoption support ensure both pets and their new families thrive together.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/about-story.jpg"
                alt="Our Story"
                sx={{
                  width: '100%',
                  borderRadius: 2,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Team Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Our Team
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Meet the dedicated professionals who make our mission possible
        </Typography>
        <Grid container spacing={4}>
          {team.map((member, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <Avatar
                  src={member.image}
                  alt={member.name}
                  sx={{
                    width: 200,
                    height: 200,
                    mx: 'auto',
                    mt: 3,
                    mb: 2,
                  }}
                />
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    {member.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {member.role}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default About; 