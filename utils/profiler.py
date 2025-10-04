import time
import tracemalloc

def run_algorithm(func, *args):
    tracemalloc.start()
    start_time = time.perf_counter()

    try:
        # Debug output to see what we're actually getting
        func_name = func.__name__.lower()
        print(f"DEBUG: Function name: {func_name}")
        print(f"DEBUG: Raw args received: {args}")
        print(f"DEBUG: Args length: {len(args)}")
        if len(args) > 0:
            print(f"DEBUG: First arg type: {type(args[0])}")
            print(f"DEBUG: First arg value: {args[0]}")
        
        is_sorting = any(sort_type in func_name for sort_type in 
                        ['sort', 'bubble', 'insertion', 'merge', 'quick', 'selection', 'heap'])
        is_subset = any(subset_type in func_name for subset_type in
                       ['subset', 'backtrack', 'bitmask'])
        
        print(f"DEBUG: Is sorting: {is_sorting}")
        print(f"DEBUG: Is subset: {is_subset}")
        
        if is_sorting:
            # For sorting algorithms, we need to reconstruct the list from individual args
            if len(args) > 1 and all(isinstance(arg, (int, float)) for arg in args):
                # If we got individual numbers, put them back into a list
                array_to_sort = list(args)
                print(f"DEBUG: Reconstructed sorting array: {array_to_sort}")
                result = func(array_to_sort)
            elif len(args) == 1 and isinstance(args[0], list):
                # If we got a proper list, use it directly
                print(f"DEBUG: Using list directly for sorting: {args[0]}")
                result = func(args[0])
            else:
                # Fallback
                print(f"DEBUG: Using fallback for sorting")
                result = func(*args)
        elif is_subset:
            # For subset generation algorithms, pass the array as a single argument
            if len(args) == 1 and isinstance(args[0], list):
                print(f"DEBUG: Passing list to subset function: {args[0]}")
                result = func(args[0])
            elif len(args) > 1 and all(isinstance(arg, (int, float)) for arg in args):
                # If we got individual numbers, put them back into a list
                array_for_subsets = list(args)
                print(f"DEBUG: Reconstructed subset array: {array_for_subsets}")
                result = func(array_for_subsets)
            else:
                print(f"DEBUG: Using fallback for subset generation")
                result = func(*args)
        else:
            # For non-sorting, non-subset algorithms, use normal unpacking
            print(f"DEBUG: Using normal unpacking")
            result = func(*args)
            
        print(f"DEBUG: Function result: {result}")
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