import heapq
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        if node not in visited:
            visited.add(node)
            order.append(node)
            queue.extend(graph.get(node, []))
    return order

def dijkstra(graph, start):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)]
    while pq:
        current_distance, current_node = heapq.heappop(pq)
        if current_distance > distances[current_node]:
            continue
        for neighbor, weight in graph.get(current_node, {}).items():
            distance = current_distance + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))
    return distances

def dfs(graph, start):
    visited = set()
    stack = [start]
    order = []
    while stack:
        node = stack.pop()
        if node not in visited:
            visited.add(node)
            order.append(node)
            stack.extend(reversed(graph.get(node, [])))  # reverse for typical order
    return order

def prim(graph, start):
    visited = set([start])
    edges = [(weight, start, neighbor) for neighbor, weight in graph[start].items()]
    heapq.heapify(edges)
    mst = []
    while edges:
        weight, frm, to = heapq.heappop(edges)
        if to not in visited:
            visited.add(to)
            mst.append((frm, to, weight))
            for neighbor, w in graph[to].items():
                if neighbor not in visited:
                    heapq.heappush(edges, (w, to, neighbor))
    return mst

def kruskal(graph):
    parent = {}
    rank = {}

    def find(node):
        if parent[node] != node:
            parent[node] = find(parent[node])
        return parent[node]

    def union(u, v):
        root_u = find(u)
        root_v = find(v)
        if root_u != root_v:
            if rank[root_u] > rank[root_v]:
                parent[root_v] = root_u
            else:
                parent[root_u] = root_v
                if rank[root_u] == rank[root_v]:
                    rank[root_v] += 1

    # Initialize disjoint sets
    for node in graph:
        parent[node] = node
        rank[node] = 0

    # Create a list of edges and sort by weight
    edges = []
    for u in graph:
        for v, weight in graph[u].items():
            if (v, u, weight) not in edges:  # avoid duplicates in undirected graph
                edges.append((u, v, weight))
    edges.sort(key=lambda x: x[2])

    mst = []
    for u, v, weight in edges:
        if find(u) != find(v):
            union(u, v)
            mst.append((u, v, weight))

    return mst