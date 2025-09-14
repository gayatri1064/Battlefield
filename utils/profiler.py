import time
import tracemalloc

def run_algorithm(func, *args):
    import tracemalloc, time

    tracemalloc.start()
    start_time = time.perf_counter()

    try:
        result = func(*args)
        is_correct = True
    except Exception as e:
        print(f"Algorithm failed with error: {e}")
        result = None
        is_correct = False

    end_time = time.perf_counter()
    current, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    time_taken = end_time - start_time
    memory_used = peak / 10**6  # MB

    return time_taken, memory_used, is_correct, result