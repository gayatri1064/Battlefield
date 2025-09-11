import time
import tracemalloc

def run_algorithm(func, *args):
    tracemalloc.start()
    start = time.perf_counter()
    result = func(*args)   # ✅ pass all arguments dynamically
    end = time.perf_counter()
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return result, end - start, peak / 1024
