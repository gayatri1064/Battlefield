
# Battlefield of Algorithms – Project Structure

This project is a competitive platform where two users pick algorithms (sorting, searching, graph, or dynamic programming) and compare them based on execution time, memory usage, correctness, and scoring.

---

## 1. `main.py`

**Role:**

* Entry point of the program.
* Handles the overall game flow:

  1. Welcomes the user.
  2. Lets users choose a category (Sorting, Searching, Graph, DP).
  3. Lets each user select an algorithm from that category.
  4. Collects input data (array, target value, or graph).
  5. Runs the battle using `battle_runner`.
  6. Displays results (time, memory, correctness, score, winner).

**Summary:** Controls the game loop and connects all utilities.

---

## 2. `algorithms/`

**Role:**

* Contains implementations of algorithms grouped by type.
* Each algorithm is defined as a function, e.g., `linear_search(arr, target)`, `merge_sort(arr)`.

**Typical files inside:**

* `searching.py` → Linear Search, Binary Search
* `sorting.py` → Bubble Sort, Merge Sort, Quick Sort
* `graph.py` → BFS, DFS, Dijkstra, etc.
* `dp.py` → Dynamic programming examples such as Fibonacci, Knapsack

**Summary:** Provides the algorithm implementations that users choose from.

---

## 3. `utils/`

This folder contains helper logic to support the battle system.

### a) `helpers.py`

**Role:** Handles user input, menus, and choices.
**Functions:**

* `choose_category()` → Lets the user pick DP, Graph, Searching, or Sorting.
* `choose_algorithm()` → Lets each user pick an algorithm, with validation (no duplicate selections, no invalid inputs).
* `get_array_input()` → Collects numbers or generates a random array.
* `get_target_input()` → Collects the search target.
* `get_graph_input()` → Collects or defaults to a graph.

**Summary:** Manages user interaction.

---

### b) `battle_runner.py`

**Role:** Runs a single battle round.
**Functions:**

* `execute_battle(category, user1_algo, user2_algo, arr)`

  * Runs both algorithms with the same input.
  * Uses `profiler.run_algorithm()` to measure performance.
  * Validates correctness where possible.
  * Returns results for scoring.

**Summary:** Coordinates the head-to-head comparison between two algorithms.

---

### c) `profiler.py`

**Role:** Tracks execution time and memory usage.
**Functions:**

* `run_algorithm(func, *args)`

  * Executes the given algorithm with inputs.
  * Uses `time.perf_counter()` to measure runtime.
  * Uses `tracemalloc` to measure memory usage.
  * Returns `(result, time_taken, memory_used)`.

**Summary:** Judges performance in terms of speed and memory.

---

### d) `scoring.py`

**Role:** Evaluates which algorithm performed better.
**Functions:**

* `score_algorithm(correctness, time, memory, fastest_time, lowest_memory)`

  * Normalizes and compares performance metrics.
  * Rewards correctness, speed, and memory efficiency.

**Summary:** Converts performance into scores and helps determine the winner.

---

## 4. How It Fits Together

1. `main.py` manages the overall game.
2. `helpers.py` ensures valid input and choices.
3. `battle_runner.py` executes the selected algorithms.
4. `profiler.py` measures execution details.
5. `scoring.py` calculates scores.
6. `algorithms/` provides the actual implementations.


