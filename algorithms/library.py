from algorithms.sorting import bubble_sort, insertion_sort, merge_sort, quick_sort, selection_sort, heap_sort
from algorithms.searching import linear_search, binary_search, fibonacci_search
from algorithms.graph import dijkstra, bfs,dfs, prim, kruskal
from algorithms.dp import fibonacci_recursive, fibonacci_dp

algorithms = {
    "bubble_sort": {"name": "Bubble Sort", "category": "sorting", "func": bubble_sort},
    "insertion_sort": {"name": "Insertion Sort", "category": "sorting", "func": insertion_sort},
    "merge_sort": {"name": "Merge Sort", "category": "sorting", "func": merge_sort},
    "quick_sort": {"name": "Quick Sort", "category": "sorting", "func": quick_sort},
    "selection_sort": {"name": "Selection Sort", "category": "sorting", "func": selection_sort},
    "heap_sort": {"name": "Heap Sort", "category": "sorting", "func": heap_sort},
    "linear_search": {"name": "Linear Search", "category": "searching", "func": linear_search},
    "binary_search": {"name": "Binary Search", "category": "searching", "func": binary_search},
    "fibonacci_search": {"name": "Fibonacci Search", "category": "searching", "func": fibonacci_search},
    "dijkstra": {"name": "Dijkstra's Algorithm", "category": "graph", "func": dijkstra},
    "bfs": {"name": "BFS", "category": "graph", "func": bfs},
    "dfs": {"name": "Depth-First Search (DFS)", "category": "graph", "func": dfs},
    "prim": {"name": "Prim's Algorithm", "category": "graph", "func": prim},
    "kruskal": {"name": "Kruskal's Algorithm", "category": "graph", "func": kruskal},
    "fibonacci_recursive": {"name": "Fibonacci Recursive", "category": "dp", "func": fibonacci_recursive},
    "fibonacci_dp": {"name": "Fibonacci DP", "category": "dp", "func": fibonacci_dp},
}
