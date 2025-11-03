

from algorithms.sorting import bubble_sort, insertion_sort, merge_sort, quick_sort, selection_sort, heap_sort
from algorithms.searching import linear_search, binary_search, fibonacci_search
from algorithms.shortest_path import dijkstra, bellman_ford, floyd_warshall
from algorithms.mcst import prim, kruskal
from algorithms.graph import bfs, dfs
from algorithms.string_matching import naive_search, kmp_search, rabin_karp, boyer_moore
from algorithms.subset import subset_bitmasking, subset_backtracking, subset_recursive, subset_iterative, subset_builtin
from algorithms.knapsack import knapsack_dp, knapsack_backtracking, knapsack_branch_bound



algorithms = {
    "string matching": [
        {"key": "naive_search", "name": "Naive Search", "func": naive_search, "category": "String Matching", "type": "custom"},
        {"key": "kmp_search", "name": "KMP Search", "func": kmp_search, "category": "String Matching", "type": "custom"},
        {"key": "rabin_karp", "name": "Rabin-Karp", "func": rabin_karp, "category": "String Matching", "type": "custom"},
        {"key": "boyer_moore", "name": "Boyer-Moore", "func": boyer_moore, "category": "String Matching", "type": "custom"},
    ],
    "sorting": [
        {"key": "bubble_sort", "name": "Bubble Sort", "func": bubble_sort, "type": "custom"},
        {"key": "insertion_sort", "name": "Insertion Sort", "func": insertion_sort, "type": "custom"},
        {"key": "merge_sort", "name": "Merge Sort", "func": merge_sort, "type": "custom"},
        {"key": "quick_sort", "name": "Quick Sort", "func": quick_sort, "type": "custom"},
        {"key": "selection_sort", "name": "Selection Sort", "func": selection_sort, "type": "custom"},
        {"key": "heap_sort", "name": "Heap Sort", "func": heap_sort, "type": "custom"},
        # Optimized implementations
        
    ],
    "searching": [
        {"key": "linear_search", "name": "Linear Search", "func": linear_search, "type": "custom"},
        {"key": "binary_search", "name": "Binary Search", "func": binary_search, "type": "custom"},
        {"key": "fibonacci_search", "name": "Fibonacci Search", "func": fibonacci_search, "type": "custom"},
        # Optimized implementations
        
    ],
    "shortest path": [
        {"key": "dijkstra", "name": "Dijkstra's Algorithm", "func": dijkstra},
        {"key": "bellman_ford", "name": "Bellman-Ford Algorithm", "func": bellman_ford},
        {"key": "floyd_warshall", "name": "Floyd-Warshall Algorithm", "func": floyd_warshall},
    ],
    "mst": [
        {"key": "prim", "name": "Prim's Algorithm", "func": prim},
        {"key": "kruskal", "name": "Kruskal's Algorithm", "func": kruskal},
    ],
    "graph": [
        {"key": "bfs", "name": "Breadth-First Search (BFS)", "func": bfs},
        {"key": "dfs", "name": "Depth-First Search (DFS)", "func": dfs},
    ],
 
     "subset generation": [  
        {"key": "subset_bitmasking", "name": "Bitmasking", "func": subset_bitmasking, "type": "iterative"},
        {"key": "subset_backtracking", "name": "Backtracking", "func": subset_backtracking, "type": "backtracking"},
        {"key": "subset_recursive", "name": "Recursive", "func": subset_recursive, "type": "recursive"},
        {"key": "subset_iterative", "name": "Iterative", "func": subset_iterative, "type": "iterative"},
        {"key": "subset_builtin", "name": "Python Built-in", "func": subset_builtin, "type": "builtin"},
    ],
    "0/1 knapsack": [
        {"key": "knapsack_dp", "name": "Dynamic Programming", "func": knapsack_dp, "type": "dp"},
        {"key": "knapsack_backtracking", "name": "Backtracking", "func": knapsack_backtracking, "type": "backtracking"},
        {"key": "knapsack_branch_bound", "name": "Branch & Bound", "func": knapsack_branch_bound, "type": "optimization"}
    ],
}
