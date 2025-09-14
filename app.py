# app.py - Main Flask application
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import uuid
import json
from datetime import datetime
import traceback

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///battlefield.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

# Import your existing algorithm library
from algorithms.library import algorithms
from utils.profiler import run_algorithm
from utils.scoring import score_algorithm

# ================== DATABASE MODELS ==================

class Room(db.Model):
    __tablename__ = 'rooms'
    
    id = db.Column(db.String(8), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    host_name = db.Column(db.String(50), nullable=False)
    purpose = db.Column(db.String(20), nullable=False)
    input_size = db.Column(db.Integer, nullable=False)
    max_players = db.Column(db.Integer, default=4)
    status = db.Column(db.String(20), default='waiting')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    players = db.relationship('Player', backref='room', lazy=True, cascade='all, delete-orphan')
    battle_results = db.relationship('BattleResult', backref='room', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'host_name': self.host_name,
            'purpose': self.purpose,
            'input_size': self.input_size,
            'max_players': self.max_players,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'players': [player.to_dict() for player in self.players],
            'player_count': len(self.players)
        }

class Player(db.Model):
    __tablename__ = 'players'
    
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.String(8), db.ForeignKey('rooms.id'), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    algorithm_name = db.Column(db.String(50))
    input_data = db.Column(db.Text)  # JSON array
    target = db.Column(db.Integer)   # For search algorithms
    is_ready = db.Column(db.Boolean, default=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'algorithm_name': self.algorithm_name,
            'algorithm_display': algorithms.get(self.algorithm_name, {}).get('name', self.algorithm_name),
            'has_input': bool(self.input_data),
            'is_ready': self.is_ready,
            'joined_at': self.joined_at.isoformat()
        }
    
    def get_input_data(self):
        return json.loads(self.input_data) if self.input_data else None

class BattleResult(db.Model):
    __tablename__ = 'battle_results'
    
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.String(8), db.ForeignKey('rooms.id'), nullable=False)
    player_name = db.Column(db.String(50), nullable=False)
    algorithm_name = db.Column(db.String(50), nullable=False)
    time_taken = db.Column(db.Float, nullable=False)
    memory_used = db.Column(db.Float, nullable=False)
    score = db.Column(db.Float, nullable=False)
    result_data = db.Column(db.Text)  # JSON
    battle_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'player_name': self.player_name,
            'algorithm_name': self.algorithm_name,
            'algorithm_display': algorithms.get(self.algorithm_name, {}).get('name', self.algorithm_name),
            'time_taken': self.time_taken,
            'memory_used': self.memory_used,
            'score': self.score,
            'result_data': json.loads(self.result_data) if self.result_data else None,
            'battle_at': self.battle_at.isoformat()
        }

# ================== HELPER FUNCTIONS ==================

def generate_room_id():
    """Generate a unique 8-character room ID."""
    return str(uuid.uuid4())[:8]

def get_available_algorithms(purpose):
    """Get algorithms for a specific purpose/category."""
    return {
        key: value for key, value in algorithms.items() 
        if value['category'] == purpose
    }

def check_room_ready(room):
    """Check if room is ready to start battle."""
    if len(room.players) < 2:
        return False
    
    for player in room.players:
        if not player.algorithm_name or not player.is_ready:
            return False
    
    return True

# ================== REST API ENDPOINTS ==================

@app.route('/api/algorithms')
def get_algorithms():
    """Get all available algorithms."""
    # Remove the 'func' key which contains non-serializable function objects
    serializable_algorithms = {}
    for key, algo in algorithms.items():
        serializable_algorithms[key] = {
            'name': algo['name'],
            'category': algo['category']
        }
    
    return jsonify({
        'success': True,
        'algorithms': serializable_algorithms
    })

@app.route('/api/algorithms/<category>')
def get_algorithms_by_category(category):
    """Get algorithms for a specific category."""
    available = get_available_algorithms(category)
    # Remove function objects for JSON serialization
    serializable = {}
    for key, algo in available.items():
        serializable[key] = {
            'name': algo['name'],
            'category': algo['category']
        }
    
    return jsonify({
        'success': True,
        'algorithms': serializable
    })
@app.route('/api/rooms', methods=['GET'])
def get_rooms():
    """Get all available rooms."""
    rooms = Room.query.filter_by(status='waiting').all()
    return jsonify({
        'success': True,
        'rooms': [room.to_dict() for room in rooms]
    })

@app.route('/api/rooms', methods=['POST'])
def create_room():
    """Create a new room."""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['name', 'host_name', 'purpose', 'input_size']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        
        # Create room
        room = Room(
            id=generate_room_id(),
            name=data['name'],
            host_name=data['host_name'],
            purpose=data['purpose'],
            input_size=data['input_size'],
            max_players=data.get('max_players', 4)
        )
        
        db.session.add(room)
        
        # Add host as first player
        host_player = Player(
            room_id=room.id,
            name=data['host_name']
        )
        
        db.session.add(host_player)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'room': room.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/rooms/<room_id>')
def get_room(room_id):
    """Get room details."""
    room = Room.query.get(room_id)
    if not room:
        return jsonify({'success': False, 'error': 'Room not found'}), 404
    
    return jsonify({
        'success': True,
        'room': room.to_dict()
    })

@app.route('/api/rooms/<room_id>/join', methods=['POST'])
def join_room(room_id):
    """Join a room."""
    try:
        data = request.json
        player_name = data.get('player_name')
        
        if not player_name:
            return jsonify({'success': False, 'error': 'Player name required'}), 400
        
        room = Room.query.get(room_id)
        if not room:
            return jsonify({'success': False, 'error': 'Room not found'}), 404
        
        if room.status != 'waiting':
            return jsonify({'success': False, 'error': 'Room is not accepting players'}), 400
        
        if len(room.players) >= room.max_players:
            return jsonify({'success': False, 'error': 'Room is full'}), 400
        
        # Check if player already in room
        existing_player = Player.query.filter_by(room_id=room_id, name=player_name).first()
        if existing_player:
            return jsonify({'success': False, 'error': 'Player already in room'}), 400
        
        # Add player
        player = Player(
            room_id=room_id,
            name=player_name
        )
        
        db.session.add(player)
        db.session.commit()
        
        # Emit room update to all players
        socketio.emit('room_update', room.to_dict(), room=room_id)
        
        return jsonify({
            'success': True,
            'player': player.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/rooms/<room_id>/leave', methods=['POST'])
def leave_room(room_id):
    """Leave a room."""
    try:
        data = request.json
        player_name = data.get('player_name')
        
        player = Player.query.filter_by(room_id=room_id, name=player_name).first()
        if not player:
            return jsonify({'success': False, 'error': 'Player not in room'}), 404
        
        db.session.delete(player)
        db.session.commit()
        
        # Check if room should be deleted (no players left)
        room = Room.query.get(room_id)
        if room and len(room.players) == 0:
            db.session.delete(room)
            db.session.commit()
            socketio.emit('room_deleted', {'room_id': room_id})
        else:
            socketio.emit('room_update', room.to_dict(), room=room_id)
        
        return jsonify({'success': True})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/rooms/<room_id>/algorithm', methods=['PUT'])
def set_algorithm(room_id):
    """Set player's algorithm."""
    try:
        data = request.json
        player_name = data.get('player_name')
        algorithm_name = data.get('algorithm_name')
        
        player = Player.query.filter_by(room_id=room_id, name=player_name).first()
        if not player:
            return jsonify({'success': False, 'error': 'Player not in room'}), 404
        
        # Validate algorithm exists
        if algorithm_name not in algorithms:
            return jsonify({'success': False, 'error': 'Invalid algorithm'}), 400
        
        # Check if algorithm is already taken
        room = Room.query.get(room_id)
        for p in room.players:
            if p.name != player_name and p.algorithm_name == algorithm_name:
                return jsonify({'success': False, 'error': 'Algorithm already taken'}), 400
        
        player.algorithm_name = algorithm_name
        db.session.commit()
        
        # Check if room is ready
        if check_room_ready(room):
            room.status = 'ready'
            db.session.commit()
        
        socketio.emit('room_update', room.to_dict(), room=room_id)
        
        return jsonify({'success': True})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/rooms/<room_id>/input', methods=['PUT'])
def set_input(room_id):
    """Set player's input data."""
    try:
        data = request.json
        player_name = data.get('player_name')
        input_data = data.get('input_data')
        target = data.get('target')
        
        player = Player.query.filter_by(room_id=room_id, name=player_name).first()
        if not player:
            return jsonify({'success': False, 'error': 'Player not in room'}), 404
        
        room = Room.query.get(room_id)
        
        # Validate input size
        if len(input_data) != room.input_size:
            return jsonify({'success': False, 'error': f'Input must have exactly {room.input_size} elements'}), 400
        
        player.input_data = json.dumps(input_data)
        player.target = target
        player.is_ready = True
        db.session.commit()
        
        # Check if room is ready
        if check_room_ready(room):
            room.status = 'ready'
            db.session.commit()
        
        socketio.emit('room_update', room.to_dict(), room=room_id)
        
        return jsonify({'success': True})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/rooms/<room_id>/battle', methods=['POST'])
def start_battle(room_id):
    """Start the battle."""
    try:
        data = request.json
        player_name = data.get('player_name')
        
        room = Room.query.get(room_id)
        if not room:
            return jsonify({'success': False, 'error': 'Room not found'}), 404
        
        if room.host_name != player_name:
            return jsonify({'success': False, 'error': 'Only host can start battle'}), 403
        
        if room.status != 'ready':
            return jsonify({'success': False, 'error': 'Room not ready for battle'}), 400
        
        # Update room status
        room.status = 'battle_in_progress'
        db.session.commit()
        
        socketio.emit('battle_starting', room.to_dict(), room=room_id)
        
        # Run the battle (this will emit results when complete)
        socketio.start_background_task(execute_battle, room_id)
        
        return jsonify({'success': True})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

def execute_battle(room_id):
    """Execute the battle in background."""
    try:
        with app.app_context():
            room = Room.query.get(room_id)
            if not room:
                return
            
            results = []
            all_times = []
            all_memories = []
            
            # Run algorithms for each player
            for player in room.players:
                socketio.emit('battle_progress', {
                    'player': player.name,
                    'status': 'running'
                }, room=room_id)
                
                # Get algorithm function
                algo_info = algorithms[player.algorithm_name]
                func = algo_info['func']
                
                # Get player input
                input_data = player.get_input_data()
                
                # Run algorithm
                if room.purpose == 'searching':
                    time_taken, memory_used, is_correct, result = run_algorithm(func, input_data, player.target)
                else:
                    time_taken, memory_used, is_correct, result = run_algorithm(func, input_data)
                
                all_times.append(time_taken)
                all_memories.append(memory_used)
                
                # Store result
                battle_result = {
                    'player_name': player.name,
                    'algorithm_name': player.algorithm_name,
                    'time_taken': time_taken,
                    'memory_used': memory_used,
                    'is_correct': is_correct,
                    'result': result
                }
                results.append(battle_result)
            
            # Calculate scores
            fastest_time = min(all_times)
            lowest_memory = min(all_memories)
            
            final_results = []
            for result in results:
                score = score_algorithm(
                    result['is_correct'],
                    result['time_taken'],
                    result['memory_used'],
                    fastest_time,
                    lowest_memory
                )
                result['score'] = score
                
                # Save to database
                battle_record = BattleResult(
                    room_id=room_id,
                    player_name=result['player_name'],
                    algorithm_name=result['algorithm_name'],
                    time_taken=result['time_taken'],
                    memory_used=result['memory_used'],
                    score=score,
                    result_data=json.dumps(result['result'])
                )
                db.session.add(battle_record)
                
                final_results.append(result)
            
            # Sort by score
            final_results.sort(key=lambda x: x['score'], reverse=True)
            
            # Update room status
            room.status = 'completed'
            db.session.commit()
            
            # Emit results
            socketio.emit('battle_completed', {
                'results': final_results,
                'winner': final_results[0]['player_name']
            }, room=room_id)
            
    except Exception as e:
        print(f"Battle execution error: {e}")
        traceback.print_exc()
        socketio.emit('battle_error', {'error': str(e)}, room=room_id)

# ================== SOCKET.IO EVENTS ==================

@socketio.on('join_room')
def on_join_room(data):
    """Handle client joining a room."""
    room_id = data['room_id']
    join_room(room_id)
    emit('joined_room', {'room_id': room_id})

@socketio.on('leave_room')
def on_leave_room(data):
    """Handle client leaving a room."""
    room_id = data['room_id']
    leave_room(room_id)
    emit('left_room', {'room_id': room_id})

# ================== DATABASE INITIALIZATION ==================

def create_tables():
    """Create database tables."""
    with app.app_context():
        db.create_all()

# Initialize database on startup
create_tables()

# ================== ERROR HANDLERS ==================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

# ================== MAIN ==================

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)