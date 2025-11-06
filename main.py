from utils.helpers import choose_category, choose_algorithm, generate_input, get_unified_input
from utils.battle_runner import execute_battle, print_results
from algorithms.library import algorithms
from utils.helpers import choose_category, choose_algorithm, generate_input, get_unified_input
from utils.profiler import run_algorithm
from utils.scoring import score_algorithm
from algorithms.library import algorithms

def play_battle():
    print("🔥🔥🔥 ALGORITHM BATTLEFIELD 🔥🔥🔥")

    while True:
        # --- Category Selection ---
        category = choose_category(algorithms)
        print(f"\nYou selected category: {category}")

        # --- Input size ---
        while True:
            size_input = input(f"Enter input size for this battle (e.g., 10-50): ").strip()
            if size_input.isdigit() and int(size_input) > 0:
                size = int(size_input)
                break
            print("❌ Invalid input. Enter a positive number.")

        # --- Algorithm Selection ---
        user1_algo = choose_algorithm(category, 1, algorithms)
        user2_algo = choose_algorithm(category, 2, algorithms, taken_algo=user1_algo)

        # --- Input Choice ---
        choice1 = input("\nPlayer 1 → Enter 'c' for custom input or 'g' for generated: ").strip().lower()
        if choice1 == 'c':
            data1 = get_unified_input(category, None, size=size, custom=True)
        else:
            generated1 = generate_input(category, size)
            data1 = get_unified_input(category, generated1, size=size, custom=False)

        choice2 = input("\nPlayer 2 → Enter 'c' for custom input or 'g' for generated: ").strip().lower()
        if choice2 == 'c':
            data2 = get_unified_input(category, None, size=size, custom=True)
        else:
            generated2 = generate_input(category, size)
            data2 = get_unified_input(category, generated2, size=size, custom=False)

        # --- Run Algorithms ---
        func1 = user1_algo["func"]
        func2 = user2_algo["func"]

        time1, mem1, correct1, result1 = run_algorithm(func1, *data1)
        time2, mem2, correct2, result2 = run_algorithm(func2, *data2)

        # --- Scoring ---
        fastest_time = min(time1, time2)
        lowest_memory = min(mem1, mem2)
        score1 = score_algorithm(correct1, time1, mem1, fastest_time, lowest_memory)
        score2 = score_algorithm(correct2, time2, mem2, fastest_time, lowest_memory)

        # --- Decide winner ---
        if score1 > score2:
            winner = user1_algo["name"]
        elif score2 > score1:
            winner = user2_algo["name"]
        else:
            winner = "Draw"

        # --- Print Results ---
        print("\nResults:")
        print(f"{user1_algo['name']} → Result: {result1} | Time: {time1:.6f}s | "
              f"Memory: {mem1:.2f}MB | Correct: {correct1} | Score: {score1:.3f}")
        print(f"{user2_algo['name']} → Result: {result2} | Time: {time2:.6f}s | "
              f"Memory: {mem2:.2f}MB | Correct: {correct2} | Score: {score2:.3f}")
        print(f"\n🏆 Winner: {winner}")

        # --- Play again? ---
        play_again = input("\nDo you want to play another battle? (y/n): ").strip().lower()
        if play_again != 'y':
            print("👋 Thanks for playing Algorithm Battlefield!")
            break


def main():
    """Main entry point with mode selection and replay option."""
    print("🔥" * 25)
    print("   ALGORITHM BATTLEFIELD")
    print("🔥" * 25)

    while True:
        print("\nChoose your battle mode:")
        print("1. ⚔️ Classic Battle (1v1)")
        print("2. 🚪 Exit")

        choice = input("\nEnter your choice (1-2): ").strip()

        if choice == "1":
            play_battle()
        elif choice == "2":
            print("👋 Thanks for playing! Goodbye!")
            break
        else:
            print("❌ Invalid choice! Please enter 1 or 2.")
            continue

        # After battle, ask to play again
        again = input("\nDo you want to play another battle? (y/n): ").strip().lower()
        if again != 'y':
            print("👋 Thanks for playing! Goodbye!")
            break



if __name__ == "__main__":
    main()
