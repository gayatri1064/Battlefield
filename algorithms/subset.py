# algorithms/subset.py

def subset_backtracking(nums):
    """
    Generate all subsets of a set using recursive backtracking.
    Input: list of elements
    Output: list of subsets
    """
    result = []
    n = len(nums)

    def backtrack(start, path):
        result.append(path[:])  # copy current subset
        for i in range(start, n):
            path.append(nums[i])
            backtrack(i + 1, path)
            path.pop()  # undo choice

    backtrack(0, [])
    return result


def subset_bitmasking(nums):
    """
    Generate all subsets of a set using bitmasking.
    Input: list of elements
    Output: list of subsets
    """
    result = []
    n = len(nums)

    for mask in range(1 << n):  # 2^n subsets
        subset = [nums[i] for i in range(n) if mask & (1 << i)]
        result.append(subset)

    return result
