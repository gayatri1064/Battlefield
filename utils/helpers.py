def choose_category(algorithms):
    """Let the user choose a category of algorithms with validation."""
    categories = sorted(set(a["category"] for a in algorithms.values()))

    while True:
        print("\nSelect Purpose / Algorithm Category:")
        for i, category in enumerate(categories, 1):
            print(f"{i}. {category.capitalize()}")

        choice = input("Enter your choice: ")

        if not choice.isdigit():
            print("Invalid input. Please enter a number.")
            continue

        choice = int(choice)
        if choice < 1 or choice > len(categories):
            print("Invalid choice. Please select a valid category number.")
            continue

        return categories[choice - 1]


def choose_algorithm(category, user_number, algorithms, taken_algo=None):
    """Let a user choose an algorithm from a given category, with validation."""
    available_algos = [a for a in algorithms.values() if a["category"] == category]

    while True:  
        print(f"\nAvailable {category.capitalize()} algorithms for User {user_number}:")
        for i, algo in enumerate(available_algos, 1):
            print(f"{i}. {algo['name']}")

        choice = input(f"User {user_number}, choose your algorithm: ")

        if not choice.isdigit():
            print("Invalid input. Please enter a number.")
            continue

        choice = int(choice)
        if choice < 1 or choice > len(available_algos):
            print("Invalid choice. Please select a valid algorithm number.")
            continue

        selected_algo = available_algos[choice - 1]

        # Prevent same choice as the other user
        if taken_algo and selected_algo["name"] == taken_algo["name"]:
            print(f"User {user_number}, {taken_algo['name']} is already taken by the other player. Choose another.")
            continue

        return selected_algo


def generate_random_array(size=20, min_val=1, max_val=100):
    import random
    return random.sample(range(min_val, max_val), size)


def get_input_array():
    """Ask user for input numbers or return a random array if left blank."""
    arr_input = input("\nEnter numbers (comma separated) or press Enter for random: ")
    if arr_input.strip():
        try:
            return list(map(int, arr_input.split(",")))
        except ValueError:
            print("Invalid input. Generating random array instead.")
            return generate_random_array()
    else:
        return generate_random_array()


def format_result(name, time_taken, memory, correct, score, result):
    """Format the output result string for displaying algorithm performance."""
    return (
        f"{name} → Result: {result} | "
        f"Time: {time_taken:.6f}s | Memory: {memory:.2f}KB | "
        f"Correct: {correct} | Score: {score:.3f}"
    )
