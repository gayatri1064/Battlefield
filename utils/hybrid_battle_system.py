"""
Hybrid approach: Compare multiple implementations of the same algorithm
"""
from algorithms.sorting import bubble_sort as custom_bubble_sort
from algorithms.standard_library import python_builtin_sort
import time

# Algorithm categories with multiple implementations
ALGORITHM_IMPLEMENTATIONS = {
    "sorting": {
        "Bubble Sort": {
            "custom": custom_bubble_sort,
            "description": "Manual implementation"
        },
        "Python Built-in Sort": {
            "builtin": python_builtin_sort,
            "description": "Python's optimized Timsort"
        },
        "NumPy Sort": {
            "numpy": None,  # Would load numpy_sort if numpy is available
            "description": "NumPy's optimized sort"
        }
    },
    "searching": {
        "Linear Search": {
            "custom": None,  # Your custom implementation
            "builtin": None,  # Python's 'in' operator or list.index()
        },
        "Binary Search": {
            "custom": None,  # Your custom implementation  
            "builtin": None,  # Python's bisect module
        }
    }
}

class AlgorithmBattleSystem:
    """Enhanced battle system with multiple implementation options"""
    
    def __init__(self):
        self.available_implementations = ["custom", "builtin", "numpy", "scipy"]
    
    def get_algorithm_options(self, category: str) -> dict:
        """Get all available implementations for a category"""
        options = {}
        for algo_name, implementations in ALGORITHM_IMPLEMENTATIONS.get(category, {}).items():
            available = []
            for impl_type, func in implementations.items():
                if impl_type != "description" and func is not None:
                    available.append(impl_type)
            if available:
                options[algo_name] = {
                    "implementations": available,
                    "description": implementations.get("description", "")
                }
        return options
    
    def run_algorithm_battle(self, algo1_info: dict, algo2_info: dict, test_data: list) -> dict:
        """
        Run battle between two algorithm implementations
        
        algo_info format: {
            "name": "Bubble Sort",
            "implementation": "custom",  # or "builtin", "numpy", etc.
            "function": actual_function
        }
        """
        results = {}
        
        for player, algo_info in [("player1", algo1_info), ("player2", algo2_info)]:
            start_time = time.perf_counter()
            try:
                result = algo_info["function"](test_data.copy())
                end_time = time.perf_counter()
                
                results[player] = {
                    "name": f"{algo_info['name']} ({algo_info['implementation']})",
                    "time_ms": (end_time - start_time) * 1000,
                    "result": result,
                    "success": True,
                    "implementation_type": algo_info['implementation']
                }
            except Exception as e:
                results[player] = {
                    "name": f"{algo_info['name']} ({algo_info['implementation']})",
                    "error": str(e),
                    "success": False,
                    "implementation_type": algo_info['implementation']
                }
        
        # Determine winner
        if results["player1"]["success"] and results["player2"]["success"]:
            if results["player1"]["time_ms"] < results["player2"]["time_ms"]:
                winner = "player1"
            elif results["player2"]["time_ms"] < results["player1"]["time_ms"]:
                winner = "player2"
            else:
                winner = "tie"
        elif results["player1"]["success"]:
            winner = "player1"
        elif results["player2"]["success"]:
            winner = "player2"
        else:
            winner = "both_failed"
        
        results["winner"] = winner
        return results

# Example usage
def demonstrate_hybrid_approach():
    """Show how multiple implementations can be compared"""
    
    # Test data
    test_array = [64, 34, 25, 12, 22, 11, 90]
    
    battle_system = AlgorithmBattleSystem()
    
    # Get available options
    sorting_options = battle_system.get_algorithm_options("sorting")
    print("Available sorting implementations:")
    for algo, info in sorting_options.items():
        print(f"  {algo}: {info['implementations']}")
    
    # Example battle: Custom vs Built-in
    algo1 = {
        "name": "Bubble Sort",
        "implementation": "custom", 
        "function": custom_bubble_sort
    }
    
    algo2 = {
        "name": "Python Sort",
        "implementation": "builtin",
        "function": python_builtin_sort
    }
    
    battle_result = battle_system.run_algorithm_battle(algo1, algo2, test_array)
    
    print(f"\nBattle Results:")
    print(f"Player 1: {battle_result['player1']['name']} - {battle_result['player1']['time_ms']:.3f}ms")
    print(f"Player 2: {battle_result['player2']['name']} - {battle_result['player2']['time_ms']:.3f}ms")
    print(f"Winner: {battle_result['winner']}")

if __name__ == "__main__":
    demonstrate_hybrid_approach()