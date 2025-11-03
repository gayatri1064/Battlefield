# algorithms/subset.py
import itertools

def subset_backtracking(nums):
    """
    Generate all subsets using Python's built-in itertools.combinations.
    Much faster and more reliable than manual backtracking.
    """
    result = []
    # Generate subsets of all possible lengths (0 to len(nums))
    for r in range(len(nums) + 1):
        for combo in itertools.combinations(nums, r):
            result.append(list(combo))
    return result


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
    
    result = [list(subset) for subset in powerset(nums)]
    return result


def subset_recursive(nums):
    """
    Generate subsets using classic recursive backtracking.
    """
    result = []

    def backtrack(i, path):
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
    return result


def subset_iterative(nums):
    """
    Iterative method: start with empty subset and for each number extend existing subsets.
    """
    result = [[]]
    for num in nums:
        # append current number to all existing subsets
        result += [curr + [num] for curr in list(result)]
    return result


def subset_builtin(nums):
    """
    Python built-in approach using itertools combinations (powerset recipe).
    Alias of bitmasking/powerset but kept separate for demonstration.
    """
    from itertools import chain, combinations

    def powerset(iterable):
        s = list(iterable)
        return chain.from_iterable(combinations(s, r) for r in range(len(s)+1))

    return [list(subset) for subset in powerset(nums)]
