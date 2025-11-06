// Game state management
class GameState {
    constructor() {
        this.roomCode = '';
        this.playerId = null;
        this.socket = null;
        this.opponentReady = false;
    }

    connectSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('player_joined', (data) => {
            console.log('Player joined:', data);
            this.updatePlayerStatus(data.player_id);
        });

        this.socket.on('opponent_selected', (data) => {
            console.log('Opponent selected:', data);
            this.showOpponentSelection(data);
            this.opponentReady = true;
            this.checkBattleReady();
        });

        this.socket.on('start_battle', (data) => {
            console.log('Starting battle:', data);
            this.startBattleExecution(data);
        });

        this.socket.on('error', (data) => {
            alert('Error: ' + data.message);
        });
    }

    async createRoom() {
        try {
            const response = await fetch('/api/room/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            
            if (response.ok) {
                this.roomCode = data.room_code;
                this.playerId = 1;
                this.joinRoomSocket();
                return data.room_code;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error creating room:', error);
            alert('Failed to create room: ' + error.message);
            return null;
        }
    }

    async joinRoom(roomCode) {
        try {
            const response = await fetch(`/api/room/${roomCode}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.roomCode = roomCode;
                this.playerId = 2;
                this.joinRoomSocket();
                return true;
            } else {
                const data = await response.json();
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error joining room:', error);
            alert('Failed to join room: ' + error.message);
            return false;
        }
    }

    joinRoomSocket() {
        if (this.socket && this.roomCode && this.playerId) {
            this.socket.emit('join_room', {
                room_code: this.roomCode,
                player_id: this.playerId
            });
        }
    }

    submitSelection(selection) {
        if (this.socket && this.roomCode && this.playerId) {
            this.socket.emit('player_selection', {
                room_code: this.roomCode,
                player_id: this.playerId,
                selection: selection
            });
        }
    }

    updatePlayerStatus(playerId) {
        // Update UI to show player status
        const statusElement = document.getElementById(`p${playerId}-status-badge`);
        if (statusElement) {
            statusElement.textContent = 'Connected';
            statusElement.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-green-600';
        }
    }

    showOpponentSelection(data) {
        // Show opponent's selection in the UI
        const opponentPanel = document.getElementById(`player${data.player_id}-panel`);
        if (opponentPanel) {
            const algoName = opponentPanel.querySelector('.algorithm-name');
            if (algoName) {
                algoName.textContent = data.algorithm;
            }
        }
    }

    checkBattleReady() {
        if (this.opponentReady) {
            // Enable battle start button or auto-start
            document.getElementById('start-battle-btn')?.classList.remove('hidden');
        }
    }

    // In GameState class in game.js, modify the startBattleExecution method:

async startBattleExecution(battleData) {
    // Show battle progress screen
    showScreen('battle-progress');
    
    // Update battle UI with algorithm names
    const p1Element = document.getElementById('battle-p1-algo-name');
    const p2Element = document.getElementById('battle-p2-algo-name');
    
    if (p1Element) {
        p1Element.textContent = battleData.player1.algorithm;
    }
    
    if (p2Element) {
        p2Element.textContent = battleData.player2.algorithm;
    }
    
    try {
        const response = await fetch('/api/battle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                player1: battleData.player1,
                player2: battleData.player2,
                input_size: document.getElementById('input-size')?.value || 20
            })
        });

        const results = await response.json();
        
        if (response.ok) {
            // Simulate progress while waiting for results
            this.simulateBattleProgress(results);
        } else {
            throw new Error(results.error);
        }
    } catch (error) {
        console.error('Battle execution error:', error);
        alert('Battle failed: ' + error.message);
        // Fallback to simulated battle
        this.simulateBattleProgress();
    }
}

// Add this new method to simulate battle progress
simulateBattleProgress(results = null) {
    let progress1 = 0;
    let progress2 = 0;
    const maxProgress = 100;

    const interval = setInterval(() => {
        // Increment progress
        progress1 += Math.random() * 15;
        progress2 += Math.random() * 12;

        progress1 = Math.min(progress1, maxProgress);
        progress2 = Math.min(progress2, maxProgress);

        // Update progress bars
        const p1ProgressBar = document.getElementById('p1-progress-bar');
        const p2ProgressBar = document.getElementById('p2-progress-bar');
        const p1ProgressText = document.getElementById('p1-progress-text');
        const p2ProgressText = document.getElementById('p2-progress-text');
        const p1Status = document.getElementById('p1-status');
        const p2Status = document.getElementById('p2-status');

        if (p1ProgressBar) p1ProgressBar.style.width = progress1 + '%';
        if (p1ProgressText) p1ProgressText.textContent = Math.floor(progress1) + '%';
        if (p2ProgressBar) p2ProgressBar.style.width = progress2 + '%';
        if (p2ProgressText) p2ProgressText.textContent = Math.floor(progress2) + '%';

        // Update status text
        if (progress1 < maxProgress) {
            if (p1Status) p1Status.textContent = 'Running...';
        }
        if (progress2 < maxProgress) {
            if (p2Status) p2Status.textContent = 'Running...';
        }

        // Check if both reached 100%
        if (progress1 >= maxProgress && progress2 >= maxProgress) {
            clearInterval(interval);
            
            // Update final status
            if (p1Status) p1Status.textContent = '✓ Complete!';
            if (p2Status) p2Status.textContent = '✓ Complete!';
            
            // Show results after a brief delay
            setTimeout(() => {
                if (results) {
                    this.displayResults(results);
                } else {
                    // Fallback to simulated results
                    this.displaySimulatedResults();
                }
                document.getElementById('view-results-btn')?.classList.remove('hidden');
            }, 1000);
        }
    }, 200);
}

// Add fallback method for simulated results
displaySimulatedResults() {
    // Get algorithm names directly from globalGameState instead of battle screen elements
    const p1Algo = globalGameState.player1.algorithm || 'Quick Sort';
    const p2Algo = globalGameState.player2.algorithm || globalGameState.player1.algorithm || 'Merge Sort';
    
    console.log('displaySimulatedResults - p1Algo:', p1Algo, 'p2Algo:', p2Algo);
    console.log('globalGameState:', globalGameState);
    
    // Generate random metrics
    const p1Score = Math.floor(Math.random() * 500) + 500;
    const p2Score = Math.floor(Math.random() * 500) + 500;

    document.getElementById('r1-algo').textContent = p1Algo;
    document.getElementById('r2-algo').textContent = p2Algo;
    document.getElementById('r1-score').textContent = p1Score;
    document.getElementById('r2-score').textContent = p2Score;
    document.getElementById('r1-time').textContent = (Math.random() * 100).toFixed(2) + ' ms';
    document.getElementById('r2-time').textContent = (Math.random() * 100).toFixed(2) + ' ms';
    document.getElementById('r1-memory').textContent = (Math.random() * 50).toFixed(2) + ' MB';
    document.getElementById('r2-memory').textContent = (Math.random() * 50).toFixed(2) + ' MB';
    document.getElementById('r1-comparisons').textContent = Math.floor(Math.random() * 1000);
    document.getElementById('r2-comparisons').textContent = Math.floor(Math.random() * 1000);
    
    const winner = p1Score > p2Score ? "Player 1" : "Player 2";
    document.getElementById('winner-banner').textContent = `🏆 ${winner} Wins! 🏆`;
    
    showScreen('results');
}

    displayResults(results) {
        // Update results screen with battle results
            // Use the name provided by the backend; if it's generic/fallback, use client-side globalGameState as a best-effort
            let p1Name = results.player1.name || '';
            let p2Name = results.player2.name || '';
            if (p1Name.toLowerCase().includes('algorithm') || p1Name.trim() === '') {
                p1Name = (window.globalGameState && globalGameState.player1 && globalGameState.player1.algorithm) || p1Name || 'Player 1 Algorithm';
            }
            if (p2Name.toLowerCase().includes('algorithm') || p2Name.trim() === '') {
                p2Name = (window.globalGameState && globalGameState.player2 && globalGameState.player2.algorithm) || p2Name || 'Player 2 Algorithm';
            }
            document.getElementById('r1-algo').textContent = p1Name;
            document.getElementById('r2-algo').textContent = p2Name;
        document.getElementById('r1-score').textContent = results.player1.score;
        document.getElementById('r2-score').textContent = results.player2.score;
        document.getElementById('r1-time').textContent = results.player1.time_ms + ' ms';
        document.getElementById('r2-time').textContent = results.player2.time_ms + ' ms';
        document.getElementById('r1-memory').textContent = results.player1.memory + ' MB';
        document.getElementById('r2-memory').textContent = results.player2.memory + ' MB';
        document.getElementById('r1-comparisons').textContent = results.player1.comparisons;
        document.getElementById('r2-comparisons').textContent = results.player2.comparisons;
        
        document.getElementById('winner-banner').textContent = `🏆 ${results.winner} Wins! 🏆`;
        
        showScreen('results');
    }
}

// Global game state instance
const gameState = new GameState();

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    gameState.connectSocket();
    
    // Update your existing functions to use the game state
    window.createRoom = async function() {
        console.log('createRoom function called');
        try {
            const roomCode = await gameState.createRoom();
            console.log('Room code received:', roomCode);
            if (roomCode) {
                document.getElementById('room-code').textContent = roomCode;
                // Use global functions directly
                window.showScreen('room-setup');
                window.enablePlayer(1);
            }
        } catch (error) {
            console.error('Error in window.createRoom:', error);
            alert('Failed to create room: ' + error.message);
        }
    };

    window.joinRoom = async function() {
        const code = prompt("Enter room code:");
        if (code) {
            const success = await gameState.joinRoom(code.toUpperCase());
            if (success) {
                document.getElementById('room-code').textContent = code.toUpperCase();
                // Use global functions directly
                window.showScreen('room-setup');
                window.enablePlayer(2);
            }
        }
    };
});

window.socketGameState = gameState;