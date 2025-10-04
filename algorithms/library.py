

from algorithms.sorting import bubble_sort, insertion_sort, merge_sort, quick_sort, selection_sort, heap_sort
from algorithms.searching import linear_search, binary_search, fibonacci_search
from algorithms.shortest_path import dijkstra, bellman_ford, floyd_warshall
from algorithms.mcst import prim, kruskal

from algorithms.graph import bfs, dfs
from algorithms.string_matching import naive_search, kmp_search, rabin_karp, boyer_moore
from algorithms.subset import subset_backtracking, subset_bitmasking 
algorithms = {
    "string matching": [
        {"name": "Naive Search", "func": naive_search, "category": "String Matching"},
        {"name": "KMP Search", "func": kmp_search, "category": "String Matching"},
        {"name": "Rabin-Karp", "func": rabin_karp, "category": "String Matching"},
        {"name": "Boyer-Moore", "func": boyer_moore, "category": "String Matching"},
    ],
    "sorting": [
        {"key": "bubble_sort", "name": "Bubble Sort", "func": bubble_sort},
        {"key": "insertion_sort", "name": "Insertion Sort", "func": insertion_sort},
        {"key": "merge_sort", "name": "Merge Sort", "func": merge_sort},
        {"key": "quick_sort", "name": "Quick Sort", "func": quick_sort},
        {"key": "selection_sort", "name": "Selection Sort", "func": selection_sort},
        {"key": "heap_sort", "name": "Heap Sort", "func": heap_sort},
    ],
    "searching": [
        {"key": "linear_search", "name": "Linear Search", "func": linear_search},
        {"key": "binary_search", "name": "Binary Search", "func": binary_search},
        {"key": "fibonacci_search", "name": "Fibonacci Search", "func": fibonacci_search},
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
        {"name": "Backtracking", "func": subset_backtracking},
        {"name": "Bitmasking", "func": subset_bitmasking},
    ],
}
