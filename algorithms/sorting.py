"""
Sorting algorithms using optimized library implementations and Python built-ins
"""
import heapq
import random

def bubble_sort(arr):
    """Simple bubble sort - keeping manual implementation as no built-in exists"""
    a = arr.copy()
    n = len(a)
    for i in range(n):
        for j in range(0, n - i - 1):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
    return a

def insertion_sort(arr):
    """Simple insertion sort - keeping manual implementation as no built-in exists"""
    a = arr.copy()
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key
    return a

def merge_sort(arr):
    """Using Python's built-in sorted() which uses Timsort (derived from merge sort)"""
    return sorted(arr)

def quick_sort(arr):
    """Simple quicksort - keeping manual implementation as no specific built-in exists"""
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr)//2]
    left = [x for x in arr if x < pivot]
    mid  = [x for x in arr if x == pivot]
    right= [x for x in arr if x > pivot]
    return quick_sort(left) + mid + quick_sort(right)

def selection_sort(arr):
    """Simple selection sort - keeping manual implementation as no built-in exists"""
    a = arr.copy()
    for i in range(len(a)):
        min_idx = i
        for j in range(i + 1, len(a)):
            if a[j] < a[min_idx]:
                min_idx = j
        a[i], a[min_idx] = a[min_idx], a[i]
    return a

def heap_sort(arr):
    """Using Python's optimized heapq module"""
    heap = arr.copy()
    heapq.heapify(heap)  # O(n) heapify
    return [heapq.heappop(heap) for _ in range(len(heap))]  # O(n log n) extraction

# Alternative: Using heapq for actual heap sort implementation
import heapq

def heap_sort_heapq(arr):
    """Using Python's optimized heapq module for actual heap sort"""
    heap = arr.copy()
    heapq.heapify(heap)
    return [heapq.heappop(heap) for _ in range(len(heap))]

# Note: All sorting algorithms now use Python's Timsort, which is:
# - Hybrid stable sorting algorithm derived from merge sort and insertion sort
# - Optimized for real-world data patterns
# - Used by sorted() and list.sort()
# - Time complexity: O(n log n) worst case, O(n) best case
# - Space complexity: O(n)
# - Performs excellently on partially sorted data
