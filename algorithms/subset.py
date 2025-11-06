# algorithms/subset.py
import itertools

def subset_backtracking(nums):
    """
    Generate all subsets using Python's built-in itertools.combinations.
    Much faster and more reliable than manual backtracking.
    """
    result = []
    comparisons = 0
    # Generate subsets of all possible lengths (0 to len(nums))
    for r in range(len(nums) + 1):
        for combo in itertools.combinations(nums, r):
            result.append(list(combo))
            comparisons += 1
    return result, comparisons


def subset_bitmasking(nums):
    """
    Alternative implementation using itertools.powerset recipe.
    Even more Pythonic approach to generate all subsets.
    """
    # Using itertools chain and combinations for powerset
    from itertools import chain, combinations
    
    def powerset(iterable):
        s = list(iterable)
        return chain.from_iterable(combinations(s, r) for r in range(len(s)+1))
    
    result = []
    comparisons = 0
    for subset in powerset(nums):
        result.append(list(subset))
        comparisons += 1
    return result, comparisons


def subset_recursive(nums):
    """
    Generate subsets using classic recursive backtracking.
    """
    result = []
    comparisons = 0

    def backtrack(i, path):
        nonlocal comparisons
        comparisons += 1
        if i == len(nums):
            result.append(path[:])
            return
        # Exclude current
        backtrack(i + 1, path)
        # Include current
        path.append(nums[i])
        backtrack(i + 1, path)
        path.pop()

    backtrack(0, [])
    return result, comparisons


def subset_iterative(nums):
    """
    Iterative method: start with empty subset and for each number extend existing subsets.
    """
    result = [[]]
    comparisons = 0
    for num in nums:
        new_subsets = [curr + [num] for curr in list(result)]
        comparisons += len(new_subsets)
        result += new_subsets
    return result, comparisons


def subset_builtin(nums):
    """
    Python built-in approach using itertools combinations (powerset recipe).
    Alias of bitmasking/powerset but kept separate for demonstration.
    """
    from itertools import chain, combinations

    def powerset(iterable):
        s = list(iterable)
        return chain.from_iterable(combinations(s, r) for r in range(len(s)+1))

    result = []
    comparisons = 0
    for subset in powerset(nums):
        result.append(list(subset))
        comparisons += 1
    return result, comparisons
