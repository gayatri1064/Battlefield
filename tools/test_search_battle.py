import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from algorithms.library import algorithms
from utils.profiler import run_algorithm
from utils.helpers import get_unified_input
from utils.scoring import score_algorithm

# Player 1: generated-like input (no target)
player1_data = {
    'category': 'searching',
    'algorithm': 'Linear Search',
    'custom_input': [[1,2,3,4], 999]
}
# Player 2: manual input with target at 5th position
player2_data = {
    'category': 'searching',
    'algorithm': 'Linear Search',
    'custom_input': [[10,20,30,40,50], 50]
}

# Prepare inputs per-player
from utils.helpers import generate_input
generated1 = generate_input(player1_data['category'], 20)
generated2 = generate_input(player2_data['category'], 20)

if 'custom_input' in player1_data and player1_data['custom_input'] is not None:
    data1 = get_unified_input(player1_data['category'], player1_data['custom_input'], size=20, custom=True)
else:
    data1 = get_unified_input(player1_data['category'], generated1, size=20, custom=False)

if 'custom_input' in player2_data and player2_data['custom_input'] is not None:
    data2 = get_unified_input(player2_data['category'], player2_data['custom_input'], size=20, custom=True)
else:
    data2 = get_unified_input(player2_data['category'], generated2, size=20, custom=False)

# Locate algorithm
def find_algo(category, name):
    cat = category.lower()
    return next((a for a in algorithms[cat] if a['name'] == name), None)

algo1 = find_algo(player1_data['category'], player1_data['algorithm'])
algo2 = find_algo(player2_data['category'], player2_data['algorithm'])
func1 = algo1['func']
func2 = algo2['func']

# Run
time1, mem1, correct1, result1 = run_algorithm(func1, *data1)
time2, mem2, correct2, result2 = run_algorithm(func2, *data2)

# Unpack comparison counts if provided
comparisons1 = None
comparisons2 = None
if isinstance(result1, (list, tuple)) and len(result1) == 2 and isinstance(result1[1], int):
    comparisons1 = result1[1]
    result_val1 = result1[0]
else:
    result_val1 = result1

if isinstance(result2, (list, tuple)) and len(result2) == 2 and isinstance(result2[1], int):
    comparisons2 = result2[1]
    result_val2 = result2[0]
else:
    result_val2 = result2

print('player1 result:', result_val1, 'comparisons:', comparisons1, 'time:', time1)
print('player2 result:', result_val2, 'comparisons:', comparisons2, 'time:', time2)

# Score
fastest_time = min(time1, time2)
lowest_memory = min(mem1, mem2)
score1 = score_algorithm(True, time1, mem1, fastest_time, lowest_memory)
score2 = score_algorithm(True, time2, mem2, fastest_time, lowest_memory)
print('scores', score1, score2)
if score1 > score2:
    print('winner: Player 1')
elif score2 > score1:
    print('winner: Player 2')
else:
    print('draw')
