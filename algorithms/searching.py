def linear_search(arr, target):
    for i, val in enumerate(arr):
        if val == target:
            return i
    return -1

def binary_search(arr, target):
    a = sorted(arr)
    left, right = 0, len(a) - 1
    while left <= right:
        mid = (left + right) // 2
        if a[mid] == target:
            return mid
        elif a[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

def fibonacci_search(arr, target):
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
            # Move the three Fibonacci variables one step forward
            fib = fib1
            fib1 = fib2
            fib2 = fib - fib1
            offset = i
        elif a[i] > target:
            # Move the three Fibonacci variables two steps backward
            fib = fib2
            fib1 = fib1 - fib2
            fib2 = fib - fib1
        else:
            return i  # Found
    
    # Check if the last element is the target
    if fib1 and offset + 1 < n and a[offset + 1] == target:
        return offset + 1
    
    return -1  # Not found

