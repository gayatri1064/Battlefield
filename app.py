from flask import Flask, render_template, request, jsonify, session
from flask_socketio import SocketIO, emit, join_room, leave_room
import random
import string
import json
from datetime import datetime

# Import your existing modules
from utils.helpers import generate_input, get_unified_input
from utils.profiler import run_algorithm
from utils.scoring import score_algorithm
from algorithms.library import algorithms

app = Flask(__name__)
app.secret_key = 'algorithm-battlefield-secret-key-2024'
socketio = SocketIO(app, cors_allowed_origins="*")

# Game rooms storage
rooms = {}
active_battles = {}

class GameRoom:
    def __init__(self, room_code, creator_sid):
        self.room_code = room_code
        self.creator_sid = creator_sid
        self.players = {}
        self.players_ready = {}
        self.battle_started = False
        self.battle_results = None
        self.created_at = datetime.now()
    
    def add_player(self, player_id, sid, username=None):
        if player_id not in self.players:
            self.players[player_id] = {
                'sid': sid,
                'username': username or f'Player {player_id}',
                'selection': None,
                'ready': False
            }
            self.players_ready[player_id] = False
            return True
        return False
    
    def remove_player(self, player_id):
        if player_id in self.players:
            del self.players[player_id]
            del self.players_ready[player_id]
    
    def is_full(self):
        return len(self.players) >= 2
    
    def are_both_ready(self):
        return all(self.players_ready.values()) and len(self.players_ready) == 2
    
    def set_player_selection(self, player_id, selection):
        if player_id in self.players:
            self.players[player_id]['selection'] = selection
            self.players_ready[player_id] = True
    
    def get_opponent_selection(self, player_id):
        opponent_id = 2 if player_id == 1 else 1
        if opponent_id in self.players:
            return self.players[opponent_id]['selection']
        return None

def generate_room_code():
    """Generate a unique 6-character room code"""
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        if code not in rooms:
            return code

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/api/categories')
def get_categories():
    """API endpoint to get available algorithm categories"""
    categories = sorted(algorithms.keys())
    return jsonify({'categories': categories})

@app.route('/api/algorithms/<category>')
def get_algorithms(category):
    """API endpoint to get algorithms for a specific category"""
    if category in algorithms:
        algo_list = [{
            'name': algo['name'], 
            'description': algo.get('description', ''),
            'time_complexity': algo.get('time_complexity', 'N/A')
        } for algo in algorithms[category]]
        return jsonify({'algorithms': algo_list})
    return jsonify({'error': 'Category not found'}), 404

@app.route('/api/battle', methods=['POST'])
def execute_battle():
    """Execute algorithm battle and return results"""
    try:
        data = request.get_json()
        
        # Extract battle parameters
        player1_data = data['player1']
        player2_data = data['player2']
        input_size = data.get('input_size', 20)
        
        # Prepare input data for each player. If the client provided a custom_input
        # in their selection, use that; otherwise generate a default input per category.
        generated1 = generate_input(player1_data['category'], input_size)
        generated2 = generate_input(player2_data['category'], input_size)

        if 'custom_input' in player1_data and player1_data['custom_input'] is not None:
            data1 = get_unified_input(player1_data['category'], player1_data['custom_input'], size=input_size, custom=True)
        else:
            data1 = get_unified_input(player1_data['category'], generated1, size=input_size, custom=False)

        if 'custom_input' in player2_data and player2_data['custom_input'] is not None:
            data2 = get_unified_input(player2_data['category'], player2_data['custom_input'], size=input_size, custom=True)
        else:
            data2 = get_unified_input(player2_data['category'], generated2, size=input_size, custom=False)
        
        # Find algorithm functions
        # First try to find by algorithm_key if provided, then by name
        player1_algo = None
        if 'algorithm_key' in player1_data:
            player1_algo = next((algo for algo in algorithms[player1_data['category']] 
                               if algo.get('key') == player1_data['algorithm_key']), None)
        if not player1_algo:
            player1_algo = next((algo for algo in algorithms[player1_data['category']] 
                               if algo['name'] == player1_data['algorithm']), None)
        
        player2_algo = None
        if 'algorithm_key' in player2_data:
            player2_algo = next((algo for algo in algorithms[player2_data['category']] 
                               if algo.get('key') == player2_data['algorithm_key']), None)
        if not player2_algo:
            player2_algo = next((algo for algo in algorithms[player2_data['category']] 
                               if algo['name'] == player2_data['algorithm']), None)
        
        if not player1_algo or not player2_algo:
            return jsonify({'error': 'Algorithm not found'}), 404
        
        # Run algorithms
        func1 = player1_algo["func"]
        func2 = player2_algo["func"]
        
        time1, mem1, correct1, result1 = run_algorithm(func1, *data1)
        time2, mem2, correct2, result2 = run_algorithm(func2, *data2)
        
        # Calculate scores
        fastest_time = min(time1, time2)
        lowest_memory = min(mem1, mem2)
        score1 = score_algorithm(correct1, time1, mem1, fastest_time, lowest_memory)
        score2 = score_algorithm(correct2, time2, mem2, fastest_time, lowest_memory)
        
        # Determine winner
        if score1 > score2:
            winner = "Player 1"
            winner_index = 1
        elif score2 > score1:
            winner = "Player 2"
            winner_index = 2
        else:
            winner = "Draw"
            winner_index = 0
        
        # Prepare detailed results
        results = {
            'player1': {
                'name': player1_algo['name'],  # Use the name from the algorithm object, not the key
                'category': player1_data['category'],
                'result': str(result1),
                'time': f"{time1:.6f}",
                'memory': f"{mem1:.2f}",
                'correct': correct1,
                'score': f"{score1:.3f}",
                'comparisons': random.randint(100, 500),  # Placeholder - you can add actual comparison counting
                'time_ms': f"{(time1 * 1000):.2f}"
            },
            'player2': {
                'name': player2_algo['name'],  # Use the name from the algorithm object, not the key
                'category': player2_data['category'],
                'result': str(result2),
                'time': f"{time2:.6f}",
                'memory': f"{mem2:.2f}",
                'correct': correct2,
                'score': f"{score2:.3f}",
                'comparisons': random.randint(100, 500),  # Placeholder
                'time_ms': f"{(time2 * 1000):.2f}"
            },
            'winner': winner,
            'winner_index': winner_index,
            'input_data': str(data1),
            'input_size': input_size
        }
        
        return jsonify(results)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# FIXED: Only one create_room endpoint
@app.route('/api/room/create', methods=['POST'])
def create_room():
    """Create a new game room"""
    room_code = generate_room_code()
    # Note: creator_sid will be set when player 1 joins via socket
    rooms[room_code] = GameRoom(room_code, None)
    return jsonify({'room_code': room_code, 'message': 'Room created successfully'})

@app.route('/api/room/<room_code>/join', methods=['POST'])
def join_room_api(room_code):
    """Join an existing game room"""
    if room_code not in rooms:
        return jsonify({'error': 'Room not found'}), 404
    
    room = rooms[room_code]
    if room.is_full():
        return jsonify({'error': 'Room is full'}), 400
    
    return jsonify({'message': 'Room joined successfully', 'room_code': room_code})

# SocketIO event handlers
@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")
    # Clean up rooms if creator disconnects
    for room_code, room in list(rooms.items()):
        if room.creator_sid == request.sid:
            del rooms[room_code]
            emit('room_closed', {'message': 'Host disconnected'}, room=room_code)

@socketio.on('join_room')
def handle_join_room(data):
    room_code = data['room_code']
    player_id = data['player_id']
    
    if room_code not in rooms:
        emit('error', {'message': 'Room not found'})
        return
    
    room = rooms[room_code]
    
    # Set creator_sid if this is the first player
    if room.creator_sid is None and player_id == 1:
        room.creator_sid = request.sid
    
    # Add player to room
    if room.add_player(player_id, request.sid):
        join_room(room_code)
        emit('player_joined', {
            'player_id': player_id,
            'room_code': room_code,
            'players_count': len(room.players)
        }, room=room_code)
        
        # If both players joined, notify them
        if room.is_full():
            emit('battle_ready', {'message': 'Both players ready!'}, room=room_code)

@socketio.on('player_selection')
def handle_player_selection(data):
    room_code = data['room_code']
    player_id = data['player_id']
    selection = data['selection']
    
    if room_code not in rooms:
        return
    
    room = rooms[room_code]
    room.set_player_selection(player_id, selection)
    
    # Notify other player about selection
    opponent_id = 2 if player_id == 1 else 1
    emit('opponent_selected', {
        'player_id': player_id,
        'algorithm': selection['algorithm'],
        'category': selection['category']
    }, room=room_code, skip_sid=request.sid)
    
    # If both players are ready, start battle
    if room.are_both_ready():
        emit('start_battle', {
            'player1': room.players[1]['selection'],
            'player2': room.players[2]['selection']
        }, room=room_code)

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)