def score_algorithm(correct, time_taken, memory_used, fastest_time, lowest_memory,
                    Wc=0.5, Wt=0.3, Wm=0.2):
    """
    Fixed scoring with debug output
    """
    C = 1.0 if correct else 0.0
    
    # Ensure we don't divide by zero and values are reasonable
    if time_taken <= 0 or fastest_time <= 0:
        T_norm = 0.0
    else:
        T_norm = fastest_time / time_taken
        T_norm = min(T_norm, 1.0)  # Cap at 1.0
    
    if memory_used <= 0 or lowest_memory <= 0:
        M_norm = 0.0
    else:
        M_norm = lowest_memory / memory_used
        M_norm = min(M_norm, 1.0)  # Cap at 1.0
    
    score = (C * Wc) + (T_norm * Wt) + (M_norm * Wm)
    
    print(f"SCORE_DEBUG: correct={correct}, time_taken={time_taken:.6f}, memory_used={memory_used:.6f}")
    print(f"SCORE_DEBUG: fastest_time={fastest_time:.6f}, lowest_memory={lowest_memory:.6f}")
    print(f"SCORE_DEBUG: C={C}, T_norm={T_norm:.3f}, M_norm={M_norm:.3f}, score={score:.3f}")
    
    return score