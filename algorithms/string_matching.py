# algorithms/string_matching.py

def naive_search(text, pattern):
    """Naive pattern matching with character-comparison counting.

    Returns (matches_list, comparisons)
    """
    matches = []
    n, m = len(text), len(pattern)
    comparisons = 0
    if m == 0:
        return list(range(n + 1)), comparisons

    for i in range(n - m + 1):
        match = True
        for j in range(m):
            comparisons += 1
            if text[i + j] != pattern[j]:
                match = False
                break
        if match:
            matches.append(i)
    return matches, comparisons


def kmp_search(text, pattern):
    """
    Knuth-Morris-Pratt (KMP) algorithm.
    No built-in equivalent - manual implementation for educational purposes.
    """
    def compute_lps(pattern):
        lps = [0] * len(pattern)
        length = 0
        i = 1
        while i < len(pattern):
            if pattern[i] == pattern[length]:
                length += 1
                lps[i] = length
                i += 1
            else:
                if length != 0:
                    length = lps[length - 1]
                else:
                    lps[i] = 0
                    i += 1
        return lps

    matches = []
    n, m = len(text), len(pattern)
    lps = compute_lps(pattern)

    i = j = 0  # index for text, pattern
    comparisons = 0
    while i < n:
        comparisons += 1
        if pattern[j] == text[i]:
            i += 1
            j += 1
        if j == m:
            matches.append(i - j)
            j = lps[j - 1]
        elif i < n and pattern[j] != text[i]:
            if j != 0:
                j = lps[j - 1]
            else:
                i += 1
    return matches, comparisons


def rabin_karp(text, pattern, prime=101):
    """
    Rabin-Karp algorithm using rolling hash.
    No built-in equivalent - manual implementation for educational purposes.
    """
    matches = []
    n, m = len(text), len(pattern)
    d = 256  # alphabet size

    comparisons = 0
    if m > n:
        return matches, comparisons

    # hash values
    p_hash = 0
    t_hash = 0
    h = 1

    for i in range(m - 1):
        h = (h * d) % prime

    for i in range(m):
        p_hash = (d * p_hash + ord(pattern[i])) % prime
        t_hash = (d * t_hash + ord(text[i])) % prime

    for i in range(n - m + 1):
        if p_hash == t_hash:
            # count character comparisons when verifying
            match = True
            for j in range(m):
                comparisons += 1
                if text[i + j] != pattern[j]:
                    match = False
                    break
            if match:
                matches.append(i)
        if i < n - m:
            t_hash = (d * (t_hash - ord(text[i]) * h) + ord(text[i+m])) % prime
            if t_hash < 0:
                t_hash += prime
    return matches, comparisons


def boyer_moore(text, pattern):
    """
    Boyer-Moore algorithm with bad character heuristic.
    No built-in equivalent - manual implementation for educational purposes.
    """
    def bad_char_table(pattern):
        table = {}
        length = len(pattern)
        for i in range(length - 1):
            table[pattern[i]] = length - i - 1
        return table

    matches = []
    n, m = len(text), len(pattern)
    comparisons = 0
    if m == 0 or n < m:
        return matches, comparisons

    bad_char = bad_char_table(pattern)
    i = 0
    while i <= n - m:
        j = m - 1
        while j >= 0:
            comparisons += 1
            if pattern[j] == text[i + j]:
                j -= 1
            else:
                break
        if j < 0:
            matches.append(i)
            i += m
        else:
            shift = bad_char.get(text[i + m - 1], m)
            i += shift
    return matches, comparisons
