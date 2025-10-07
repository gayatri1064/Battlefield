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
                this.joinRoom();
                return data.room_code;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error creating room:', error);
            alert('Failed to create room: ' + error.message);
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

    async startBattleExecution(battleData) {
        // Show battle progress screen
        showScreen('battle-progress');
        
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
                this.displayResults(results);
            } else {
                throw new Error(results.error);
            }
        } catch (error) {
            console.error('Battle execution error:', error);
            alert('Battle failed: ' + error.message);
        }
    }

    displayResults(results) {
        // Update results screen with battle results
        document.getElementById('r1-algo').textContent = results.player1.name;
        document.getElementById('r2-algo').textContent = results.player2.name;
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
        const roomCode = await gameState.createRoom();
        if (roomCode) {
            document.getElementById('room-code').textContent = roomCode;
            showScreen('room-setup');
            enablePlayer(1);
        }
    };

    window.joinRoom = async function() {
        const code = prompt("Enter room code:");
        if (code) {
            const success = await gameState.joinRoom(code.toUpperCase());
            if (success) {
                document.getElementById('room-code').textContent = code.toUpperCase();
                showScreen('room-setup');
                enablePlayer(2);
            }
        }
    };

    // Modify your existing confirmPlayerSelection function
    window.confirmPlayerSelection = function(player) {
        const category = document.getElementById(`p${player}-category`).value;
        const algorithm = document.getElementById(`p${player}-algorithm`).value;
        const arraySize = document.getElementById(`p${player}-array-size`).value;
        
        const selection = {
            category: category,
            algorithm: algorithm,
            array_size: arraySize,
            player_id: player
        };
        
        gameState.submitSelection(selection);
        lockPlayer(player);
    };
});