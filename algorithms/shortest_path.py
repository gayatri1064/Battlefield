import heapq


def dijkstra(graph, start):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)]
    comparisons = 0
    while pq:
        current_distance, current_node = heapq.heappop(pq)
        if current_distance > distances[current_node]:
            continue
        for neighbor, weight in graph.get(current_node, {}).items():
            comparisons += 1
            distance = current_distance + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))
    return distances, comparisons



def bellman_ford(graph, start):
    
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    edges = [(u, v, w) for u in graph for v, w in graph[u].items()]
    comparisons = 0

    for _ in range(len(graph) - 1):
        for u, v, w in edges:
            comparisons += 1
            if distances[u] + w < distances[v]:
                distances[v] = distances[u] + w

    # Check for negative-weight cycles
    for u, v, w in edges:
        comparisons += 1
        if distances[u] + w < distances[v]:
            raise ValueError("Graph contains a negative-weight cycle")

    return distances, comparisons


def floyd_warshall(graph):
    # graph: dict {u: {v: weight, ...}, ...}
    nodes = list(graph.keys())
    dist = {u: {v: float('inf') for v in nodes} for u in nodes}
    comparisons = 0

    # Initialize distances
    for u in nodes:
        dist[u][u] = 0
        for v, w in graph[u].items():
            dist[u][v] = w

    # Relax via intermediate nodes
    for k in nodes:
        for i in nodes:
            for j in nodes:
                comparisons += 1
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]

    return dist, comparisons
