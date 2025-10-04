def score_algorithm(correct, time_taken, memory_used, fastest_time, lowest_memory,
                    Wc=0.5, Wt=0.3, Wm=0.2):
    C = 1 if correct else 0
    T_norm = fastest_time / time_taken if time_taken > 0 else 0
    M_norm = lowest_memory / memory_used if memory_used > 0 else 0
    return (C * Wc) + (T_norm * Wt) + (M_norm * Wm)
