import heapq
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    order = []
    comparisons = 0
    while queue:
        node = queue.popleft()
        comparisons += 1
        if node not in visited:
            visited.add(node)
            order.append(node)
            neighbors = graph.get(node, [])
            for nb in neighbors:
                comparisons += 1
            queue.extend(neighbors)
    return order, comparisons

def dfs(graph, start):
    visited = set()
    stack = [start]
    order = []
    comparisons = 0
    while stack:
        node = stack.pop()
        comparisons += 1
        if node not in visited:
            visited.add(node)
            order.append(node)
            neighbors = list(graph.get(node, []))
            for nb in neighbors:
                comparisons += 1
            stack.extend(reversed(neighbors))  # reverse for typical order
    return order, comparisons


