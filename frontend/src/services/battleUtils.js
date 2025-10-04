// src/services/battleUtils.js
export const generateRandomArray = (size, min = 1, max = 1000) => {
  const array = [];
  const range = max - min + 1;
  
  // Generate unique random numbers
  const used = new Set();
  while (array.length < size && used.size < range) {
    const num = Math.floor(Math.random() * range) + min;
    if (!used.has(num)) {
      used.add(num);
      array.push(num);
    }
  }
  
  // If we need more numbers than the range allows, fill with random
  while (array.length < size) {
    array.push(Math.floor(Math.random() * range) + min);
  }
  
  return array;
};

export const getAlgorithmIcon = (algorithmName) => {
  const icons = {
    // Sorting
    'bubble_sort': '🫧',
    'insertion_sort': '📝',
    'merge_sort': '🔄',
    'quick_sort': '⚡',
    'selection_sort': '🎯',
    'heap_sort': '⛰️',
    
    // Searching
    'linear_search': '📏',
    'binary_search': '🔍',
    'fibonacci_search': '🌀',
    
    // Graph
    'dijkstra': '🗺️',
    'bfs': '🌊',
    'dfs': '🌳',
    'prim': '🌲',
    'kruskal': '🔗',
    
    // DP
    'fibonacci_recursive': '🔄',
    'fibonacci_dp': '⚡',
    'knapsack': '🎒',
  };
  
  return icons[algorithmName] || '🔧';
};

export const getAlgorithmComplexity = (algorithmName) => {
  const complexities = {
    // Sorting
    'bubble_sort': 'O(n²)',
    'insertion_sort': 'O(n²)',
    'merge_sort': 'O(n log n)',
    'quick_sort': 'O(n log n)',
    'selection_sort': 'O(n²)',
    'heap_sort': 'O(n log n)',
    
    // Searching
    'linear_search': 'O(n)',
    'binary_search': 'O(log n)',
    'fibonacci_search': 'O(log n)',
    
    // Graph
    'dijkstra': 'O(V²)',
    'bfs': 'O(V + E)',
    'dfs': 'O(V + E)',
    'prim': 'O(V²)',
    'kruskal': 'O(E log V)',
    
    // DP
    'fibonacci_recursive': 'O(2ⁿ)',
    'fibonacci_dp': 'O(n)',
    'knapsack': 'O(nW)',
  };
  
  return complexities[algorithmName] || 'O(?)';
};