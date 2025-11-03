import random
def choose_category(algorithms):
    """Let the user choose a category of algorithms with validation."""
    categories = sorted(algorithms.keys())
    while True:
        print("\nSelect Purpose / Algorithm Category:")
        for i, category in enumerate(categories, 1):
            print(f"{i}. {category.capitalize()}")

        choice = input("Enter your choice: ").strip()
        if not choice.isdigit():
            print("❌ Invalid input. Please enter a number.")
            continue

        choice = int(choice)
        if 1 <= choice <= len(categories):
            return categories[choice - 1]
        else:
            print("❌ Invalid choice. Please select a valid category number.")


def choose_algorithm(category, player_num, algorithms, taken_algo=None):
    """Let a player choose an algorithm within a category. Prevent duplicate picks."""
    algos = algorithms[category]

    print(f"\nPlayer {player_num}, choose your algorithm from {category}:")
    for i, algo in enumerate(algos, 1):
        # mark if already taken
        taken_marker = " (❌ Taken)" if taken_algo and algo["name"] == taken_algo["name"] else ""
        print(f"{i}. {algo['name']}{taken_marker}")

    while True:
        choice = input("Enter your choice: ").strip()
        if not choice.isdigit():
            print("❌ Invalid input. Please enter a number.")
            continue

        choice = int(choice)
        if 1 <= choice <= len(algos):
            algo = algos[choice - 1]
            if taken_algo and algo["name"] == taken_algo["name"]:
                print("❌ This algorithm is already taken! Choose another one.")
                continue
            return algo
        else:
            print("❌ Invalid choice. Please select a valid algorithm number.")


def generate_input(category, size=20):
    """Generate appropriate input for each algorithm category."""
    category = category.lower()

    if category == "sorting":
        # Sorting: Array of numbers to sort
        return random.sample(range(1, size * 10), size)

    elif category == "searching":
        # Searching: Array + target value
        arr = sorted(random.sample(range(1, size * 10), size))
        target = random.choice(arr) if random.random() > 0.3 else random.randint(1, size * 10)
        return arr, target

    elif category == "string matching":
        # String matching: Text + pattern to search for
        letters = "abcdefghijklmnopqrstuvwxyz"
        text_length = max(50, size * 3)  # Longer text for meaningful search
        text = "".join(random.choice(letters) for _ in range(text_length))
        
        # Create pattern that exists in text (70% chance) or random pattern (30% chance)
        if random.random() < 0.7:
            pattern_size = max(3, size // 4)
            start = random.randint(0, len(text) - pattern_size)
            pattern = text[start:start + pattern_size]
        else:
            pattern = "xyz123"  # Pattern that likely won't be found
        return text, pattern

    elif category == "graph":
        # Graph traversal: Adjacency list + starting node
        nodes = min(size, 10)  # Limit graph size for performance
        node_names = [chr(65 + i) for i in range(nodes)]
        
        # Create adjacency list representation
        graph = {node: [] for node in node_names}
        
        # Add random edges (undirected graph)
        for i in range(nodes):
            for j in range(i + 1, nodes):
                if random.random() < 0.4:  # 40% chance of edge
                    graph[node_names[i]].append(node_names[j])
                    graph[node_names[j]].append(node_names[i])
        
        start_node = random.choice(node_names)
        return graph, start_node

    elif category == "shortest path":
        # Shortest path: Weighted graph + starting node
        nodes = min(size, 8)  # Smaller for shortest path algorithms
        node_names = [chr(65 + i) for i in range(nodes)]
        
        # Create weighted adjacency list
        graph = {node: [] for node in node_names}
        
        # Add weighted edges
        for i in range(nodes):
            for j in range(nodes):
                if i != j and random.random() < 0.5:
                    weight = random.randint(1, 20)
                    graph[node_names[i]].append((node_names[j], weight))
        
        start_node = random.choice(node_names)
        return graph, start_node

    elif category == "mst":
        # MST: Weighted undirected graph
        nodes = min(size, 8)
        node_names = [chr(65 + i) for i in range(nodes)]
        
        # Create edge list for MST algorithms
        edges = []
        for i in range(nodes):
            for j in range(i + 1, nodes):
                if random.random() < 0.6:  # 60% chance of edge
                    weight = random.randint(1, 25)
                    edges.append((node_names[i], node_names[j], weight))
        
        return edges, node_names

    elif category == "subset generation":
        # Subset generation: Array of elements
        elements = list(range(1, min(size, 6) + 1))  # Limit to 6 elements max
        return elements
        
    elif category == "0/1 knapsack":
        # Generate items with values and weights
        num_items = min(size, 10)  # Limit items for performance
        values = [random.randint(10, 100) for _ in range(num_items)]
        weights = [random.randint(5, 30) for _ in range(num_items)]
        capacity = random.randint(sum(weights) // 3, sum(weights) // 2)  # Make it challenging
        return values, weights, capacity

    else:
        # Fallback: return simple array
        return random.sample(range(1, size * 10), size)

def get_unified_input(category, input_data, size=None, custom=False):
    """Return properly formatted input for each algorithm category."""
    category = category.lower()
    
    # For web application, we don't need custom input prompts
    # Just return the generated data in the correct format
    
    if category == "sorting":
        return (input_data,)  # Single argument: array
        
    elif category == "searching":
        arr, target = input_data
        return (arr, target)  # Two arguments: array, target
        
    elif category == "string matching":
        text, pattern = input_data
        return (text, pattern)  # Two arguments: text, pattern
        
    elif category == "graph":
        graph, start_node = input_data
        return (graph, start_node)  # Two arguments: graph, start_node
        
    elif category == "shortest path":
        graph, start_node = input_data
        return (graph, start_node)  # Two arguments: weighted_graph, start_node
        
    elif category == "mst":
        edges, nodes = input_data
        return (edges,)  # Single argument: edge_list
        
    elif category == "subset generation":
        return (input_data,)  # Single argument: array
        
    elif category == "0/1 knapsack":
        values, weights, capacity = input_data
        return (values, weights, capacity)  # Three arguments: values, weights, capacity
        
    else:
        # Fallback: treat as array input
        return (input_data,)

