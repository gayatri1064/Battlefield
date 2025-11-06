// Global game state and core functions that must be available globally
window.globalGameState = {
    roomCode: "",
    currentPlayer: 1,
    player1: { category: "", algorithm: "", array: [], target: null, text: "", pattern: "", confirmed: false },
    player2: { category: "", algorithm: "", array: [], target: null, text: "", pattern: "", confirmed: false }
};

// Screen management
window.showScreen = function(screenId) {
    console.log('showScreen called with:', screenId);
    const screens = ["landing-screen", "room-setup", "waiting-screen", "battle-progress", "results"];
    const navbar = document.getElementById("navbar");

    screens.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add("hidden");
        }
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove("hidden");
    }

    if (screenId === "landing-screen") {
        navbar?.classList.add("hidden");
    } else {
        navbar?.classList.remove("hidden");
    }

    const mobileMenu = document.getElementById("mobile-menu");
    if (mobileMenu) {
        mobileMenu.classList.add("hidden");
    }
};

// Player management
window.enablePlayer = function(player) {
    console.log('enablePlayer called for player:', player);
    const panel = document.getElementById(`player${player}-panel`);
    const statusBadge = document.getElementById(`p${player}-status-badge`);

    if (panel) {
        panel.classList.remove('opacity-50', 'pointer-events-none');
    }

    if (statusBadge) {
        statusBadge.textContent = 'Connected';
        statusBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-green-600';
    }
};

// Algorithm management
window.updateAlgorithms = function(player, category) {
    console.log('Updating algorithms for category:', category);
    const select = document.getElementById(`p${player}-algorithm`);
    const infoDiv = document.getElementById(`p${player}-algo-info`);

    if (!select || !infoDiv) {
        console.error('Select or infoDiv not found');
        return;
    }

    select.innerHTML = '<option value="">Select Algorithm</option>';
    infoDiv.innerHTML = '<p class="text-gray-400 text-xs sm:text-sm">Select an algorithm to see details</p>';

    if (category && window.algorithms && window.algorithms[category]) {
        window.algorithms[category].forEach((algo) => {
            const option = document.createElement("option");
            option.value = algo.name;
            option.textContent = algo.name;
            select.appendChild(option);
        });

        select.onchange = () => {
            const algo = window.algorithms[category]?.find((a) => a.name === select.value);
            if (algo) {
                infoDiv.innerHTML = `
                    <p class="font-semibold text-base sm:text-lg mb-2">${algo.name}</p>
                    <p class="text-xs sm:text-sm text-gray-300 mb-2">${algo.desc}</p>
                    <p class="text-xs sm:text-sm text-cyan-400">Time Complexity: ${algo.time}</p>
                `;
            }
            updateInputFields(player, category);
        };
    }
};

// Room management functions
window.createRoom = async function() {
    console.log('Creating room...');
    try {
        const response = await fetch('/api/room/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Room created:', data);
            
            window.globalGameState.roomCode = data.room_code;
            window.globalGameState.currentPlayer = 1;
            
            document.querySelectorAll('[id*="room-code"]').forEach(element => {
                element.textContent = data.room_code;
            });
            
            window.showScreen("room-setup");
            window.enablePlayer(1);
            
            // Join room via Socket.IO
            if (window.socket) {
                window.socket.emit('join_room', {
                    room_code: data.room_code,
                    player_id: 1
                });
            }
        } else {
            throw new Error('Failed to create room');
        }
    } catch (error) {
        console.error('Error creating room:', error);
        alert('Failed to create room: ' + error.message);
    }
};

window.joinRoom = async function() {
    const code = prompt("Enter room code:");
    if (code) {
        try {
            const response = await fetch(`/api/room/${code.toUpperCase()}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                window.globalGameState.roomCode = code.toUpperCase();
                window.globalGameState.currentPlayer = 2;
                
                document.querySelectorAll('[id*="room-code"]').forEach(element => {
                    element.textContent = code.toUpperCase();
                });
                
                window.showScreen("room-setup");
                window.enablePlayer(2);
                
                // Join room via Socket.IO
                if (window.socket) {
                    window.socket.emit('join_room', {
                        room_code: code.toUpperCase(),
                        player_id: 2
                    });
                }
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Failed to join room');
            }
        } catch (error) {
            console.error('Error joining room:', error);
            alert('Failed to join room: ' + error.message);
        }
    }
};