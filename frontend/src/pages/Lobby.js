import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  People,
  PlayArrow,
  Refresh,
  ExitToApp,
  Sort,
  Search,
  AccountTree,
  Functions,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/api';
import { useSocket } from '../services/SocketContext';

const Lobby = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [algorithms, setAlgorithms] = useState({});
  
  const [newRoom, setNewRoom] = useState({
    name: '',
    purpose: '',
    inputSize: 50,
    maxPlayers: 4,
  });

  const playerName = localStorage.getItem('playerName');

  useEffect(() => {
    if (!playerName) {
      navigate('/');
      return;
    }
    loadRooms();
    loadAlgorithms();
  }, [playerName, navigate]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRooms();
      setRooms(response.data.rooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAlgorithms = async () => {
    try {
      const response = await apiService.getAlgorithms();
      setAlgorithms(response.data.algorithms);
    } catch (error) {
      console.error('Error loading algorithms:', error);
    }
  };

  const handleCreateRoom = async () => {
  try {
    const roomData = {
      name: newRoom.name,
      purpose: newRoom.purpose,
      input_size: newRoom.inputSize,  
      max_players: newRoom.maxPlayers,
      host_name: playerName,
    };
    
    console.log('Sending room data:', roomData);
    
    const response = await apiService.createRoom(roomData);
    
    if (response.data.success) {
      navigate(`/room/${response.data.room.id}`);
    }
  } catch (error) {
    console.error('Error creating room:', error);
    console.error('Error response:', error.response?.data);
  }
};

  const handleJoinRoom = async (roomId) => {
    try {
      const response = await apiService.joinRoom(roomId, { player_name: playerName });
      if (response.data.success) {
        navigate(`/room/${roomId}`);
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const getCategoryIcon = (purpose) => {
    const icons = {
      sorting: <Sort />,
      searching: <Search />,
      graph: <AccountTree />,
      dp: <Functions />,
    };
    return icons[purpose] || <Functions />;
  };

  const getCategoryColor = (purpose) => {
    const colors = {
      sorting: '#ff6b35',
      searching: '#4ecdc4',
      graph: '#45b7d1',
      dp: '#96ceb4',
    };
    return colors[purpose] || '#gray';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Battle Lobby
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {playerName}! Choose your battlefield.
            </Typography>
          </Box>
          <Box>
            <IconButton onClick={loadRooms} sx={{ mr: 1 }}>
              <Refresh />
            </IconButton>
            <IconButton onClick={() => navigate('/')} color="error">
              <ExitToApp />
            </IconButton>
          </Box>
        </Box>

        {/* Rooms Grid */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <AnimatePresence>
              {rooms.map((room) => (
                <Grid item xs={12} sm={6} md={4} key={room.id}>
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'visible',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -10,
                          right: -10,
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: getCategoryColor(room.purpose),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                        }}
                      >
                        {getCategoryIcon(room.purpose)}
                      </Box>

                      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                        <Typography variant="h6" component="h2" gutterBottom>
                          {room.name}
                        </Typography>
                        
                        <Box display="flex" alignItems="center" mb={1}>
                          <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                            👑
                          </Avatar>
                          <Typography variant="body2" color="text.secondary">
                            {room.host_name}
                          </Typography>
                        </Box>

                        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                          <Chip
                            label={room.purpose.charAt(0).toUpperCase() + room.purpose.slice(1)}
                            size="small"
                            sx={{ backgroundColor: getCategoryColor(room.purpose), color: 'white' }}
                          />
                          <Chip
                            label={`Size: ${room.input_size}`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>

                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box display="flex" alignItems="center">
                            <People sx={{ fontSize: 18, mr: 0.5 }} />
                            <Typography variant="body2">
                              {room.player_count}/{room.max_players}
                            </Typography>
                          </Box>
                          <Chip
                            label={room.status}
                            size="small"
                            color={room.status === 'waiting' ? 'success' : 'default'}
                          />
                        </Box>
                      </CardContent>

                      <CardActions sx={{ pt: 0 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<PlayArrow />}
                          onClick={() => handleJoinRoom(room.id)}
                          disabled={room.player_count >= room.max_players || room.status !== 'waiting'}
                          sx={{
                            background: `linear-gradient(45deg, ${getCategoryColor(room.purpose)}, ${getCategoryColor(room.purpose)}88)`,
                          }}
                        >
                          {room.player_count >= room.max_players ? 'Room Full' : 'Join Battle'}
                        </Button>
                      </CardActions>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </AnimatePresence>

            {/* Empty State */}
            {!loading && rooms.length === 0 && (
              <Grid item xs={12}>
                <Box textAlign="center" py={8}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No active battles found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create a new room to start your first algorithm battle!
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}

        {/* Create Room FAB */}
        <Fab
          color="primary"
          aria-label="create room"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(45deg, #ff6b35, #4ecdc4)',
          }}
          onClick={() => setCreateDialogOpen(true)}
        >
          <Add />
        </Fab>

        {/* Create Room Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New Battle Room</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Room Name"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                sx={{ mb: 3 }}
              />

              <TextField
                select
                fullWidth
                label="Algorithm Category"
                value={newRoom.purpose}
                onChange={(e) => setNewRoom({ ...newRoom, purpose: e.target.value })}
                sx={{ mb: 3 }}
              >
                <MenuItem value="sorting">🔄 Sorting</MenuItem>
                <MenuItem value="searching">🔍 Searching</MenuItem>
                <MenuItem value="graph">🌐 Graph</MenuItem>
                <MenuItem value="dp">⚡ Dynamic Programming</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Input Array Size"
                type="number"
                value={newRoom.inputSize}
                onChange={(e) => setNewRoom({ ...newRoom, inputSize: parseInt(e.target.value) })}
                inputProps={{ min: 10, max: 1000 }}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Max Players"
                type="number"
                value={newRoom.maxPlayers}
                onChange={(e) => setNewRoom({ ...newRoom, maxPlayers: parseInt(e.target.value) })}
                inputProps={{ min: 2, max: 8 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCreateRoom}
              disabled={!newRoom.name || !newRoom.purpose}
            >
              Create Room
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Lobby;