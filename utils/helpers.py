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
    """Generate random input depending on category."""
    category = category.lower()

    if category == "sorting":
        return random.sample(range(1, size * 10), size)

    elif category == "searching":
        arr = sorted(random.sample(range(1, size * 10), size))
        target = random.choice(arr) if random.random() > 0.3 else -1
        return arr, target

    elif category in ("graph", "shortest path", "mst"):
        nodes = [chr(65 + i) for i in range(size)]
        graph = {u: {} for u in nodes}
        for u in nodes:
            for v in nodes:
                if u != v and random.random() < 0.3: 
                    graph[u][v] = random.randint(1, 20)
        start = random.choice(nodes)
        return graph, start

    elif category == "string":
        letters = "abcdefghijklmnopqrstuvwxyz"
        text = "".join(random.choice(letters) for _ in range(size))
        pattern_size = max(1, size // 5)
        start = random.randint(0, size - pattern_size)
        pattern = text[start:start + pattern_size]
        return text, pattern

    elif category == "string matching":
        letters = "abcdefghijklmnopqrstuvwxyz"
        text = "".join(random.choice(letters) for _ in range(size))
        pattern_size = max(2, size // 6)
        start = random.randint(0, size - pattern_size)
        pattern = text[start:start + pattern_size]
        return text, pattern

    elif category == "dp":
        values = [random.randint(10, 100) for _ in range(size)]
        weights = [random.randint(1, 20) for _ in range(size)]
        capacity = random.randint(size, size * 5)
        return values, weights, capacity
    
    elif category == "subset generation":  
        arr = [1, 2, 3, 4]
        return arr

    else:
        raise ValueError(f"No generator defined for category: {category}")

def get_unified_input(category, input_data, size=None, custom=False):
    """Custom input handler depending on category. Optionally shows input size for clarity.
       If custom=False, uses generated input directly without extra prompts.
    """
    category = category.lower()

    if category == "sorting":
        if size:
            print(f"\nGenerated array of size {size}: {input_data}")
        if custom:
            print("Enter numbers separated by spaces to override or press Enter to use above:")
            user_input = input().strip()
            if user_input:
                return list(map(int, user_input.split()))
        return input_data

    elif category == "searching":
        arr, target = input_data
        if size:
            print(f"\nGenerated sorted array of size {size}: {arr}")
            print(f"Generated target: {target}")
        if custom:
            print("Enter sorted numbers separated by spaces to override or press Enter to use above:")
            user_arr = input().strip()
            if user_arr:
                arr = list(map(int, user_arr.split()))
            user_target = input(f"Enter target value (or press Enter to use {target}): ").strip()
            if user_target:
                target = int(user_target)
        return arr, target

    elif category in ("graph", "shortest path", "mst"):
        graph, start = input_data
        if size:
            print(f"\nGenerated graph with approx {size} nodes: {graph}")
            print(f"Start node: {start}")
        if custom:
            print("\nEnter edges in format: <source> <destination> <weight>")
            print("Type 'done' when finished.\n")
            graph = {}
            nodes_set = set()
            while True:
                line = input().strip()
                if line.lower() == "done":
                    break
                try:
                    u, v, w = line.split()
                    w = int(w)
                    nodes_set.update([u, v])
                    if u not in graph:
                        graph[u] = {}
                    if v not in graph:
                        graph[v] = {}
                    graph[u][v] = w
                except ValueError:
                    print("❌ Invalid format! Use: <node1> <node2> <weight>")
            start = input(f"Enter start node from {sorted(nodes_set)}: ").strip()
            if start not in nodes_set:
                start = sorted(nodes_set)[0]
        return graph, start

    elif category == "string":
        text, pattern = input_data
        if size:
            print(f"\nGenerated text of size {size}: {text}")
            print(f"Generated pattern: {pattern}")
        if custom:
            user_text = input(f"Enter text (or press Enter to use generated): ").strip()
            if user_text:
                text = user_text
            user_pattern = input(f"Enter pattern (or press Enter to use generated): ").strip()
            if user_pattern:
                pattern = user_pattern
        return text, pattern

    elif category == "string matching":
        text, pattern = input_data
        if size:
            print(f"\nGenerated text of size {size}: {text}")
            print(f"Generated pattern: {pattern}")
        if custom:
            user_text = input(f"Enter text string (or press Enter to use generated): ").strip()
            if user_text:
                text = user_text
            user_pattern = input(f"Enter pattern to search (or press Enter to use generated): ").strip()
            if user_pattern:
                pattern = user_pattern
        return text, pattern

    elif category == "dp":
        values, weights, capacity = input_data
        if size:
            print(f"\nGenerated {size} items for DP:")
            print(f"Values: {values}")
            print(f"Weights: {weights}")
            print(f"Capacity: {capacity}")
        if custom:
            user_values = input("Enter values (or press Enter to use generated): ").strip()
            if user_values:
                values = list(map(int, user_values.split()))
            user_weights = input("Enter weights (or press Enter to use generated): ").strip()
            if user_weights:
                weights = list(map(int, user_weights.split()))
            user_capacity = input(f"Enter capacity (or press Enter to use {capacity}): ").strip()
            if user_capacity:
                capacity = int(user_capacity)
        return values, weights, capacity

    elif category == "subset generation":
        if size:
            print(f"\nGenerated array: {input_data}")
        return input_data

    else:
        print("⚠️ No input format defined for this category.")
        return None

