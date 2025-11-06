# Battlefield — Algorithm Battle Playground

This project is an educational web app that lets two players pit algorithm implementations against each other. Players choose an algorithm (sorting, searching, string matching, graph algorithms, knapsack, subset generation, MST, etc.), optionally provide custom input, and then the server runs both algorithms, measures time/memory, counts algorithm-specific comparisons, validates correctness, scores the results and declares a winner.

This README explains the project layout, what each file does, the end-to-end flow, how the pieces connect, how to run tests, and notes for contributors who haven't worked on the repository before.

## Table of contents
- Project overview
- How the system works (end-to-end flow)
- File / folder map with detailed responsibilities
- How algorithms are instrumented (comparisons/time/memory)
- Running the server and tests (quick commands)
- Developer notes: adding new algorithms / metrics
- Troubleshooting & common pitfalls
- Next steps and TODOs

---

## Project overview

- Backend: Flask + Flask-SocketIO (real-time room and match management) — `app.py` is the main server.
- Frontend: Static HTML/JS in `templates/` and `static/js/` (UI, room flow, sockets).
- Algorithms: Implemented under `algorithms/` (categories grouped by file). These are the actual implementations that get run by the server.
- Utilities: `utils/` contains helpers, profiler, scoring, and other shared logic.
- Development helpers: `tools/` contains quick scripts to run smoke tests locally.

This app supports custom inputs (client-provided) or generated inputs (server-side). The server measures runtime and memory for each algorithm and — importantly — counts algorithm-specific comparisons (search comparisons, character comparisons for string matching, comparisons for sorting, etc.), validates correctness by comparing the algorithm output against a canonical expected result for many categories, and computes a numeric score to choose a winner.

## How the system works (end-to-end flow)

1. UI: A player selects a category and algorithm from the web UI (`templates/index.html`, `static/js/main.js`). The UI shows input templates (via HTML `<template>` blocks) for categories that accept custom inputs.
2. Selection: When the player confirms their choice, the client sends a `player_selection` socket message with the selection object (category, algorithm, and optional `custom_input`). The server stores the player's selection in the `GameRoom` instance.
3. Start battle: When both players have selected and are ready, the server emits `start_battle` to both clients. The client then issues a POST to `/api/battle` with both players' selections to execute the match.
4. Server orchestration (`app.py`): The REST handler for `/api/battle` performs the following:
   - Prepares per-player inputs: uses `custom_input` if provided; otherwise calls `utils.helpers.generate_input` and normalizes via `utils.helpers.get_unified_input`.
   - Looks up algorithm functions in `algorithms.library.algorithms`.
   - Runs each algorithm using `utils.profiler.run_algorithm` which measures execution time and peak memory and returns the algorithm's raw result.
   - Extracts comparison counts from algorithm results (algorithms typically return either a raw value or a composite `(value, comparisons)` tuple). `app.py` unwraps the result and uses the comparisons when available.
   - Computes canonical/expected outputs for applicable categories (string matching, sorting, searching, subset generation, knapsack) and sets correctness booleans by comparing algorithm outputs to expected results.
   - Calls `utils.scoring.score_algorithm(correct, time, memory, fastest_time, lowest_memory)` to compute numeric scores.
   - Determines the winner by comparing scores and returns a JSON payload with timings, memory, correctness, comparisons, and the winner.
5. Client: The UI receives the result JSON and shows timings, memory, comparisons, correctness and the winner.

## File / folder map (detailed)

- `app.py` — Main Flask app and SocketIO handlers. Manages rooms (`GameRoom`), accepts `player_selection` socket events, and exposes `/api/battle`, `/api/categories`, `/api/algorithms/<category>` endpoints. It orchestrates input generation, algorithm execution, correctness checks, scoring, and result packaging.

- `templates/index.html` — Frontend HTML. It contains `<template>` blocks for per-category input forms and the main UI markup.

- `static/js/main.js` — Main UI logic: rendering categories and algorithms, cloning templates, wiring input listeners, populating `window.globalGameState`, enabling the Confirm button, and sending `player_selection` over sockets.

- `static/js/game.js` — Handles socket lifecycle and start-battle -> `/api/battle` POST flow (submits selections and renders results in the UI).

- `algorithms/` — Implementations grouped by file. Each file contains several algorithm implementations for a category. Key files include:
  - `searching.py` — Linear, binary, fibonacci search (now return `(index, comparisons)`)
  - `string_matching.py` — Naive, KMP, Rabin-Karp, Boyer-Moore (now return `(matches, comparisons)`)
  - `sorting.py` — Bubble, insertion, merge, quick, selection, heap (now return `(sorted_array, comparisons)`)
  - `subset.py` — Several subset generation implementations (return `(subsets, comparisons)`)
  - `knapsack.py` — 0/1 knapsack algorithms (return `(value, selection)` and comparisons in some variants)
  - `shortest_path.py`, `graph.py`, `mcst.py` — graph algorithms; these now return both answer and a simple comparisons count (edge relaxations, neighbor checks, etc.)
  - `library.py` — Registry mapping categories to algorithm entries (key, name, func) used by `app.py`.

- `utils/` — Support utilities:
  - `helpers.py` — `generate_input` and `get_unified_input`: generate canonical inputs per category and format them for algorithm calls.
  - `profiler.py` — `run_algorithm(func, *args)` measures execution time and memory. It executes the algorithm and returns `(time_taken, memory_used, is_successful, result)`; the result may include comparisons as part of the value returned by algorithm functions.
  - `scoring.py` — `score_algorithm(correct, time_taken, memory_used, fastest_time, lowest_memory)` computes a weighted score (weights are applied to correctness, normalized time and memory). Adjust weights here if you want different tradeoffs.

- `tools/` — Small scripts used during development:
  - `tools/test_battle.py` and `tools/test_search_battle.py` — lightweight scripts that simulate battles locally without a running browser. Useful for smoke testing the battle computation and verifying comparisons/correctness.

## How comparisons / metrics are handled

- Algorithms now (recommended) return both a result and a comparisons count. Example shapes:
  - Searching: `(index_or_-1, comparisons)`
  - String matching: `(matches_list, comparisons)`
  - Sorting: `(sorted_array, comparisons)`
  - Knapsack (DP): `((value, selection), comparisons)`
- `app.py` contains robust logic to extract a comparisons integer from whatever shape the algorithm returns. If an algorithm doesn't return comparisons, the server will send `0` in the `comparisons` field (no placeholder random values anymore).

Why this matters: comparisons give learners an intuitive measure of algorithm work (not just time). They are computed in-code in the algorithm implementations and reported back in results JSON.

## How to run locally (quick)

1. Ensure dependencies are installed:

```pwsh
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
```

2. Start the server (development):

```pwsh
# from project root
python app.py
# or use the flask/uvicorn command you prefer
```

3. Open your browser and go to `http://localhost:5000`.

4. Use the UI to create/join rooms and run battles. Check the server console for debug logs (the server prints comparisons and the full result payload before returning it).

5. Run quick smoke tests (no server required) from project root:

```pwsh
python tools/test_battle.py
python tools/test_search_battle.py
```

These scripts simulate algorithm runs and print measured comparisons, times and winners.

## Developer notes: adding or instrumenting algorithms

- To add a new algorithm, implement it in the appropriate `algorithms/*.py` file and register it in `algorithms/library.py` with a `key`, `name`, and `func`.
- If you want comparisons to be reported, structure the return value as `(result, comparisons)` where `comparisons` is an `int`. For algorithms that naturally return compound structures (like `(value, selection)`), return `((value, selection), comparisons)`.
- Keep `utils.profiler.run_algorithm` generic — it measures time and memory. Per-algorithm comparison metrics belong inside the algorithm functions themselves.
- If you change algorithm return shapes, ensure `app.py` can unwrap them — it uses a helper to extract a comparisons int and the main value.

## Troubleshooting

- If you still see placeholder comparison numbers on the UI (142 / 168): make sure the server process was restarted after updating code. The running Python process must import the new modules.
- Check server logs — `app.py` prints `DEBUG: comparisons1=..., comparisons2=...` and the `results payload` JSON before responding. Paste those lines when reporting issues.
- If a particular algorithm shows `comparisons: 0`, it likely wasn't instrumented yet; add a counting metric to that algorithm implementation.

## Tests and verification

- Use the `tools/` scripts to run small deterministic checks. They exercise the same code path as `/api/battle` and print detailed information.
- To add unit tests, consider adding a `tests/` folder with `pytest` tests that import algorithm functions and assert both result correctness and expected comparisons for small inputs.

## Next steps & TODOs

- Move the expected-output validation logic out of `app.py` into `utils/validator.py` for better separation and unit testing.
- Add unit tests that assert comparison counts for representative inputs (small, deterministic cases).
- Add a UI toggle for “shared input vs per-player input” for room hosts to choose fairness mode.
- Improve measurement of comparisons for algorithms where the metric could be defined multiple ways (e.g., KMP: character comparisons vs pattern-shift attempts). Document the chosen definition per algorithm.

---

If your friend needs a walkthrough, share this README and suggest they run `python tools/test_battle.py` first — the printed output shows the server logic and is a great way to get familiar with the data shapes exchanged by the UI and back end.

If you want, I can also:
- generate a short CONTRIBUTING.md with developer tasks and git workflow, or
- extract and move the validator logic into `utils/validator.py` and add unit tests (I can do this next).

Happy to continue — tell me which follow-up you'd like. 
