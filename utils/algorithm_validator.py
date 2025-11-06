"""
Algorithm validation system to ensure correctness
"""
import random
import time
from typing import List, Callable, Any

class AlgorithmValidator:
    """Validates algorithm implementations against known correct results"""
    
    def __init__(self):
        self.test_cases = {
            'sorting': [
                ([5, 2, 8, 1, 9], [1, 2, 5, 8, 9]),
                ([1], [1]),
                ([], []),
                ([3, 3, 3], [3, 3, 3]),
                ([9, 8, 7, 6, 5], [5, 6, 7, 8, 9])
            ],
            'searching': [
                (([1, 2, 5, 8, 9], 5), 2),  # (array, target), expected_index
                (([1, 2, 5, 8, 9], 10), -1),
                (([1], 1), 0),
                (([], 5), -1)
            ]
        }
    
    def validate_sorting_algorithm(self, func: Callable, algorithm_name: str) -> dict:
        """Validate a sorting algorithm against test cases"""
        results = {'passed': 0, 'failed': 0, 'errors': []}
        
        for input_arr, expected in self.test_cases['sorting']:
            try:
                result = func(input_arr.copy())
                if result == expected:
                    results['passed'] += 1
                else:
                    results['failed'] += 1
                    results['errors'].append(f"Input: {input_arr}, Expected: {expected}, Got: {result}")
            except Exception as e:
                results['failed'] += 1
                results['errors'].append(f"Error with input {input_arr}: {str(e)}")
        
        # Performance test with larger array
        large_array = list(range(1000, 0, -1))  # Reverse sorted (worst case for some algorithms)
        start_time = time.perf_counter()
        try:
            func(large_array.copy())
            end_time = time.perf_counter()
            results['performance_ms'] = (end_time - start_time) * 1000
        except Exception as e:
            results['performance_error'] = str(e)
        
        return results
    
    def validate_searching_algorithm(self, func: Callable, algorithm_name: str) -> dict:
        """Validate a searching algorithm against test cases"""
        results = {'passed': 0, 'failed': 0, 'errors': []}
        
        for (input_arr, target), expected in self.test_cases['searching']:
            try:
                result = func(input_arr.copy(), target)
                if result == expected:
                    results['passed'] += 1
                else:
                    results['failed'] += 1
                    results['errors'].append(f"Input: {input_arr}, Target: {target}, Expected: {expected}, Got: {result}")
            except Exception as e:
                results['failed'] += 1
                results['errors'].append(f"Error with input {input_arr}, target {target}: {str(e)}")
        
        return results
    
    def benchmark_against_builtin(self, custom_func: Callable, category: str, test_size: int = 1000) -> dict:
        """Benchmark custom implementation against Python's built-in"""
        test_data = [random.randint(1, 1000) for _ in range(test_size)]
        
        if category == 'sorting':
            # Test custom vs built-in sort
            start_time = time.perf_counter()
            custom_result = custom_func(test_data.copy())
            custom_time = (time.perf_counter() - start_time) * 1000
            
            start_time = time.perf_counter()
            builtin_result = sorted(test_data.copy())
            builtin_time = (time.perf_counter() - start_time) * 1000
            
            return {
                'custom_time_ms': custom_time,
                'builtin_time_ms': builtin_time,
                'speedup_factor': custom_time / builtin_time if builtin_time > 0 else float('inf'),
                'correctness': custom_result == builtin_result
            }
        
        return {'error': 'Category not supported for benchmarking'}

# Usage example
def validate_all_algorithms():
    """Validate all algorithms in the project"""
    from algorithms.sorting import bubble_sort, merge_sort, quick_sort
    from algorithms.searching import linear_search, binary_search
    
    validator = AlgorithmValidator()
    
    # Validate sorting algorithms
    sorting_algos = [
        (bubble_sort, "Bubble Sort"),
        (merge_sort, "Merge Sort"),
        (quick_sort, "Quick Sort")
    ]
    
    print("=== SORTING ALGORITHM VALIDATION ===")
    for func, name in sorting_algos:
        result = validator.validate_sorting_algorithm(func, name)
        print(f"\n{name}:")
        print(f"  Tests passed: {result['passed']}")
        print(f"  Tests failed: {result['failed']}")
        if result['errors']:
            print(f"  Errors: {result['errors']}")
        if 'performance_ms' in result:
            print(f"  Performance (1000 items): {result['performance_ms']:.3f}ms")
        
        # Benchmark against built-in
        benchmark = validator.benchmark_against_builtin(func, 'sorting')
        print(f"  vs Built-in: {benchmark['speedup_factor']:.2f}x slower" if benchmark['speedup_factor'] > 1 else f"  vs Built-in: {1/benchmark['speedup_factor']:.2f}x faster")
    
    # Validate searching algorithms
    searching_algos = [
        (linear_search, "Linear Search"),
        (binary_search, "Binary Search")
    ]
    
    print("\n=== SEARCHING ALGORITHM VALIDATION ===")
    for func, name in searching_algos:
        result = validator.validate_searching_algorithm(func, name)
        print(f"\n{name}:")
        print(f"  Tests passed: {result['passed']}")
        print(f"  Tests failed: {result['failed']}")
        if result['errors']:
            print(f"  Errors: {result['errors']}")

if __name__ == "__main__":
    validate_all_algorithms()