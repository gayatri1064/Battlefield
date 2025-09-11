from algorithms.sorting import bubble_sort, insertion_sort, merge_sort, quick_sort
from algorithms.searching import linear_search, binary_search
from algorithms.graph import dijkstra, bfs
from algorithms.dp import fibonacci_recursive, fibonacci_dp

algorithms = {
    "bubble_sort": {"name": "Bubble Sort", "category": "sorting", "func": bubble_sort},
    "insertion_sort": {"name": "Insertion Sort", "category": "sorting", "func": insertion_sort},
    "merge_sort": {"name": "Merge Sort", "category": "sorting", "func": merge_sort},
    "quick_sort": {"name": "Quick Sort", "category": "sorting", "func": quick_sort},
    "linear_search": {"name": "Linear Search", "category": "searching", "func": linear_search},
    "binary_search": {"name": "Binary Search", "category": "searching", "func": binary_search},
    "dijkstra": {"name": "Dijkstra's Algorithm", "category": "graph", "func": dijkstra},
    "bfs": {"name": "BFS", "category": "graph", "func": bfs},
    "fibonacci_recursive": {"name": "Fibonacci Recursive", "category": "dp", "func": fibonacci_recursive},
    "fibonacci_dp": {"name": "Fibonacci DP", "category": "dp", "func": fibonacci_dp},
}
