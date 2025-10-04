// src/pages/Room.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ExitToApp,
  PlayArrow,
  Psychology,
  Speed,
  Memory,
  EmojiEvents,
  Refresh,
  Casino,
  Edit,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/api';
import { useSocket } from '../services/SocketContext';
import { generateRandomArray, getAlgorithmIcon, getAlgorithmComplexity } from '../services/battleUtils';

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket, joinRoom, leaveRoom } = useSocket();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [algorithms, setAlgorithms] = useState({});
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
  const [inputData, setInputData] = useState([]);
  const [target, setTarget] = useState('');
  const [battleResults, setBattleResults] = useState(null);
  const [battleInProgress, setBattleInProgress] = useState(false);
  
  // Dialog states
  const [algorithmDialogOpen, setAlgorithmDialogOpen] = useState(false);
  const [inputDialogOpen, setInputDialogOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const playerName = localStorage.getItem('playerName');

  useEffect(() => {
    if (!playerName) {
      navigate('/');
      return;
    }
    
    loadRoom();
    loadAlgorithms();
    
    if (socket) {
      joinRoom(roomId);
      
      // Socket event listeners
      socket.on('room_update', handleRoomUpdate);
      socket.on('battle_starting', handleBattleStarting);
      socket.on('battle_progress', handleBattleProgress);
      socket.on('battle_completed', handleBattleCompleted);
      socket.on('battle_error', handleBattleError);
      
      return () => {
        socket.off('room_update');
        socket.off('battle_starting');
        socket.off('battle_progress');
        socket.off('battle_completed');
        socket.off('battle_error');
        leaveRoom(roomId);
      };
    }
  }, [socket, roomId, playerName, navigate]);

  const loadRoom = async () => {
    try {
      const response = await apiService.getRoom(roomId);
      if (response.data.success) {
        setRoom(response.data.room);
      }
    } catch (error) {
      console.error('Error loading room:', error);
      showSnackbar('Failed to load room', 'error');
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

  const handleRoomUpdate = (updatedRoom) => {
    setRoom(updatedRoom);
  };

  const handleBattleStarting = () => {
    setBattleInProgress(true);
    setBattleResults(null);
    showSnackbar('Battle starting! Algorithms are running...', 'info');
  };

  const handleBattleProgress = (progress) => {
    showSnackbar(`${progress.player} algorithm is running...`, 'info');
  };

  const handleBattleCompleted = (results) => {
    setBattleInProgress(false);
    setBattleResults(results);
    showSnackbar(`Battle completed! Winner: ${results.winner}`, 'success');
  };

  const handleBattleError = (error) => {
    setBattleInProgress(false);
    showSnackbar(`Battle error: ${error.error}`, 'error');
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSelectAlgorithm = async () => {
    try {
      const response = await apiService.setAlgorithm(roomId, {
        player_name: playerName,
        algorithm_name: selectedAlgorithm,
      });
      
      if (response.data.success) {
        setAlgorithmDialogOpen(false);
        showSnackbar('Algorithm selected successfully!', 'success');
      }
    } catch (error) {
      showSnackbar('Failed to select algorithm', 'error');
    }
  };

  const handleSubmitInput = async () => {
    try {
      let finalInputData = inputData;
      
      if (customInput) {
        finalInputData = customInput.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
      }
      
      if (finalInputData.length !== room.input_size) {
        showSnackbar(`Input must have exactly ${room.input_size} numbers`, 'error');
        return;
      }

      const response = await apiService.setInput(roomId, {
        player_name: playerName,
        input_data: finalInputData,
        target: room.purpose === 'searching' ? parseInt(target) : null,
      });
      
      if (response.data.success) {
        setInputDialogOpen(false);
        showSnackbar('Input submitted successfully!', 'success');
      }
    } catch (error) {
      showSnackbar('Failed to submit input', 'error');
    }
  };

  const generateRandomInput = () => {
    const randomData = generateRandomArray(room?.input_size || 10);
    setInputData(randomData);
    setCustomInput(randomData.join(', '));
  };

  const handleStartBattle = async () => {
    try {
      const response = await apiService.startBattle(roomId, {
        player_name: playerName,
      });
      
      if (response.data.success) {
        showSnackbar('Battle started!', 'success');
      }
    } catch (error) {
      showSnackbar('Failed to start battle', 'error');
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await apiService.leaveRoom(roomId, { player_name: playerName });
      navigate('/lobby');
    } catch (error) {
      navigate('/lobby');
    }
  };

  const currentPlayer = room?.players?.find(p => p.name === playerName);
  const isHost = room?.host_name === playerName;
  const canStartBattle = room?.status === 'ready' && isHost;
  const availableAlgorithms = Object.entries(algorithms).filter(([key, algo]) => 
    algo.category === room?.purpose && 
    !room?.players?.some(p => p.algorithm_name === key && p.name !== playerName)
  );

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Typography variant="h6">Loading room...</Typography>
        </Box>
      </Container>
    );
  }

  if (!room) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Typography variant="h6" color="error">Room not found</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              🏠 {room.name}
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Chip 
                label={`${room.purpose.charAt(0).toUpperCase() + room.purpose.slice(1)}`}
                color="primary"
              />
              <Chip label={`Input Size: ${room.input_size}`} variant="outlined" />
              <Chip label={`Players: ${room.players?.length}/${room.max_players}`} variant="outlined" />
              <Chip 
                label={room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                color={room.status === 'ready' ? 'success' : room.status === 'battle_in_progress' ? 'warning' : 'default'}
              />
            </Box>
          </Box>
          <IconButton onClick={handleLeaveRoom} color="error">
            <ExitToApp />
          </IconButton>
        </Box>

        <Grid container spacing={3}>
          {/* Players Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  👥 Players
                </Typography>
                <List>
                  {room.players?.map((player, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar>{player.name === room.host_name ? '👑' : '👤'}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={player.name}
                        secondary={
                          <Box>
                            {player.algorithm_name && (
                              <Chip
                                label={`${getAlgorithmIcon(player.algorithm_name)} ${algorithms[player.algorithm_name]?.name || player.algorithm_name}`}
                                size="small"
                                sx={{ mr: 1, mb: 0.5 }}
                              />
                            )}
                            {player.is_ready && (
                              <Chip label="Ready" color="success" size="small" />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Actions Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎮 Actions
                </Typography>
                
                {currentPlayer && (
                  <Box display="flex" flexDirection="column" gap={2}>
                    {!currentPlayer.algorithm_name && (
                      <Button
                        variant="contained"
                        startIcon={<Psychology />}
                        onClick={() => setAlgorithmDialogOpen(true)}
                        fullWidth
                      >
                        Choose Algorithm
                      </Button>
                    )}
                    
                    {currentPlayer.algorithm_name && !currentPlayer.is_ready && (
                      <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={() => setInputDialogOpen(true)}
                        fullWidth
                      >
                        Submit Input Data
                      </Button>
                    )}
                    
                    {canStartBattle && (
                      <Button
                        variant="contained"
                        color="error"
                        size="large"
                        startIcon={<PlayArrow />}
                        onClick={handleStartBattle}
                        fullWidth
                        sx={{
                          background: 'linear-gradient(45deg, #ff6b35, #4ecdc4)',
                        }}
                      >
                        Start Battle!
                      </Button>
                    )}

                    {battleInProgress && (
                      <Box>
                        <Typography variant="body2" gutterBottom>
                          Battle in progress...
                        </Typography>
                        <LinearProgress />
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Battle Results */}
        {battleResults && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🏆 Battle Results
                </Typography>
                
                <Box mb={2}>
                  <Typography variant="h5" color="primary" gutterBottom>
                    🥇 Winner: {battleResults.winner}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  {battleResults.results?.map((result, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper
                        sx={{
                          p: 2,
                          background: index === 0 ? 'linear-gradient(45deg, #FFD700, #FFA500)' : 'inherit',
                          color: index === 0 ? 'black' : 'inherit',
                        }}
                      >
                        <Typography variant="subtitle1" gutterBottom>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`} {result.player_name}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          {getAlgorithmIcon(result.algorithm_name)} {algorithms[result.algorithm_name]?.name}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">⏱️ Time:</Typography>
                          <Typography variant="body2">{(result.time_taken * 1000).toFixed(2)}ms</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">💾 Memory:</Typography>
                          <Typography variant="body2">{result.memory_used.toFixed(2)}MB</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">🏆 Score:</Typography>
                          <Typography variant="body2">{result.score.toFixed(3)}</Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Algorithm Selection Dialog */}
        <Dialog
          open={algorithmDialogOpen}
          onClose={() => setAlgorithmDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Choose Your Algorithm</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ pt: 1 }}>
              {availableAlgorithms.map(([key, algo]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: selectedAlgorithm === key ? 2 : 1,
                      borderColor: selectedAlgorithm === key ? 'primary.main' : 'divider',
                    }}
                    onClick={() => setSelectedAlgorithm(key)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {getAlgorithmIcon(key)} {algo.name}
                      </Typography>
                      <Chip
                        label={getAlgorithmComplexity(key)}
                        size="small"
                        color="secondary"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAlgorithmDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSelectAlgorithm}
              disabled={!selectedAlgorithm}
            >
              Select Algorithm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Input Data Dialog */}
        <Dialog
          open={inputDialogOpen}
          onClose={() => setInputDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Submit Input Data</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Array size must be exactly {room.input_size} numbers
              </Typography>
              
              <Box display="flex" gap={2} mb={3}>
                <Button
                  variant="outlined"
                  startIcon={<Casino />}
                  onClick={generateRandomInput}
                >
                  Generate Random
                </Button>
              </Box>

              <TextField
                fullWidth
                label="Input Array (comma-separated)"
                multiline
                rows={3}
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="1, 2, 3, 4, 5..."
                sx={{ mb: 3 }}
              />

              {room.purpose === 'searching' && (
                <TextField
                  fullWidth
                  label="Target Value to Search"
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInputDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmitInput}
              disabled={!customInput.trim()}
            >
              Submit Input
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default Room;