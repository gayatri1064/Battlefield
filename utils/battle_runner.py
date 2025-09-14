from .profiler import run_algorithm
from .scoring import score_algorithm
from algorithms.library import algorithms 

def execute_battle(category, user1_algo, user2_algo, arr, target):
    # Get the algorithm names (keys) from the user_algo dictionaries
    user1_algo_name = None
    user2_algo_name = None
    
    # Find the algorithm keys by matching the algorithm objects
    for key, algo_info in algorithms.items():
        if algo_info == user1_algo:
            user1_algo_name = key
        if algo_info == user2_algo:
            user2_algo_name = key
    
    # Get the actual functions
    func1 = algorithms[user1_algo_name]["func"]
    func2 = algorithms[user2_algo_name]["func"]

    # Run both algorithms
    if category.lower() == "searching":
        time1, mem1, correct1, result1 = run_algorithm(func1, arr, target)
        time2, mem2, correct2, result2 = run_algorithm(func2, arr, target)
        # For searching, the correct result would be the index or -1
        correct_result = result1 if correct1 else result2
    else:
        time1, mem1, correct1, result1 = run_algorithm(func1, arr)
        time2, mem2, correct2, result2 = run_algorithm(func2, arr)
        # For sorting, the correct result is the sorted array
        correct_result = sorted(arr)

    # Compute benchmarks
    fastest_time = min(time1, time2)
    lowest_memory = min(mem1, mem2)

    # Score each algorithm (note: fixed parameter order)
    score1 = score_algorithm(correct1, time1, mem1, fastest_time, lowest_memory)
    score2 = score_algorithm(correct2, time2, mem2, fastest_time, lowest_memory)

    # Decide winner
    if score1 > score2:
        winner = user1_algo["name"]
    elif score2 > score1:
        winner = user2_algo["name"]
    else:
        winner = "Draw"

    # Return results in the format expected by main.py
    return (result1, time1, mem1, correct1, score1), \
           (result2, time2, mem2, correct2, score2), \
           winner, correct_result


def print_results(user1_algo, user2_algo, result1, time1, mem1, correct1, score1,
                  result2, time2, mem2, correct2, score2, winner, target=None, correct_result=None):
    """Pretty-print the results of the battle."""
    print("\nResults:")
    print(f"{user1_algo['name']} → Result: {result1} | Target: {target} | "
          f"Time: {time1:.6f}s | Memory: {mem1:.2f}KB | Correct: {correct1} | Score: {score1:.3f}")
    print(f"{user2_algo['name']} → Result: {result2} | Target: {target} | "
          f"Time: {time2:.6f}s | Memory: {mem2:.2f}KB | Correct: {correct2} | Score: {score2:.3f}")

    print(f"\nExpected Result: {correct_result}")
    print(f"Winner: {winner}")