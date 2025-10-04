// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Algorithms
  getAlgorithms: () => api.get('/algorithms'),
  getAlgorithmsByCategory: (category) => api.get(`/algorithms/${category}`),

  // Rooms
  getRooms: () => api.get('/rooms'),
  createRoom: (data) => api.post('/rooms', data),
  getRoom: (roomId) => api.get(`/rooms/${roomId}`),
  joinRoom: (roomId, data) => api.post(`/rooms/${roomId}/join`, data),
  leaveRoom: (roomId, data) => api.post(`/rooms/${roomId}/leave`, data),

  // Player actions
  setAlgorithm: (roomId, data) => api.put(`/rooms/${roomId}/algorithm`, data),
  setInput: (roomId, data) => api.put(`/rooms/${roomId}/input`, data),
  startBattle: (roomId, data) => api.post(`/rooms/${roomId}/battle`, data),
};

// src/services/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit('join_room', { room_id: roomId });
    }
  };

  const leaveRoom = (roomId) => {
    if (socket) {
      socket.emit('leave_room', { room_id: roomId });
    }
  };

  const value = {
    socket,
    connected,
    joinRoom,
    leaveRoom,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// src/services/battleUtils.js
export const generateRandomArray = (size, min = 1, max = 1000) => {
  const array = [];
  const range = max - min + 1;
  
  // Generate unique random numbers
  const used = new Set();
  while (array.length < size && used.size < range) {
    const num = Math.floor(Math.random() * range) + min;
    if (!used.has(num)) {
      used.add(num);
      array.push(num);
    }
  }
  
  // If we need more numbers than the range allows, fill with random
  while (array.length < size) {
    array.push(Math.floor(Math.random() * range) + min);
  }
  
  return array;
};

export const getAlgorithmIcon = (algorithmName) => {
  const icons = {
    // Sorting
    'bubble_sort': '🫧',
    'insertion_sort': '📝',
    'merge_sort': '🔄',
    'quick_sort': '⚡',
    'selection_sort': '🎯',
    'heap_sort': '⛰️',
    
    // Searching
    'linear_search': '📏',
    'binary_search': '🔍',
    'fibonacci_search': '🌀',
    
    // Graph
    'dijkstra': '🗺️',
    'bfs': '🌊',
    'dfs': '🌳',
    'prim': '🌲',
    'kruskal': '🔗',
    
    // DP
    'fibonacci_recursive': '🔄',
    'fibonacci_dp': '⚡',
    'knapsack': '🎒',
  };
  
  return icons[algorithmName] || '🔧';
};

export const getAlgorithmComplexity = (algorithmName) => {
  const complexities = {
    // Sorting
    'bubble_sort': 'O(n²)',
    'insertion_sort': 'O(n²)',
    'merge_sort': 'O(n log n)',
    'quick_sort': 'O(n log n)',
    'selection_sort': 'O(n²)',
    'heap_sort': 'O(n log n)',
    
    // Searching
    'linear_search': 'O(n)',
    'binary_search': 'O(log n)',
    'fibonacci_search': 'O(log n)',
    
    // Graph
    'dijkstra': 'O(V²)',
    'bfs': 'O(V + E)',
    'dfs': 'O(V + E)',
    'prim': 'O(V²)',
    'kruskal': 'O(E log V)',
    
    // DP
    'fibonacci_recursive': 'O(2ⁿ)',
    'fibonacci_dp': 'O(n)',
    'knapsack': 'O(nW)',
  };
  
  return complexities[algorithmName] || 'O(?)';
};