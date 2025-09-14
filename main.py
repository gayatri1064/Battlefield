# main.py - Updated for Room System
from utils.helpers import choose_category, choose_algorithm, get_input_array
from utils.battle_runner import execute_battle, print_results
from algorithms.library import algorithms
from room_interface import RoomInterface
from utils.room_battle_runner import execute_room_battle

def classic_battle():
    """Original 1v1 battle mode."""
    print("Welcome to Classic Algorithm Battle\n")

    category = choose_category(algorithms)
    user1_algo = choose_algorithm(category, 1, algorithms)
    user2_algo = choose_algorithm(category, 2, algorithms, taken_algo=user1_algo)

    arr = get_input_array()

    target = None
    if category.lower() == "searching":
        target = int(input("\nEnter the target value to search: "))

    print(f"\nBattle: {user1_algo['name']} vs {user2_algo['name']}")

    (result1, time1, mem1, correct1, score1), \
    (result2, time2, mem2, correct2, score2), \
    winner, correct_result = execute_battle(category, user1_algo, user2_algo, arr, target)

    print_results(user1_algo, user2_algo,
                  result1, time1, mem1, correct1, score1,
                  result2, time2, mem2, correct2, score2,
                  winner, target, correct_result)

def main():
    """Main entry point with mode selection."""
    print("🔥" * 25)
    print("   ALGORITHM BATTLEFIELD")
    print("🔥" * 25)
    print("\nChoose your battle mode:")
    print("1. 🏠 Room Battle (Multiplayer)")
    print("2. ⚔️  Classic Battle (1v1)")
    print("3. 🚪 Exit")
    
    while True:
        choice = input("\nEnter your choice (1-3): ").strip()
        
        if choice == "1":
            # Start room-based multiplayer system
            interface = RoomInterface()
            interface.start()
            break
        elif choice == "2":
            # Classic 1v1 battle
            classic_battle()
            break
        elif choice == "3":
            print("👋 Thanks for playing! Goodbye!")
            break
        else:
            print("❌ Invalid choice! Please enter 1, 2, or 3.")

if __name__ == "__main__":
    main()