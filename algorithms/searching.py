"""
Searching algorithms using Python's built-in optimized functions where available
"""
import bisect

def linear_search(arr, target):
    """Using Python's built-in 'in' operator and index() method"""
    try:
        return arr.index(target)  # Built-in optimized linear search
    except ValueError:
        return -1

def binary_search(arr, target):
    """Using Python's optimized bisect module"""
    sorted_arr = sorted(arr)
    pos = bisect.bisect_left(sorted_arr, target)
    if pos < len(sorted_arr) and sorted_arr[pos] == target:
        return pos
    return -1

def fibonacci_search(arr, target):
    """Manual implementation - no built-in equivalent"""
    a = sorted(arr)
    n = len(a)
    
    # Initialize fibonacci numbers
    fib2 = 0  # (m-2)'th Fibonacci
    fib1 = 1  # (m-1)'th Fibonacci
    fib = fib1 + fib2  # m'th Fibonacci
    
    # Find the smallest Fibonacci number >= n
    while fib < n:
        fib2 = fib1
        fib1 = fib
        fib = fib1 + fib2
    
    # Marks the eliminated range from front
    offset = -1
    
    while fib > 1:
        # Check if fib2 is a valid location
        i = min(offset + fib2, n - 1)
        
        if a[i] < target:
            fib = fib1
            fib1 = fib2
            fib2 = fib - fib1
            offset = i
        elif a[i] > target:
            fib = fib2
            fib1 = fib1 - fib2
            fib2 = fib - fib1
        else:
            return i  # Found
    
    # Check if the last element is the target
    if fib1 and offset + 1 < n and a[offset + 1] == target:
        return offset + 1
    
    return -1  # Not found

