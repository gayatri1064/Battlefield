"""
Implementation of 0/1 Knapsack algorithms using different approaches
"""

def knapsack_dp(values, weights, capacity):
    """0/1 Knapsack using Dynamic Programming approach
    Time complexity: O(nW), Space complexity: O(nW)
    where n is number of items and W is capacity
    """
    n = len(values)
    dp = [[0 for _ in range(capacity + 1)] for _ in range(n + 1)]
    comparisons = 0
    
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            comparisons += 1
            if weights[i-1] <= w:
                dp[i][w] = max(values[i-1] + dp[i-1][w-weights[i-1]], dp[i-1][w])
            else:
                dp[i][w] = dp[i-1][w]
    
    # Backtrack to find selected items
    selected = []
    i, j = n, capacity
    while i > 0 and j > 0:
        comparisons += 1
        if dp[i][j] != dp[i-1][j]:
            selected.append(i-1)
            j -= weights[i-1]
        i -= 1
        
    return (dp[n][capacity], selected), comparisons

def knapsack_backtracking(values, weights, capacity):
    """0/1 Knapsack using Backtracking with memoization
    Time complexity: O(2^n) worst case, but much better with memoization
    Space complexity: O(n) for recursion stack
    """
    n = len(values)
    max_value = [0]  # Use list to modify in recursion
    best_selection = [[]]
    comparisons = 0
    
    def backtrack(index, curr_value, curr_weight, selected):
        nonlocal comparisons
        comparisons += 1
        if curr_weight > capacity:
            return
            
        if curr_value > max_value[0]:
            max_value[0] = curr_value
            best_selection[0] = selected.copy()
            
        if index >= n:
            return
            
        # Include current item
        backtrack(index + 1, 
                 curr_value + values[index],
                 curr_weight + weights[index], 
                 selected + [index])
                 
        # Exclude current item
        backtrack(index + 1, curr_value, curr_weight, selected)
    
    backtrack(0, 0, 0, [])
    return (max_value[0], best_selection[0]), comparisons

def knapsack_branch_bound(values, weights, capacity):
    """0/1 Knapsack using Branch and Bound approach
    Uses value per unit weight as bound
    Time complexity: O(2^n) worst case, but better in practice due to pruning
    Space complexity: O(n) for recursion stack
    """
    n = len(values)
    max_value = [0]
    best_selection = [[]]
    comparisons = 0
    
    # Sort items by value/weight ratio for better bounds
    items = list(zip(values, weights, range(n)))
    items.sort(key=lambda x: -x[0]/x[1])  # Descending ratio
    
    def bound(index, curr_value, curr_weight):
        """Calculate upper bound for remaining capacity"""
        if curr_weight >= capacity:
            return 0
        
        bound_value = curr_value
        total_weight = curr_weight
        
        while index < n and total_weight + items[index][1] <= capacity:
            total_weight += items[index][1]
            bound_value += items[index][0]
            index += 1
            
        if index < n:
            bound_value += (capacity - total_weight) * (items[index][0] / items[index][1])
            
        return bound_value
    
    def branch_and_bound(index, curr_value, curr_weight, selected):
        nonlocal comparisons
        comparisons += 1
        if curr_weight > capacity:
            return
            
        if curr_value > max_value[0]:
            max_value[0] = curr_value
            best_selection[0] = [items[i][2] for i in selected]  # Map back to original indices
            
        if index >= n:
            return
            
        # Check if this branch is worth exploring
        if bound(index, curr_value, curr_weight) > max_value[0]:
            # Include current item
            branch_and_bound(index + 1,
                           curr_value + items[index][0],
                           curr_weight + items[index][1],
                           selected + [index])
                            
            # Exclude current item
            branch_and_bound(index + 1, curr_value, curr_weight, selected)
    
    branch_and_bound(0, 0, 0, [])
    return (max_value[0], sorted(best_selection[0])), comparisons