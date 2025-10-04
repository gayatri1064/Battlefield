import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  PlayArrow,
  Groups,
  EmojiEvents,
  Speed,
  Psychology,
  Lightbulb,
} from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');

  const handleEnterLobby = () => {
    if (playerName.trim()) {
      localStorage.setItem('playerName', playerName.trim());
      navigate('/lobby');
    }
  };

  const features = [
    {
      icon: <Groups />,
      title: 'Multiplayer Battles',
      description: 'Compete with up to 8 players in real-time algorithm battles',
    },
    {
      icon: <Speed />,
      title: 'Performance Testing',
      description: 'Measure execution time, memory usage, and efficiency',
    },
    {
      icon: <Psychology />,
      title: 'Multiple Categories',
      description: 'Sorting, searching, graph algorithms, and dynamic programming',
    },
    {
      icon: <EmojiEvents />,
      title: 'Fair Competition',
      description: 'Same input size, different values for balanced competition',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box textAlign="center" mb={6}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: '3rem', md: '5rem' },
                fontWeight: 900,
                background: 'linear-gradient(45deg, #ff6b35, #4ecdc4)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              Algorithm Battlefield
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
            >
              Battle your algorithms against others in real-time multiplayer competitions.
              May the most efficient code win!
            </Typography>

            {/* Player Name Input */}
            <Card sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <TextField
                  fullWidth
                  label="Enter Your Battle Name"
                  variant="outlined"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleEnterLobby()}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: <Lightbulb sx={{ mr: 1, color: 'primary.main' }} />,
                  }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleEnterLobby}
                  disabled={!playerName.trim()}
                  startIcon={<PlayArrow />}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(45deg, #ff6b35, #4ecdc4)',
                  }}
                >
                  Enter the Battlefield
                </Button>
              </CardContent>
            </Card>
          </Box>
        </motion.div>

        {/* Features Grid */}
        <Grid container spacing={3} sx={{ mt: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #ff6b35, #4ecdc4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      {React.cloneElement(feature.icon, {
                        sx: { fontSize: 30, color: 'white' },
                      })}
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;