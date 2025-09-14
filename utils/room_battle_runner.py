# room_battle_runner.py
from utils.profiler import run_algorithm
from utils.scoring import score_algorithm
from algorithms.library import algorithms

def execute_room_battle(room):
    """Execute battle for all players in a room."""
    results = {}
    
    # Track fastest time and lowest memory for scoring
    all_times = []
    all_memories = []
    
    print(f"🔥 Running algorithms for {len(room.players)} players...")
    
    # Run all algorithms first to get performance metrics
    for player_name, player in room.players.items():
        print(f"⚡ Running {player.algorithm['name']} for {player_name}...")
        
        # Get the actual function
        algo_key = None
        for key, algo_info in algorithms.items():
            if algo_info == player.algorithm:
                algo_key = key
                break
        
        func = algorithms[algo_key]["func"]
        
        # Run the algorithm
        if room.target_required:
            time_taken, memory_used, is_correct, result = run_algorithm(
                func, player.input_data, player.target
            )
        else:
            time_taken, memory_used, is_correct, result = run_algorithm(
                func, player.input_data
            )
        
        # Store results
        player.result = result
        player.time_taken = time_taken
        player.memory_used = memory_used
        
        all_times.append(time_taken)
        all_memories.append(memory_used)
        
        results[player_name] = {
            'algorithm': player.algorithm['name'],
            'time': time_taken,
            'memory': memory_used,
            'correct': is_correct,
            'result': result
        }
    
    # Calculate scores based on best performances
    fastest_time = min(all_times)
    lowest_memory = min(all_memories)
    
    # Calculate scores for each player
    for player_name, player in room.players.items():
        score = score_algorithm(
            results[player_name]['correct'],
            player.time_taken,
            player.memory_used,
            fastest_time,
            lowest_memory
        )
        
        player.score = score
        results[player_name]['score'] = score
    
    return results

def get_expected_result(room, player):
    """Get expected result for validation."""
    if room.purpose == "searching":
        # For searching, we need to find the target in the player's input
        try:
            return player.input_data.index(player.target)
        except ValueError:
            return -1  # Target not found
    else:
        # For sorting, return sorted array
        return sorted(player.input_data)