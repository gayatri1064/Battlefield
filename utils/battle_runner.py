from .profiler import run_algorithm
from .scoring import score_algorithm
from algorithms.library import algorithms 

def execute_battle(category, user1_algo, user2_algo, data1, data2):
    func1 = user1_algo["func"]
    func2 = user2_algo["func"]
    cat = category.lower()

    # --- Run User 1 ---
    if cat == "searching":
        arr1, target1 = data1
        time1, mem1, correct1, result1 = run_algorithm(func1, arr1, target1)
    elif cat in ("graph", "shortest_path", "mst"):
        graph1, start1 = data1
        time1, mem1, correct1, result1 = run_algorithm(func1, graph1, start1)
    elif cat == "string matching":
        text1, pattern1 = data1
        time1, mem1, correct1, result1 = run_algorithm(func1, text1, pattern1)
    elif cat == "sorting":
        time1, mem1, correct1, result1 = run_algorithm(func1, data1)
    elif cat in ("subset generation", "subset_generation"):
        # Pass the array directly for subset generation
        time1, mem1, correct1, result1 = run_algorithm(func1, data1)
    else:
        time1, mem1, correct1, result1 = run_algorithm(func1, data1)

    # --- Run User 2 ---
    if cat == "searching":
        arr2, target2 = data2
        time2, mem2, correct2, result2 = run_algorithm(func2, arr2, target2)
    elif cat in ("graph", "shortest_path", "mst"):
        graph2, start2 = data2
        time2, mem2, correct2, result2 = run_algorithm(func2, graph2, start2)
    elif cat == "string matching":
        text2, pattern2 = data2
        time2, mem2, correct2, result2 = run_algorithm(func2, text2, pattern2)
    elif cat == "sorting":
        time2, mem2, correct2, result2 = run_algorithm(func2, data2)
    elif cat in ("subset generation", "subset_generation"):
        # Pass the array directly for subset generation
        time2, mem2, correct2, result2 = run_algorithm(func2, data2)
    else:
        time2, mem2, correct2, result2 = run_algorithm(func2, data2)

    # --- Scoring ---
    fastest_time = min(time1, time2)
    lowest_memory = min(mem1, mem2)

    score1 = score_algorithm(correct1, time1, mem1, fastest_time, lowest_memory)
    score2 = score_algorithm(correct2, time2, mem2, fastest_time, lowest_memory)

    # --- Decide winner ---
    if score1 > score2:
        winner = user1_algo["name"]
    elif score2 > score1:
        winner = user2_algo["name"]
    else:
        winner = "Draw"

    return (result1, time1, mem1, correct1, score1), \
           (result2, time2, mem2, correct2, score2), \
           winner



def print_results(user1_algo, user2_algo,
                  result1, time1, mem1, correct1, score1,
                  result2, time2, mem2, correct2, score2,
                  winner):
    """Pretty-print the results of the battle."""
    print("\nResults:")
    print(f"{user1_algo['name']} → Result: {result1} | Time: {time1:.6f}s | "
          f"Memory: {mem1:.2f}MB | Correct: {correct1} | Score: {score1:.3f}")
    print(f"{user2_algo['name']} → Result: {result2} | Time: {time2:.6f}s | "
          f"Memory: {mem2:.2f}MB | Correct: {correct2} | Score: {score2:.3f}")

    print(f"\n🏆 Winner: {winner}")