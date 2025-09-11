from .profiler import run_algorithm

def execute_battle(category, user1_algo, user2_algo, arr):
    """
    Runs algorithms for the given category and returns results + correctness check.
    """
    if category in ["sorting", "dp"]:
        result1, time1, mem1 = run_algorithm(user1_algo["func"], arr)
        result2, time2, mem2 = run_algorithm(user2_algo["func"], arr)
        correct_result = sorted(arr) if category == "sorting" else None

    elif category == "searching":
        target = int(input("Enter the target value to search: "))
        result1, time1, mem1 = run_algorithm(user1_algo["func"], arr, target)
        result2, time2, mem2 = run_algorithm(user2_algo["func"], arr, target)
        correct_result = target in arr
        result1 = (result1 != -1)
        result2 = (result2 != -1)

    elif category == "graph":
        print("Graph input example: {'A':{'B':1,'C':2}, 'B':{'C':3}, 'C':{}}")
        graph_input = input("Enter graph as dictionary (or leave blank for sample): ")
        if graph_input.strip():
            graph = eval(graph_input)
        else:
            graph = {"A": {"B": 1, "C": 4}, "B": {"C": 2}, "C": {}}
        start_node = input("Enter start node: ")
        result1, time1, mem1 = run_algorithm(user1_algo["func"], graph, start_node)
        result2, time2, mem2 = run_algorithm(user2_algo["func"], graph, start_node)
        correct_result = True  # Graph correctness not auto-checked

    else:
        raise ValueError(f"Unknown category: {category}")

    return (result1, time1, mem1), (result2, time2, mem2), correct_result
