"""
Searching algorithms using Python's built-in optimized functions where available
"""
import bisect

def linear_search(arr, target):
    """Linear search with explicit comparison counting.

    Returns a tuple: (index_or_-1, comparisons)
    """
    comparisons = 0
    for i, v in enumerate(arr):
        comparisons += 1
        if v == target:
            return i, comparisons
    return -1, comparisons

def binary_search(arr, target):
    """Binary search (on a sorted copy) with comparison counting.

    Returns a tuple: (index_or_-1, comparisons)
    """
    a = sorted(arr)
    lo, hi = 0, len(a) - 1
    comparisons = 0
    while lo <= hi:
        mid = (lo + hi) // 2
        comparisons += 1
        if a[mid] == target:
            return mid, comparisons
        elif a[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1, comparisons

def fibonacci_search(arr, target):
    """Fibonacci search with comparison counting.

    Returns a tuple: (index_or_-1, comparisons)
    """
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
    comparisons = 0

    while fib > 1:
        # Check if fib2 is a valid location
        i = min(offset + fib2, n - 1)
        comparisons += 1

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
            return i, comparisons  # Found

    # Check if the last element is the target
    if fib1 and offset + 1 < n:
        comparisons += 1
        if a[offset + 1] == target:
            return offset + 1, comparisons

    return -1, comparisons  # Not found

