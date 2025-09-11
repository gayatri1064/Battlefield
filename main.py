from algorithms.library import algorithms
from utils.helpers import choose_category, choose_algorithm, generate_random_array, format_result
from utils.scoring import score_algorithm
from utils.battle_runner import execute_battle   

def battle():
    print("Welcome to Battlefield of Algorithms")
    
    category = choose_category(algorithms)
    user1_algo = choose_algorithm(category, 1, algorithms)
    user2_algo = choose_algorithm(category, 2, algorithms, taken_algo=user1_algo)

    user_input = input("\nEnter numbers (comma separated) or press Enter for random: ")
    arr = list(map(int, user_input.split(","))) if user_input.strip() else generate_random_array(20,1,100)

    print(f"\nBattle: {user1_algo['name']} vs {user2_algo['name']}\n")

   
    (result1, time1, mem1), (result2, time2, mem2), correct_result = execute_battle(
        category, user1_algo, user2_algo, arr
    )

    fastest_time = min(time1, time2)
    lowest_memory = min(mem1, mem2)

    if category == "searching":
        correct1 = result1  
        correct2 = result2  
    elif category == "sorting":
        correct1 = result1 == correct_result
        correct2 = result2 == correct_result
    else:
        correct1 = correct2 = True  

    score1 = score_algorithm(correct1, time1, mem1, fastest_time, lowest_memory)
    score2 = score_algorithm(correct2, time2, mem2, fastest_time, lowest_memory)

    print("Results:")
    print(format_result(user1_algo["name"], time1, mem1, correct1, score1, result1))
    print(format_result(user2_algo["name"], time2, mem2, correct2, score2, result2))


    if score1 > score2:
        print(f"\nWinner: {user1_algo['name']}")
    elif score2 > score1:
        print(f"\nWinner: {user2_algo['name']}")
    else:
        print("\nIt's a tie!")

if __name__ == "__main__":
    battle()
