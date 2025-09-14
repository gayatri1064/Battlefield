# room_manager.py
import uuid
import time
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from enum import Enum

class RoomStatus(Enum):
    WAITING = "waiting"
    READY = "ready"
    BATTLE_IN_PROGRESS = "battle_in_progress"
    COMPLETED = "completed"

@dataclass
class Player:
    name: str
    algorithm: Optional[Dict] = None
    input_data: Optional[List] = None
    target: Optional[int] = None  # For searching algorithms
    result: Optional[Any] = None
    time_taken: Optional[float] = None
    memory_used: Optional[float] = None
    score: Optional[float] = None
    is_ready: bool = False

@dataclass
class BattleRoom:
    room_id: str
    room_name: str
    host_name: str
    purpose: str  # sorting, searching, graph, dp
    input_size: int
    max_players: int = 4
    created_at: float = field(default_factory=time.time)
    status: RoomStatus = RoomStatus.WAITING
    players: Dict[str, Player] = field(default_factory=dict)
    battle_results: Optional[Dict] = None
    target_required: bool = False

    def add_player(self, player_name: str) -> bool:
        """Add a player to the room if there's space."""
        if len(self.players) >= self.max_players:
            return False
        if player_name in self.players:
            return False
        
        self.players[player_name] = Player(name=player_name)
        return True
    
    def remove_player(self, player_name: str) -> bool:
        """Remove a player from the room."""
        if player_name in self.players:
            del self.players[player_name]
            return True
        return False
    
    def set_player_algorithm(self, player_name: str, algorithm: Dict) -> bool:
        """Set algorithm for a player."""
        if player_name not in self.players:
            return False
        self.players[player_name].algorithm = algorithm
        self._check_ready_status()
        return True
    
    def set_player_input(self, player_name: str, input_data: List, target: Optional[int] = None) -> bool:
        """Set input data for a player."""
        if player_name not in self.players:
            return False
        if len(input_data) != self.input_size:
            return False
        
        self.players[player_name].input_data = input_data
        if self.target_required:
            self.players[player_name].target = target
        self.players[player_name].is_ready = True
        self._check_ready_status()
        return True
    
    def _check_ready_status(self):
        """Check if all players are ready and update room status."""
        if len(self.players) < 2:
            return
        
        all_ready = all(
            player.algorithm is not None and 
            player.is_ready 
            for player in self.players.values()
        )
        
        if all_ready:
            self.status = RoomStatus.READY

class RoomManager:
    def __init__(self):
        self.rooms: Dict[str, BattleRoom] = {}
    
    def create_room(self, host_name: str, room_name: str, purpose: str, 
                   input_size: int, max_players: int = 4) -> str:
        """Create a new battle room."""
        room_id = str(uuid.uuid4())[:8]
        target_required = purpose.lower() == "searching"
        
        room = BattleRoom(
            room_id=room_id,
            room_name=room_name,
            host_name=host_name,
            purpose=purpose,
            input_size=input_size,
            max_players=max_players,
            target_required=target_required
        )
        
        # Host automatically joins their room
        room.add_player(host_name)
        self.rooms[room_id] = room
        return room_id
    
    def join_room(self, room_id: str, player_name: str) -> bool:
        """Join an existing room."""
        if room_id not in self.rooms:
            return False
        
        room = self.rooms[room_id]
        if room.status != RoomStatus.WAITING:
            return False
        
        return room.add_player(player_name)
    
    def get_room(self, room_id: str) -> Optional[BattleRoom]:
        """Get room by ID."""
        return self.rooms.get(room_id)
    
    def list_available_rooms(self) -> List[BattleRoom]:
        """List all rooms that are waiting for players."""
        return [
            room for room in self.rooms.values() 
            if room.status == RoomStatus.WAITING and len(room.players) < room.max_players
        ]
    
    def delete_room(self, room_id: str, requester_name: str) -> bool:
        """Delete a room (only host can delete)."""
        if room_id not in self.rooms:
            return False
        
        room = self.rooms[room_id]
        if room.host_name != requester_name:
            return False
        
        del self.rooms[room_id]
        return True
    
    def cleanup_old_rooms(self, max_age_hours: int = 24):
        """Remove rooms older than specified hours."""
        current_time = time.time()
        rooms_to_delete = []
        
        for room_id, room in self.rooms.items():
            age_hours = (current_time - room.created_at) / 3600
            if age_hours > max_age_hours:
                rooms_to_delete.append(room_id)
        
        for room_id in rooms_to_delete:
            del self.rooms[room_id]