import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from algorithms.library import algorithms
from utils.profiler import run_algorithm
from utils.helpers import get_unified_input
from algorithms.knapsack import knapsack_dp
from utils.scoring import score_algorithm

# Craft inputs: Player 1 has the pattern present; Player 2 does not
text_with_pattern = "this is a sample text where pattern occurs at index 10pattern"
pattern = "pattern"

text_without = "this text does not contain the searched token"
pattern2 = "pattern"

player1_data = {
    "category": "string matching",
    "algorithm": "Naive Search",
    "custom_input": [text_with_pattern, pattern]
}

player2_data = {
    "category": "string matching",
    "algorithm": "Naive Search",
    "custom_input": [text_without, pattern2]
}

# Prepare inputs per-player (use each player's custom input if provided,
# otherwise generate one for their category) — matches current server logic.
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

# Locate algorithm functions by name
def find_algo(category, name):
    cat = category.lower()
    if cat not in algorithms:
        return None
    return next((a for a in algorithms[cat] if a['name'] == name), None)

algo1 = find_algo(player1_data['category'], player1_data['algorithm'])
algo2 = find_algo(player2_data['category'], player2_data['algorithm'])
if not algo1 or not algo2:
    print('Algorithm not found')
    sys.exit(1)

func1 = algo1['func']
func2 = algo2['func']

time1, mem1, correct1, result1 = run_algorithm(func1, *data1)
time2, mem2, correct2, result2 = run_algorithm(func2, *data2)

print('Raw results:')
print('player1 result:', result1, 'correct flag:', correct1, 'time:', time1, 'mem:', mem1)
print('player2 result:', result2, 'correct flag:', correct2, 'time:', time2, 'mem:', mem2)

# Compute expected (same logic as in app.py)
def compute_expected(category, data_args):
    cat = category.lower()
    try:
        if cat == 'string matching':
            text, pattern = data_args
            expected = [i for i in range(len(text)) if text.startswith(pattern, i)]
            return expected
        if cat == 'sorting':
            arr = data_args[0]
            return sorted(arr)
        if cat == 'searching':
            arr, target = data_args
            return (target in arr)
        if cat == 'subset generation':
            arr = list(data_args[0])
            from itertools import chain, combinations
            def powerset(iterable):
                s = list(iterable)
                return chain.from_iterable(combinations(s, r) for r in range(len(s)+1))
            expected = [list(x) for x in powerset(arr)]
            return expected
        if cat == '0/1 knapsack':
            values, weights, capacity = data_args
            best_value, _ = knapsack_dp(values, weights, capacity)
            return best_value
    except Exception as e:
        print('Expected computation error:', e)
        return None
    return None

expected1 = compute_expected(player1_data['category'], data1)
expected2 = compute_expected(player2_data['category'], data2)

print('expected1:', expected1)
print('expected2:', expected2)

# Validate results
cat1 = player1_data['category'].lower()
if expected1 is not None:
    if cat1 == 'string matching':
        correct1 = (result1 == expected1)
    elif cat1 == 'sorting':
        correct1 = (result1 == expected1)
    elif cat1 == 'searching':
        correct1 = ((result1 != -1) == expected1)
    elif cat1 == 'subset generation':
        set_res = set(tuple(sorted(x)) for x in result1) if result1 is not None else set()
        set_exp = set(tuple(sorted(x)) for x in expected1)
        correct1 = (set_res == set_exp)
    elif cat1 == '0/1 knapsack':
        correct1 = (isinstance(result1, (list, tuple)) and result1[0] == expected1) or (result1 == expected1)

cat2 = player2_data['category'].lower()
if expected2 is not None:
    if cat2 == 'string matching':
        correct2 = (result2 == expected2)
    elif cat2 == 'sorting':
        correct2 = (result2 == expected2)
    elif cat2 == 'searching':
        correct2 = ((result2 != -1) == expected2)
    elif cat2 == 'subset generation':
        set_res = set(tuple(sorted(x)) for x in result2) if result2 is not None else set()
        set_exp = set(tuple(sorted(x)) for x in expected2)
        correct2 = (set_res == set_exp)
    elif cat2 == '0/1 knapsack':
        correct2 = (isinstance(result2, (list, tuple)) and result2[0] == expected2) or (result2 == expected2)

print('\nAfter expected-check:')
print('player1 correct:', correct1)
print('player2 correct:', correct2)

# Score
fastest_time = min(time1, time2)
lowest_memory = min(mem1, mem2)
score1 = score_algorithm(correct1, time1, mem1, fastest_time, lowest_memory)
score2 = score_algorithm(correct2, time2, mem2, fastest_time, lowest_memory)

print('\nscores: ', score1, score2)
if score1 > score2:
    print('winner: Player 1')
elif score2 > score1:
    print('winner: Player 2')
else:
    print('winner: Draw')
