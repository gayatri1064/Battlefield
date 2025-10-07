// Algorithm database
const algorithms = {
  sorting: [
    { name: "Quick Sort", desc: "Divide and conquer sorting algorithm", time: "O(n log n) avg, O(n²) worst" },
    { name: "Merge Sort", desc: "Stable divide and conquer algorithm", time: "O(n log n)" },
    { name: "Bubble Sort", desc: "Simple comparison-based algorithm", time: "O(n²)" },
    { name: "Heap Sort", desc: "Comparison-based using binary heap", time: "O(n log n)" },
  ],
  searching: [
    { name: "Binary Search", desc: "Efficient search in sorted arrays", time: "O(log n)" },
    { name: "Linear Search", desc: "Sequential search through array", time: "O(n)" },
    { name: "Jump Search", desc: "Block-based search algorithm", time: "O(√n)" },
  ],
  graph: [
    { name: "Dijkstra's Algorithm", desc: "Shortest path algorithm", time: "O(V²) or O(E log V)" },
    { name: "BFS", desc: "Breadth-first search traversal", time: "O(V + E)" },
    { name: "DFS", desc: "Depth-first search traversal", time: "O(V + E)" },
  ],
  dynamic: [
    { name: "Fibonacci DP", desc: "Dynamic programming for Fibonacci", time: "O(n)" },
    { name: "Knapsack", desc: "0/1 Knapsack problem solution", time: "O(nW)" },
  ],
}

// Game state
let gameState = {
  roomCode: "",
  currentPlayer: 1,
  player1: { category: "", algorithm: "", array: [], confirmed: false },
  player2: { category: "", algorithm: "", array: [], confirmed: false },
}

function toggleMobileMenu() {
  const menu = document.getElementById("mobile-menu")
  menu.classList.toggle("hidden")
}

function showScreen(screenId) {
  const screens = ["landing-screen", "room-setup", "battle-progress", "results"]
  const navbar = document.getElementById("navbar")

  screens.forEach((id) => {
    document.getElementById(id).classList.add("hidden")
  })
  document.getElementById(screenId).classList.remove("hidden")

  if (screenId === "landing-screen") {
    navbar.classList.add("hidden")
  } else {
    navbar.classList.remove("hidden")
  }

  document.getElementById("mobile-menu").classList.add("hidden")

  if (screenId === "battle-progress") {
    simulateBattle()
  }
}

function createRoom() {
  gameState.roomCode = generateRoomCode()
  gameState.currentPlayer = 1
  document.getElementById("room-code").textContent = gameState.roomCode
  showScreen("room-setup")
  enablePlayer(1)
}

function joinRoom() {
  const code = prompt("Enter room code:")
  if (code) {
    gameState.roomCode = code.toUpperCase()
    gameState.currentPlayer = 2
    document.getElementById("room-code").textContent = gameState.roomCode
    showScreen("room-setup")

    // Simulate player 1 already confirmed (in real app, this would come from server)
    setTimeout(() => {
      gameState.player1.confirmed = true
      lockPlayer(1)
      enablePlayer(2)
    }, 500)
  }
}

function generateRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function updateAlgorithms(player, category) {
  const select = document.getElementById(`p${player}-algorithm`)
  const infoDiv = document.getElementById(`p${player}-algo-info`)

  select.innerHTML = '<option value="">Select Algorithm</option>'
  infoDiv.innerHTML = '<p class="text-gray-400 text-xs sm:text-sm">Select an algorithm to see details</p>'

  if (category && algorithms[category]) {
    algorithms[category].forEach((algo) => {
      const option = document.createElement("option")
      option.value = algo.name
      option.textContent = algo.name
      select.appendChild(option)
    })
  }

  select.onchange = () => {
    const algo = algorithms[category]?.find((a) => a.name === select.value)
    if (algo) {
      infoDiv.innerHTML = `
                <p class="font-semibold text-base sm:text-lg mb-2">${algo.name}</p>
                <p class="text-xs sm:text-sm text-gray-300 mb-2">${algo.desc}</p>
                <p class="text-xs text-cyan-400">Time Complexity: ${algo.time}</p>
            `
      checkPlayerSelection(player)
    }
  }
}

// Array size slider listeners
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("p1-array-size").addEventListener("input", (e) => {
    document.getElementById("p1-array-size-display").textContent = e.target.value
  })

  document.getElementById("p2-array-size").addEventListener("input", (e) => {
    document.getElementById("p2-array-size-display").textContent = e.target.value
  })
})

function generateRandomArray(player) {
  const size = document.getElementById(`p${player}-array-size`).value
  const array = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1)
  document.getElementById(`p${player}-current-array`).textContent = `[${array.join(", ")}]`

  if (player === 1) {
    gameState.player1.array = array
  } else {
    gameState.player2.array = array
  }
  checkPlayerSelection(player)
}

function checkPlayerSelection(player) {
  const category = document.getElementById(`p${player}-category`).value
  const algorithm = document.getElementById(`p${player}-algorithm`).value
  const hasArray = player === 1 ? gameState.player1.array.length > 0 : gameState.player2.array.length > 0

  const submitBtn = document.getElementById(`p${player}-submit-btn`)
  submitBtn.disabled = !(category && algorithm && hasArray)
}

function enablePlayer(player) {
  const panel = document.getElementById(`player${player}-panel`)
  const statusBadge = document.getElementById(`p${player}-status-badge`)

  panel.classList.remove("opacity-50", "pointer-events-none")
  panel.classList.add("ring-2", player === 1 ? "ring-blue-400" : "ring-green-400")
  statusBadge.textContent = "Your Turn"
  statusBadge.classList.remove("bg-slate-600")
  statusBadge.classList.add(player === 1 ? "bg-blue-600" : "bg-green-600")
}

function lockPlayer(player) {
  const panel = document.getElementById(`player${player}-panel`)
  const statusBadge = document.getElementById(`p${player}-status-badge`)
  const inputs = panel.querySelectorAll("select, input, button")

  panel.classList.remove("ring-2", player === 1 ? "ring-blue-400" : "ring-green-400")
  panel.classList.add("opacity-75")

  inputs.forEach((input) => {
    input.disabled = true
  })

  statusBadge.textContent = "✓ Ready"
  statusBadge.classList.remove(player === 1 ? "bg-blue-600" : "bg-green-600")
  statusBadge.classList.add("bg-emerald-600")
}

function confirmPlayerSelection(player) {
  if (player === 1) {
    gameState.player1.category = document.getElementById("p1-category").value
    gameState.player1.algorithm = document.getElementById("p1-algorithm").value
    gameState.player1.confirmed = true

    lockPlayer(1)

    // Simulate player 2 joining (in real app, wait for actual player 2)
    setTimeout(() => {
      enablePlayer(2)
    }, 1000)
  } else {
    gameState.player2.category = document.getElementById("p2-category").value
    gameState.player2.algorithm = document.getElementById("p2-algorithm").value
    gameState.player2.confirmed = true

    lockPlayer(2)

    // Start battle
    document.getElementById("battle-p1-algo-name").textContent = gameState.player1.algorithm
    document.getElementById("battle-p2-algo-name").textContent = gameState.player2.algorithm

    setTimeout(() => {
      showScreen("battle-progress")
    }, 500)
  }
}

function simulateBattle() {
  let progress1 = 0
  let progress2 = 0

  const interval = setInterval(() => {
    progress1 += Math.random() * 15
    progress2 += Math.random() * 12

    progress1 = Math.min(progress1, 100)
    progress2 = Math.min(progress2, 100)

    document.getElementById("p1-progress-bar").style.width = progress1 + "%"
    document.getElementById("p1-progress-text").textContent = Math.floor(progress1) + "%"

    document.getElementById("p2-progress-bar").style.width = progress2 + "%"
    document.getElementById("p2-progress-text").textContent = Math.floor(progress2) + "%"

    if (progress1 >= 100) {
      document.getElementById("p1-status").textContent = "✓ Complete!"
    }
    if (progress2 >= 100) {
      document.getElementById("p2-status").textContent = "✓ Complete!"
    }

    if (progress1 >= 100 && progress2 >= 100) {
      clearInterval(interval)
      updateResults()
      document.getElementById("view-results-btn").classList.remove("hidden")
    }
  }, 200)
}

function updateResults() {
  document.getElementById("r1-algo").textContent = gameState.player1.algorithm
  document.getElementById("r2-algo").textContent = gameState.player2.algorithm

  // Generate random metrics
  const p1Score = Math.floor(Math.random() * 500) + 500
  const p2Score = Math.floor(Math.random() * 500) + 500

  document.getElementById("r1-score").textContent = p1Score
  document.getElementById("r2-score").textContent = p2Score

  const winner = p1Score > p2Score ? "Player 1" : "Player 2"
  document.getElementById("winner-banner").textContent = `🏆 ${winner} Wins! 🏆`
}

function resetGame() {
  gameState = {
    roomCode: "",
    currentPlayer: 1,
    player1: { category: "", algorithm: "", array: [], confirmed: false },
    player2: { category: "", algorithm: "", array: [], confirmed: false },
  }

  // Reset all inputs
  document.getElementById("p1-category").value = ""
  document.getElementById("p1-algorithm").value = ""
  document.getElementById("p1-custom-array").value = ""
  document.getElementById("p1-current-array").textContent = "[Click Generate Random Array]"
  document.getElementById("p2-category").value = ""
  document.getElementById("p2-algorithm").value = ""
  document.getElementById("p2-custom-array").value = ""
  document.getElementById("p2-current-array").textContent = "[Click Generate Random Array]"

  // Reset panels
  const p1Panel = document.getElementById("player1-panel")
  const p2Panel = document.getElementById("player2-panel")

  p1Panel.classList.remove("opacity-75", "ring-2", "ring-blue-400")
  p2Panel.classList.add("opacity-50", "pointer-events-none")
  p2Panel.classList.remove("opacity-75", "ring-2", "ring-green-400")

  // Re-enable all inputs
  const allInputs = document.querySelectorAll(
    "#player1-panel select, #player1-panel input, #player1-panel button, #player2-panel select, #player2-panel input, #player2-panel button",
  )
  allInputs.forEach((input) => {
    input.disabled = false
  })

  document.getElementById("p1-confirm-btn").disabled = true
  document.getElementById("p2-confirm-btn").disabled = true

  showScreen("landing-screen")
}
