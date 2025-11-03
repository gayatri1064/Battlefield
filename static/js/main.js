// Initialize global game state
window.globalGameState = {
  roomCode: "",
  currentPlayer: 1,
  player1: { category: "", algorithm: "", array: [], target: null, text: "", pattern: "", confirmed: false },
  player2: { category: "", algorithm: "", array: [], target: null, text: "", pattern: "", confirmed: false }
};
window.updateAlgorithms = function(player, category) {
  console.log('Updating algorithms for category:', category);
  const select = document.getElementById(`p${player}-algorithm`)
  const infoDiv = document.getElementById(`p${player}-algo-info`)

  if (!select || !infoDiv) {
    console.error('Select or infoDiv not found');
    return;
  }

  select.innerHTML = '<option value="">Select Algorithm</option>'
  infoDiv.innerHTML = '<p class="text-gray-400 text-xs sm:text-sm">Select an algorithm to see details</p>'

  console.log('Available algorithms:', window.algorithms ? window.algorithms[category] : 'No algorithms object found');

  if (category && window.algorithms && window.algorithms[category]) {
    window.algorithms[category].forEach((algo) => {
      const option = document.createElement("option")
      option.value = algo.name
      option.textContent = algo.name
      select.appendChild(option)
    })

    // Render input fields immediately for the category so custom inputs (if any) can be entered
    try { updateInputFields(player, category); } catch (e) { console.debug('updateAlgorithms: updateInputFields failed', e); }

    select.onchange = () => {
      const algo = window.algorithms[category]?.find((a) => a.name === select.value)
      if (algo) {
        infoDiv.innerHTML = `
          <p class="font-semibold text-base sm:text-lg mb-2">${algo.name}</p>
          <p class="text-xs sm:text-sm text-gray-300 mb-2">${algo.desc}</p>
          <p class="text-xs sm:text-sm text-cyan-400">Time Complexity: ${algo.time}</p>
        `
      }
  updateInputFields(player, category);
    }
  }
};
window.enablePlayer = function(player) {
  console.log(`enablePlayer called for player ${player}`);
  const panel = document.getElementById(`player${player}-panel`);
  const statusBadge = document.getElementById(`p${player}-status-badge`);

  if (panel) {
    panel.classList.remove('opacity-50', 'pointer-events-none');
  }

  if (statusBadge) {
    statusBadge.textContent = 'Connected';
    statusBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-green-600';
  }
};

// Expose functions globally
window.toggleMobileMenu = function() {
  const menu = document.getElementById("mobile-menu")
  menu.classList.toggle("hidden")
}

window.showScreen = function(screenId) {
  const screens = ["landing-screen", "room-setup", "waiting-screen", "battle-progress", "results"]
  const navbar = document.getElementById("navbar")

  screens.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.add("hidden")
    }
  })
  
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove("hidden")
  }

  if (screenId === "landing-screen") {
    navbar.classList.add("hidden")
  } else {
    navbar.classList.remove("hidden")
  }

  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenu) {
    mobileMenu.classList.add("hidden")
  }

  if (screenId === "battle-progress") {
    // Reset progress bars when showing battle progress
    resetProgressBars();
    setTimeout(() => {
      simulateBattle();
    }, 500);
  }
}

function resetProgressBars() {
  const p1ProgressBar = document.getElementById("p1-progress-bar");
  const p2ProgressBar = document.getElementById("p2-progress-bar");
  const p1ProgressText = document.getElementById("p1-progress-text");
  const p2ProgressText = document.getElementById("p2-progress-text");
  const p1Status = document.getElementById("p1-status");
  const p2Status = document.getElementById("p2-status");

  if (p1ProgressBar) p1ProgressBar.style.width = "0%";
  if (p2ProgressBar) p2ProgressBar.style.width = "0%";
  if (p1ProgressText) p1ProgressText.textContent = "0%";
  if (p2ProgressText) p2ProgressText.textContent = "0%";
  if (p1Status) p1Status.textContent = "Running...";
  if (p2Status) p2Status.textContent = "Running...";

  // Hide view results button
  const viewResultsBtn = document.getElementById("view-results-btn");
  if (viewResultsBtn) {
    viewResultsBtn.classList.add("hidden");
  }
}

// Updated createRoom to use Socket.IO
async function createRoom() {
  console.log('Creating room...');
  try {
    const response = await fetch('/api/room/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Server response:', response);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Room created:', data);
      
      globalGameState.roomCode = data.room_code;
      globalGameState.currentPlayer = 1;
      
      // Update all room code displays
      document.querySelectorAll('[id*="room-code"]').forEach(element => {
        element.textContent = globalGameState.roomCode;
      });
      
      showScreen("room-setup");
      enablePlayer(1);
      
      // Join room via Socket.IO
      if (window.socket) {
        window.socket.emit('join_room', {
          room_code: globalGameState.roomCode,
          player_id: 1
        });
      } else {
        console.error('Socket.IO not initialized');
      }
    } else {
      throw new Error('Failed to create room');
    }
  } catch (error) {
    console.error('Error creating room:', error);
    alert('Failed to create room: ' + error.message);
  }
}

// Updated joinRoom to use Socket.IO
async function joinRoom() {
  const code = prompt("Enter room code:");
  if (code) {
    try {
      const response = await fetch(`/api/room/${code.toUpperCase()}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        globalGameState.roomCode = code.toUpperCase();
        globalGameState.currentPlayer = 2;
        
        // Update all room code displays
        document.querySelectorAll('[id*="room-code"]').forEach(element => {
          element.textContent = globalGameState.roomCode;
        });
        
        showScreen("room-setup");
        enablePlayer(2);
        
        // Join room via Socket.IO
        if (window.socketGameState && window.socketGameState.socket) {
          window.socketGameState.roomCode = globalGameState.roomCode;
          window.socketGameState.playerId = 2;
          window.socketGameState.joinRoomSocket();
        }
        
        // Simulate player 1 already confirmed
        setTimeout(() => {
          globalGameState.player1.confirmed = true;
          lockPlayer(1);
        }, 500);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join room');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join room: ' + error.message);
    }
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

// Main UI functions
function checkPlayerSelection(player) {
  const categoryEl = document.getElementById(`p${player}-category`);
  const algorithmEl = document.getElementById(`p${player}-algorithm`);
  const confirmBtn = document.getElementById(`p${player}-confirm-btn`);
  const category = categoryEl ? categoryEl.value : '';
  const algorithm = algorithmEl ? algorithmEl.value : '';

  // Default readiness: must have category and algorithm
  let isReady = Boolean(category && algorithm);

  // Category-specific requirements
  try {
    const gs = globalGameState[`player${player}`] || {};
    const cat = (category || '').toLowerCase();

    if (cat === 'subset generation') {
      // Subset generation requires an array (either generated or provided as custom_input)
      const hasCustomArray = Array.isArray(gs.custom_input) && gs.custom_input.length > 0;
      const hasGeneratedArray = Array.isArray(gs.array) && gs.array.length > 0;
      // If algorithm selected but no array provided/generated, not ready
      isReady = Boolean(algorithm && (hasCustomArray || hasGeneratedArray));
    } else if (cat === 'graph' || cat === 'shortest path' || cat === 'mst') {
      // Graph-like categories require graph data in custom_input or generated graph
      const hasGraphCustom = gs.custom_input !== undefined || gs.graph !== undefined;
      isReady = Boolean(algorithm && hasGraphCustom);
    } else if (cat === '0/1 knapsack') {
      const hasKs = Array.isArray(gs.custom_input) || gs.knapsack !== undefined;
      isReady = Boolean(algorithm && hasKs);
    } else if (cat === 'string matching') {
      const hasText = (gs.text && gs.pattern) || (gs.custom_input && gs.custom_input.text && gs.custom_input.pattern);
      isReady = Boolean(algorithm && hasText);
    }
  } catch (e) {
    console.debug('checkPlayerSelection: error checking custom inputs', e);
  }

  if (confirmBtn) {
    confirmBtn.disabled = !isReady;
    // small debug output to help trace why confirm may be disabled
    console.debug(`checkPlayerSelection p${player}: category='${category}', algorithm='${algorithm}', enabled=${isReady}`);
    if (player === 2 && isReady) {
      confirmBtn.textContent = "Start Battle! ⚔️";
    }
  }
}

function getInputTemplate(player, category) {
  const playerColor = player === 1 ? 'blue' : 'green';

  // Provide input templates for supported categories
  switch ((category || '').toLowerCase()) {
    case 'sorting':
      // Sorting uses a DOM <template> (tmpl-sorting-input) that will be cloned in updateInputFields
      return '';

    case 'searching':
      return `
      <div class="mb-3 sm:mb-4">
        <label class="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Array Size</label>
        <input type="range" min="5" max="100" value="20" id="p${player}-array-size" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
        <div class="text-center mt-1">
          <span class="text-sm sm:text-lg lg:text-xl font-bold text-${playerColor}-400" id="p${player}-array-size-display">20</span>
          <span class="text-xs sm:text-sm">elements</span>
        </div>
      </div>
      <div class="mb-3 sm:mb-4">
        <label class="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Search Target</label>
        <input type="number" id="p${player}-search-target" placeholder="e.g., 42" class="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 sm:px-3 lg:px-4 py-1 sm:py-2 lg:py-3 text-xs sm:text-sm lg:text-base focus:outline-none focus:border-${playerColor}-500">
      </div>
      <div class="mb-3 sm:mb-4">
        <label class="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Custom Array</label>
        <input type="text" id="p${player}-custom-array" placeholder="e.g., 1, 3, 5, 7, 9 (sorted)" class="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 sm:px-3 lg:px-4 py-1 sm:py-2 lg:py-3 text-xs sm:text-sm lg:text-base focus:outline-none focus:border-${playerColor}-500">
      </div>
      <button onclick="generateRandomArray(${player})" id="p${player}-generate-btn" class="w-full bg-${playerColor}-600 hover:bg-${playerColor}-700 text-white font-semibold py-1 sm:py-2 lg:py-3 rounded-lg transition-all mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base">
        Generate Random Array & Target
      </button>
      <div class="bg-slate-800 rounded-lg p-2 sm:p-3 lg:p-4 mb-3 sm:mb-4">
        <p class="text-xs font-semibold mb-1 sm:mb-2">Current Data:</p>
        <p class="text-xs font-mono text-cyan-400 break-all" id="p${player}-current-array">[Click Generate]</p>
        <p class="text-xs font-mono text-yellow-400" id="p${player}-current-target">Target: [Not Set]</p>
      </div>`;

    case 'string matching':
      return `
      <div class="mb-3 sm:mb-4">
        <label class="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Text String</label>
        <textarea id="p${player}-text-input" placeholder="Enter the text to search in..." class="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 sm:px-3 lg:px-4 py-1 sm:py-2 lg:py-3 text-xs sm:text-sm lg:text-base focus:outline-none focus:border-${playerColor}-500 h-20 resize-none"></textarea>
      </div>
      <div class="mb-3 sm:mb-4">
        <label class="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Pattern to Search</label>
        <input type="text" id="p${player}-pattern-input" placeholder="e.g., hello" class="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 sm:px-3 lg:px-4 py-1 sm:py-2 lg:py-3 text-xs sm:text-sm lg:text-base focus:outline-none focus:border-${playerColor}-500">
      </div>
      <button onclick="generateRandomString(${player})" id="p${player}-generate-btn" class="w-full bg-${playerColor}-600 hover:bg-${playerColor}-700 text-white font-semibold py-1 sm:py-2 lg:py-3 rounded-lg transition-all mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base">
        Generate Random Text & Pattern
      </button>
      <div class="bg-slate-800 rounded-lg p-2 sm:p-3 lg:p-4 mb-3 sm:mb-4">
        <p class="text-xs font-semibold mb-1 sm:mb-2">Current Data:</p>
        <p class="text-xs font-mono text-cyan-400 break-all" id="p${player}-current-text">[Click Generate]</p>
        <p class="text-xs font-mono text-yellow-400" id="p${player}-current-pattern">Pattern: [Not Set]</p>
      </div>`;

    case 'graph':
    case 'shortest path':
    case 'mst':
      return `
      <div class="mb-3 sm:mb-4">
        <label class="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Graph Size (Nodes)</label>
        <input type="range" min="4" max="10" value="6" id="p${player}-graph-size" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
        <div class="text-center mt-1">
          <span class="text-sm sm:text-lg lg:text-xl font-bold text-${playerColor}-400" id="p${player}-graph-size-display">6</span>
          <span class="text-xs sm:text-sm">nodes</span>
        </div>
      </div>
      <button onclick="generateRandomGraph(${player})" id="p${player}-generate-btn" class="w-full bg-${playerColor}-600 hover:bg-${playerColor}-700 text-white font-semibold py-1 sm:py-2 lg:py-3 rounded-lg transition-all mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base">
        Generate Random Graph
      </button>
      <div class="bg-slate-800 rounded-lg p-2 sm:p-3 lg:p-4 mb-3 sm:mb-4">
        <p class="text-xs font-semibold mb-1 sm:mb-2">Current Graph:</p>
        <p class="text-xs font-mono text-cyan-400 break-all" id="p${player}-current-graph">[Click Generate]</p>
      </div>`;

    case '0/1 knapsack':
      return `
      <div class="mb-3 sm:mb-4">
        <label class="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Number of Items</label>
        <input type="range" min="4" max="10" value="5" id="p${player}-knapsack-size" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
        <div class="text-center mt-1">
          <span class="text-sm sm:text-lg lg:text-xl font-bold text-${playerColor}-400" id="p${player}-knapsack-size-display">5</span>
          <span class="text-xs sm:text-sm">items</span>
        </div>
      </div>
      <button onclick="generateKnapsackInput(${player})" id="p${player}-generate-btn" class="w-full bg-${playerColor}-600 hover:bg-${playerColor}-700 text-white font-semibold py-1 sm:py-2 lg:py-3 rounded-lg transition-all mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base">
        Generate Random Items
      </button>
      <div class="bg-slate-800 rounded-lg p-2 sm:p-3 lg:p-4 mb-3 sm:mb-4">
        <p class="text-xs font-semibold mb-1 sm:mb-2">Current Items:</p>
        <div id="p${player}-current-knapsack" class="text-xs font-mono">
          <p class="text-cyan-400">[Click Generate to create items]</p>
          <p class="text-yellow-400">Capacity: [Not Set]</p>
        </div>
      </div>`;

    default:
      return `
      <div class="mb-3 sm:mb-4">
        <label class="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Input Size</label>
        <input type="range" min="5" max="50" value="20" id="p${player}-input-size" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
        <div class="text-center mt-1">
          <span class="text-sm sm:text-lg lg:text-xl font-bold text-${playerColor}-400" id="p${player}-input-size-display">20</span>
          <span class="text-xs sm:text-sm">items</span>
        </div>
      </div>
      <button onclick="generateRandomInput(${player})" id="p${player}-generate-btn" class="w-full bg-${playerColor}-600 hover:bg-${playerColor}-700 text-white font-semibold py-1 sm:py-2 lg:py-3 rounded-lg transition-all mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base">
        Generate Random Input
      </button>
      <div class="bg-slate-800 rounded-lg p-2 sm:p-3 lg:p-4 mb-3 sm:mb-4">
        <p class="text-xs font-semibold mb-1 sm:mb-2">Current Input:</p>
        <p class="text-xs font-mono text-cyan-400 break-all" id="p${player}-current-input">[Click Generate]</p>
      </div>`;
  }
}
function updateInputFields(player, category) {
  const inputSection = document.getElementById(`p${player}-input-section`);
  if (!inputSection) return;

  // Determine template id for this category (slugify)
  const cat = (category || '').toLowerCase();
  const slug = cat.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const tmplId = slug ? `tmpl-${slug}-input` : `tmpl-default-input`;

  const tmplEl = document.getElementById(tmplId);
  if (tmplEl) {
    // Clone category template
    const cloned = cloneCategoryTemplate(category, player);
    inputSection.innerHTML = '';
    inputSection.appendChild(cloned);
  } else {
    // Fallback to string templates for categories without DOM templates
    inputSection.innerHTML = getInputTemplate(player, category);
  }

  // Reinitialize event listeners for the new elements
  initializeInputEventListeners(player);
}

function cloneCategoryTemplate(category, player) {
  const cat = (category || '').toLowerCase();
  const slug = cat.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const tmplId = slug ? `tmpl-${slug}-input` : `tmpl-default-input`;
  const tmpl = document.getElementById(tmplId);

  if (!tmpl) {
    console.warn(`${tmplId} not found, falling back to string template for category: ${category}`);
    return document.createRange().createContextualFragment(getInputTemplate(player, category));
  }

  // Replace placeholders across whole template HTML
  const raw = tmpl.innerHTML || '';
  const replaced = raw.replace(/__PLAYER__/g, String(player)).replace(/__COLOR__/g, player === 1 ? 'blue' : 'green');

  const container = document.createElement('div');
  container.innerHTML = replaced;

  if (container.children.length === 1) return container.firstElementChild;
  const frag = document.createDocumentFragment();
  Array.from(container.childNodes).forEach(n => frag.appendChild(n));
  return frag;
}

function initializeInputEventListeners(player) {
  // Initialize slider events
  const slider = document.getElementById(`p${player}-array-size`) || 
                 document.getElementById(`p${player}-graph-size`) || 
                 document.getElementById(`p${player}-input-size`);
  
  if (slider) {
    slider.addEventListener('input', (e) => {
      const display = document.getElementById(`p${player}-array-size-display`) || 
                     document.getElementById(`p${player}-graph-size-display`) || 
                     document.getElementById(`p${player}-input-size-display`);
      if (display) display.textContent = e.target.value;
    });
  }

  // Generate button (uses data-action attribute in template)
  const genBtn = document.getElementById(`p${player}-generate-btn`);
  if (genBtn) {
    // Replace node to clear prior listeners and attach new one
    const newBtn = genBtn.cloneNode(true);
    genBtn.parentNode.replaceChild(newBtn, genBtn);
    newBtn.addEventListener('click', (e) => {
      const action = (newBtn.dataset && newBtn.dataset.action) || '';
      switch (action) {
        case 'generate-random-array':
          generateRandomArray(player); break;
        case 'generate-random-string':
          generateRandomString(player); break;
        case 'generate-random-graph':
          generateRandomGraph(player); break;
        case 'generate-knapsack-input':
          generateKnapsackInput(player); break;
        case 'generate-random-input':
          generateRandomInput(player); break;
        default:
          // Fallback: try calling generateRandomArray for array-like categories
          generateRandomArray(player);
      }
    });
  }

  // Custom array input should trigger validation
  const customInput = document.getElementById(`p${player}-custom-array`);
  if (customInput) {
    customInput.addEventListener('input', () => {
      checkPlayerSelection(player);
    });
  }

  // Graph custom input listener (JSON adjacency or edge list)
  const graphInput = document.getElementById(`p${player}-graph-input`);
  const graphStart = document.getElementById(`p${player}-start-node`);
  const graphFormat = document.getElementById(`p${player}-graph-format`);
  const graphNodesInput = document.getElementById(`p${player}-graph-nodes`);
  if (graphInput || graphNodesInput) {
    const populateStartOptions = (nodesArr) => {
      if (!graphStart) return;
      // Clear existing options except placeholder
      const placeholder = graphStart.querySelector('option[value=""]');
      graphStart.innerHTML = '';
      const emptyOpt = document.createElement('option');
      emptyOpt.value = '';
      emptyOpt.textContent = '(Select start node)';
      graphStart.appendChild(emptyOpt);
      nodesArr.forEach(n => {
        const opt = document.createElement('option');
        opt.value = n;
        opt.textContent = n;
        graphStart.appendChild(opt);
      });
    };

    const parseGraphAndStore = () => {
      const rawEdges = graphInput ? graphInput.value.trim() : '';
      const rawNodes = graphNodesInput ? graphNodesInput.value.trim() : '';
      const format = graphFormat ? graphFormat.value : 'auto';

      const nodesFromField = rawNodes ? rawNodes.split(',').map(s => s.trim()).filter(Boolean) : [];

      // If no edges and no nodes, clear
      if (!rawEdges && nodesFromField.length === 0) {
        delete globalGameState[`player${player}`].custom_input;
        checkPlayerSelection(player);
        return;
      }

      let parsed = null;

      // Try adjacency JSON when requested or when rawEdges looks like JSON
      if ((format === 'adjacency' || format === 'auto') && rawEdges) {
        try {
          parsed = JSON.parse(rawEdges);
        } catch (e) {
          parsed = null;
        }
      }

      // Edge-list parsing
      if (!parsed && (format === 'edges' || format === 'auto') && rawEdges) {
        const lines = rawEdges.split('\n').map(l => l.trim()).filter(Boolean);
        const edges = [];
        const nodes = new Set(nodesFromField);
        lines.forEach(line => {
          // Support A-B, A-B(3), A,B,3 or A B 3
          const commaParts = line.includes(',') ? line.split(',').map(p => p.trim()).filter(Boolean) : null;
          if (commaParts && commaParts.length >= 2) {
            const a = commaParts[0];
            const b = commaParts[1];
            let w = commaParts.length >= 3 ? Number(commaParts[2]) : 1;
            if (isNaN(w)) w = 1;
            edges.push([a, b, w]); nodes.add(a); nodes.add(b);
            return;
          }

          // Hyphen form A-B or A-B(3)
          const hyphenMatch = line.match(/^\s*([A-Za-z0-9_]+)\s*-\s*([A-Za-z0-9_]+)(?:\(([-+]?\d+(?:\.\d+)?)\))?\s*$/);
          if (hyphenMatch) {
            const a = hyphenMatch[1];
            const b = hyphenMatch[2];
            let w = hyphenMatch[3] ? Number(hyphenMatch[3]) : 1;
            if (isNaN(w)) w = 1;
            edges.push([a, b, w]); nodes.add(a); nodes.add(b);
            return;
          }

          // Space-separated
          const parts = line.split(/\s+/).map(p => p.trim()).filter(Boolean);
          if (parts.length >= 2) {
            const a = parts[0];
            const b = parts[1];
            let w = parts.length >= 3 ? Number(parts[2]) : 1;
            if (isNaN(w)) w = 1;
            edges.push([a, b, w]); nodes.add(a); nodes.add(b);
          }
        });

        if (edges.length > 0) {
          parsed = { edges: edges, nodes: Array.from(nodes) };
        } else if (nodesFromField.length > 0) {
          // No edges parsed, but nodes provided — create empty edge list
          parsed = { edges: [], nodes: nodesFromField };
        }
      }

      // If only nodes provided (no edges), we should still populate start options and store nodes
      if (!parsed && nodesFromField.length > 0) {
        parsed = { edges: [], nodes: nodesFromField };
      }

      // Populate start-node dropdown from parsed nodes if available
      let startNode = graphStart && graphStart.value ? graphStart.value.trim() : null;
      if (parsed && parsed.nodes) {
        populateStartOptions(parsed.nodes);
        if (!startNode && parsed.nodes.length > 0) startNode = parsed.nodes[0];
      } else if (nodesFromField.length > 0) {
        populateStartOptions(nodesFromField);
        if (!startNode && nodesFromField.length > 0) startNode = nodesFromField[0];
      }

      if (parsed) {
        // Store custom_input in the same shape backend expects: [graphObj, start] or [edges, nodes]
        const selectedCategory = (document.getElementById(`p${player}-category`)?.value || '').toLowerCase();
        if (parsed.edges && parsed.edges.length > 0) {
          // Edge-list provided -> store as [edges, nodes]
          globalGameState[`player${player}`].custom_input = [parsed.edges, parsed.nodes || []];
        } else if (selectedCategory === 'mst') {
          // For MST the backend expects an edge list. If user provided adjacency or nodes-only,
          // convert adjacency map into edge list (weights default to 1 if missing).
          const nodes = parsed.nodes || Object.keys(parsed.adjacency || {});
          const adjacency = parsed.adjacency || {};
          const edges = [];
          const seen = new Set();
          (nodes || []).forEach(u => {
            const neighbors = adjacency[u] || [];
            neighbors.forEach(vEntry => {
              let v = null;
              let w = 1;
              // neighbor may be a string 'B' or tuple/array like ['B', weight]
              if (Array.isArray(vEntry)) {
                v = vEntry[0];
                w = Number(vEntry[1]) || 1;
              } else if (typeof vEntry === 'object' && vEntry !== null) {
                // object with {node: 'B', weight: 3} or {to: 'B', weight: 3}
                v = vEntry.node || vEntry.to || null;
                w = Number(vEntry.weight) || Number(vEntry.w) || 1;
              } else {
                v = String(vEntry);
              }
              if (!v) return;
              const key = [u, v].sort().join('|');
              if (!seen.has(key)) {
                seen.add(key);
                edges.push([u, v, w]);
              }
            });
          });
          // If nodes-only and no adjacency, create empty edges array
          globalGameState[`player${player}`].custom_input = [edges, nodes || []];
        } else {
          // adjacency map -> use (graphObj, startNode)
          const graphObj = parsed.adjacency || {};
          if (!parsed.adjacency) {
            (parsed.nodes || []).forEach(n => { graphObj[n] = graphObj[n] || []; });
          }
          globalGameState[`player${player}`].custom_input = [graphObj, startNode || (parsed.nodes && parsed.nodes[0])];
        }
      } else {
        delete globalGameState[`player${player}`].custom_input;
      }

      checkPlayerSelection(player);
    };

    if (graphInput) graphInput.addEventListener('blur', parseGraphAndStore);
    if (graphInput) graphInput.addEventListener('input', parseGraphAndStore);
    if (graphNodesInput) graphNodesInput.addEventListener('input', parseGraphAndStore);
    if (graphStart) graphStart.addEventListener('change', parseGraphAndStore);
    if (graphFormat) graphFormat.addEventListener('change', parseGraphAndStore);
  }

  // Subset / default custom input
  const subsetInput = document.getElementById(`p${player}-subset-input`);
  if (subsetInput) {
    subsetInput.addEventListener('input', () => {
      const raw = subsetInput.value.trim();
      if (!raw) {
        delete globalGameState[`player${player}`].custom_input;
        checkPlayerSelection(player);
        return;
      }
      const vals = raw.split(',').map(s => Number(s.trim())).filter(v => !isNaN(v));
      if (vals.length > 0) {
        globalGameState[`player${player}`].custom_input = vals;
      } else {
        delete globalGameState[`player${player}`].custom_input;
      }
      checkPlayerSelection(player);
    });
  }

  // Knapsack custom inputs
  const ksVals = document.getElementById(`p${player}-knapsack-values`);
  const ksWts = document.getElementById(`p${player}-knapsack-weights`);
  const ksCap = document.getElementById(`p${player}-knapsack-capacity`);
  const ksItems = document.getElementById(`p${player}-knapsack-items`);
  if (ksVals || ksWts || ksCap || ksItems) {
    const parseKs = () => {
      const vRaw = ksVals ? ksVals.value.trim() : '';
      const wRaw = ksWts ? ksWts.value.trim() : '';
      const cRaw = ksCap ? ksCap.value.trim() : '';
      const itemsRaw = ksItems ? ksItems.value.trim() : '';
      if (!vRaw && !wRaw && !cRaw) {
        delete globalGameState[`player${player}`].custom_input;
        checkPlayerSelection(player);
        return;
      }
      try {
        let values = vRaw ? vRaw.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n)) : [];
        let weights = wRaw ? wRaw.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n)) : [];
        const capacity = cRaw ? Number(cRaw) : NaN;

        // If items textarea provided, parse it and override values/weights
        if (itemsRaw) {
          // Support formats: "Item1(74,17), Item2(84,16)" or lines "Name,value,weight"
          const byComma = itemsRaw.split(',').length > 2 && itemsRaw.includes('(');
          const parsedValues = [];
          const parsedWeights = [];

          // First try parentheses format: Item1(74,17), Item2(84,16)
          const parenMatches = itemsRaw.match(/([A-Za-z0-9_\- ]+)\s*\(([-+]?\d+(?:\.\d+)?),\s*([-+]?\d+(?:\.\d+)?)\)/g);
          if (parenMatches && parenMatches.length > 0) {
            parenMatches.forEach(m => {
              const parts = m.match(/([A-Za-z0-9_\- ]+)\s*\(([-+]?\d+(?:\.\d+)?),\s*([-+]?\d+(?:\.\d+)?)\)/);
              if (parts && parts.length >= 4) {
                const val = Number(parts[2]);
                const wt = Number(parts[3]);
                if (!isNaN(val) && !isNaN(wt)) {
                  parsedValues.push(val);
                  parsedWeights.push(wt);
                }
              }
            });
          } else {
            // Try line-based CSV: one per line or comma-separated triplets
            const lines = itemsRaw.split('\n').map(l => l.trim()).filter(Boolean);
            lines.forEach(line => {
              const parts = line.split(/[,\s]+/).map(p => p.trim()).filter(Boolean);
              if (parts.length >= 3) {
                const v = Number(parts[1]);
                const w = Number(parts[2]);
                if (!isNaN(v) && !isNaN(w)) {
                  parsedValues.push(v);
                  parsedWeights.push(w);
                }
              } else if (parts.length === 1) {
                // maybe the whole payload is comma-separated items like Item1(74,17),Item2(84,16)
                const innerParens = parts[0].match(/([A-Za-z0-9_\- ]+)\s*\(([-+]?\d+(?:\.\d+)?),\s*([-+]?\d+(?:\.\d+)?)\)/g);
                if (innerParens) {
                  innerParens.forEach(m => {
                    const p = m.match(/([A-Za-z0-9_\- ]+)\s*\(([-+]?\d+(?:\.\d+)?),\s*([-+]?\d+(?:\.\d+)?)\)/);
                    if (p && p.length >= 4) {
                      const val = Number(p[2]);
                      const wt = Number(p[3]);
                      if (!isNaN(val) && !isNaN(wt)) {
                        parsedValues.push(val);
                        parsedWeights.push(wt);
                      }
                    }
                  });
                }
              }
            });
          }

          if (parsedValues.length > 0 && parsedWeights.length > 0) {
            values = parsedValues;
            weights = parsedWeights;
          }
        }

        if (values.length > 0 && weights.length > 0 && !isNaN(capacity)) {
          globalGameState[`player${player}`].custom_input = [values, weights, capacity];
        } else {
          delete globalGameState[`player${player}`].custom_input;
        }
      } catch (e) {
        delete globalGameState[`player${player}`].custom_input;
      }
      checkPlayerSelection(player);
    };
    if (ksItems) ksItems.addEventListener('input', parseKs);
    if (ksVals) ksVals.addEventListener('input', parseKs);
    if (ksWts) ksWts.addEventListener('input', parseKs);
    if (ksCap) ksCap.addEventListener('input', parseKs);
  }
}

// Generator functions for different input types
function generateRandomString(player) {
  const textInput = document.getElementById(`p${player}-text-input`);
  const patternInput = document.getElementById(`p${player}-pattern-input`);
  const currentText = document.getElementById(`p${player}-current-text`);
  const currentPattern = document.getElementById(`p${player}-current-pattern`);
  
  // Generate random text
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const textLength = 50 + Math.floor(Math.random() * 50);
  let text = '';
  for (let i = 0; i < textLength; i++) {
    text += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Generate pattern (substring of text 70% of time, random 30% of time)
  let pattern;
  if (Math.random() < 0.7 && text.length > 5) {
    const start = Math.floor(Math.random() * (text.length - 5));
    pattern = text.substring(start, start + 3 + Math.floor(Math.random() * 3));
  } else {
    pattern = 'xyz';
  }
  
  if (textInput) textInput.value = text;
  if (patternInput) patternInput.value = pattern;
  if (currentText) currentText.textContent = text.length > 50 ? text.substring(0, 50) + '...' : text;
  if (currentPattern) currentPattern.textContent = `Pattern: "${pattern}"`;
  
  // Re-run selection check to enable confirm when appropriate
  if (typeof checkPlayerSelection === 'function') checkPlayerSelection(player);
  // Store generated values in global state so they can be submitted as custom_input if desired
  if (player === 1) {
    globalGameState.player1.text = text;
    globalGameState.player1.pattern = pattern;
  } else {
    globalGameState.player2.text = text;
    globalGameState.player2.pattern = pattern;
  }
}

function generateRandomGraph(player) {
  const sizeSlider = document.getElementById(`p${player}-graph-size`);
  const currentGraph = document.getElementById(`p${player}-current-graph`);
  
  const size = sizeSlider ? parseInt(sizeSlider.value) : 6;
  const nodes = [];
  for (let i = 0; i < size; i++) {
    nodes.push(String.fromCharCode(65 + i)); // A, B, C, etc.
  }
  
  // Generate random edges
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.random() < 0.4) {
        const weight = Math.floor(Math.random() * 20) + 1;
        edges.push(`${nodes[i]}-${nodes[j]}(${weight})`);
      }
    }
  }
  
  if (currentGraph) {
    currentGraph.textContent = `Nodes: ${nodes.join(', ')} | Edges: ${edges.join(', ')}`;
  }
  
  // Re-run selection check to enable confirm when appropriate
  if (typeof checkPlayerSelection === 'function') checkPlayerSelection(player);
  // Store generated graph in global state
  if (player === 1) {
    globalGameState.player1.graph = { nodes: nodes, edges: edges };
    globalGameState.player1.start = nodes[0];
  } else {
    globalGameState.player2.graph = { nodes: nodes, edges: edges };
    globalGameState.player2.start = nodes[0];
  }
}

function generateKnapsackInput(player) {
  const sizeSlider = document.getElementById(`p${player}-knapsack-size`);
  const currentKnapsack = document.getElementById(`p${player}-current-knapsack`);
  
  if (!sizeSlider || !currentKnapsack) return;
  
  const size = parseInt(sizeSlider.value) || 5;
  
  // Generate random values and weights
  const values = [];
  const weights = [];
  let totalWeight = 0;
  
  for (let i = 0; i < size; i++) {
    values.push(Math.floor(Math.random() * 90) + 10); // Values between 10-100
    const weight = Math.floor(Math.random() * 25) + 5; // Weights between 5-30
    weights.push(weight);
    totalWeight += weight;
  }
  
  // Generate capacity as 1/3 to 1/2 of total weight
  const capacity = Math.floor(totalWeight * (Math.random() * 0.2 + 0.3)); // 30-50% of total weight
  
  // Format the display
  let display = '<div class="space-y-1">';
  display += '<p class="text-cyan-400">Items:</p>';
  for (let i = 0; i < size; i++) {
    display += `<p class="text-cyan-400 pl-4">Item ${i + 1}: Value = ${values[i]}, Weight = ${weights[i]}</p>`;
  }
  display += `<p class="text-yellow-400 mt-2">Knapsack Capacity: ${capacity}</p>`;
  display += '</div>';
  
  currentKnapsack.innerHTML = display;
  
  // Store the data in game state
  if (player === 1) {
    globalGameState.player1.knapsack = {
      values: values,
      weights: weights,
      capacity: capacity
    };
  } else {
    globalGameState.player2.knapsack = {
      values: values,
      weights: weights,
      capacity: capacity
    };
  }
  
  checkPlayerSelection(player);
}

function generateRandomInput(player) {
  const currentInput = document.getElementById(`p${player}-current-input`);
  const sizeSlider = document.getElementById(`p${player}-input-size`);
  
  const size = sizeSlider ? parseInt(sizeSlider.value) : 20;
  const data = [];
  for (let i = 0; i < size; i++) {
    data.push(Math.floor(Math.random() * 100) + 1);
  }
  
  if (currentInput) {
    currentInput.textContent = `[${data.join(', ')}]`;
  }
  
  // Store generated default input in global state
  if (player === 1) {
    globalGameState.player1.array = data;
  } else {
    globalGameState.player2.array = data;
  }

  // Re-run selection check to enable confirm when appropriate
  if (typeof checkPlayerSelection === 'function') checkPlayerSelection(player);
}

// Initialize event listeners when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Array size sliders
  const p1Slider = document.getElementById("p1-array-size");
  const p2Slider = document.getElementById("p2-array-size");
  
  if (p1Slider) {
    p1Slider.addEventListener("input", (e) => {
      const arraySize = e.target.value;
      const display = document.getElementById("p1-array-size-display");
      if (display) display.textContent = arraySize;
      
      // Auto-sync Player 2's array size for fairness
      if (p2Slider) {
        p2Slider.value = arraySize;
        const p2Display = document.getElementById("p2-array-size-display");
        if (p2Display) p2Display.textContent = arraySize;
        
        // Visual feedback for auto-sync
        const p2SliderContainer = p2Slider.parentElement;
        if (p2SliderContainer) {
          p2SliderContainer.classList.add('ring-2', 'ring-blue-400', 'ring-opacity-50');
          setTimeout(() => {
            p2SliderContainer.classList.remove('ring-2', 'ring-blue-400', 'ring-opacity-50');
          }, 1000);
        }
      }
      
      checkPlayerSelection(1);
    });
  }
  
  if (p2Slider) {
    p2Slider.addEventListener("input", (e) => {
      const display = document.getElementById("p2-array-size-display");
      if (display) display.textContent = e.target.value;
      checkPlayerSelection(2);
    });
  }

  // Category change listeners
  const p1Category = document.getElementById("p1-category");
  const p2Category = document.getElementById("p2-category");
  
  if (p1Category) {
    p1Category.addEventListener("change", (e) => {
      const selectedCategory = e.target.value;
      updateAlgorithms(1, selectedCategory);
      updateInputFields(1, selectedCategory);
      
      if (p2Category) {
        if (selectedCategory) {
          // Auto-select the same category for Player 2 for fairness
          p2Category.value = selectedCategory;
          updateAlgorithms(2, selectedCategory);
          updateInputFields(2, selectedCategory);
          
          // Disable all other category options for Player 2 to ensure fairness
          const p2Options = p2Category.querySelectorAll('option');
          p2Options.forEach(option => {
            if (option.value === selectedCategory || option.value === "") {
              option.disabled = false; // Keep selected category and default option enabled
            } else {
              option.disabled = true; // Disable all other categories
            }
          });
          
          // Add visual styling to show Player 2's category is locked
          p2Category.classList.add('bg-gray-100', 'text-gray-600');
          p2Category.title = `Category locked to match Player 1's selection for fair battles`;
          
          // Ensure Player 2's algorithm dropdown remains enabled for free choice within the category
          const p2AlgorithmDropdown = document.getElementById("p2-algorithm");
          if (p2AlgorithmDropdown) {
            p2AlgorithmDropdown.disabled = false;
            p2AlgorithmDropdown.classList.remove('bg-gray-100', 'text-gray-600');
            p2AlgorithmDropdown.title = 'Choose any algorithm within the locked category';
          }
          
          // Show a visual indicator that Player 2's category was auto-selected and locked
          const p2CategoryContainer = p2Category.parentElement;
          if (p2CategoryContainer) {
            // Add a temporary highlight to show the auto-selection
            p2CategoryContainer.classList.add('ring-2', 'ring-blue-400', 'ring-opacity-50');
            setTimeout(() => {
              p2CategoryContainer.classList.remove('ring-2', 'ring-blue-400', 'ring-opacity-50');
            }, 1500);
          }
        } else {
          // If Player 1 deselects category, re-enable all Player 2 options
          const p2Options = p2Category.querySelectorAll('option');
          p2Options.forEach(option => {
            option.disabled = false; // Re-enable all options
          });
          
          // Remove visual styling
          p2Category.classList.remove('bg-gray-100', 'text-gray-600');
          p2Category.title = '';
          p2Category.value = ''; // Reset Player 2's selection
          updateAlgorithms(2, ''); // Clear Player 2's algorithms
        }
      }
    });
  }
  
  if (p2Category) {
    p2Category.addEventListener("change", (e) => {
      // Check if Player 2's category is locked (when Player 1 has made a selection)
      const p1SelectedCategory = p1Category ? p1Category.value : '';
      
      if (p1SelectedCategory && e.target.value !== p1SelectedCategory) {
        // Prevent Player 2 from changing to a different category
        e.target.value = p1SelectedCategory; // Reset to the locked category
        
        // Show a brief warning message
        const warningMsg = document.createElement('div');
        warningMsg.className = 'text-red-500 text-sm mt-1';
        warningMsg.textContent = 'Category is locked to match Player 1 for fair battles!';
        
        const container = e.target.parentElement;
        container.appendChild(warningMsg);
        
        // Remove warning after 3 seconds
        setTimeout(() => {
          if (warningMsg.parentElement) {
            warningMsg.parentElement.removeChild(warningMsg);
          }
        }, 3000);
        
        return; // Don't update algorithms since we're preventing the change
      }
      
      updateAlgorithms(2, e.target.value);
      updateInputFields(2, e.target.value);
    });
  }

  // Algorithm change listeners
  const p1Algorithm = document.getElementById("p1-algorithm");
  const p2Algorithm = document.getElementById("p2-algorithm");
  
  if (p1Algorithm) {
    p1Algorithm.addEventListener("change", () => {
      checkPlayerSelection(1);
    });
  }
  
  if (p2Algorithm) {
    p2Algorithm.addEventListener("change", () => {
      checkPlayerSelection(2);
    });
  }

  // Custom array input listeners
  const p1CustomArray = document.getElementById("p1-custom-array");
  const p2CustomArray = document.getElementById("p2-custom-array");
  
  if (p1CustomArray) {
    p1CustomArray.addEventListener("input", () => {
      checkPlayerSelection(1);
    });
  }
  
  if (p2CustomArray) {
    p2CustomArray.addEventListener("input", () => {
      checkPlayerSelection(2);
    });
  }
});

function generateRandomArray(player) {
  const sizeInput = document.getElementById(`p${player}-array-size`);
  const categorySelect = document.getElementById(`p${player}-category`);
  const category = categorySelect ? categorySelect.value : '';
  
  if (!sizeInput) return;

  const size = parseInt(sizeInput.value) || 20;
  
  if (category === 'searching') {
    // Generate sorted array for searching
    const array = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1).sort((a, b) => a - b);
    const target = Math.random() < 0.7 ? array[Math.floor(Math.random() * array.length)] : Math.floor(Math.random() * 100) + 1;
    
    const arrayDisplay = document.getElementById(`p${player}-current-array`);
    const targetDisplay = document.getElementById(`p${player}-current-target`);
    const targetInput = document.getElementById(`p${player}-search-target`);
    
    if (arrayDisplay) arrayDisplay.textContent = `[${array.join(", ")}]`;
    if (targetDisplay) targetDisplay.textContent = `Target: ${target}`;
    if (targetInput) targetInput.value = target;
    
    if (player === 1) {
      globalGameState.player1.array = array;
      globalGameState.player1.target = target;
    } else {
      globalGameState.player2.array = array;
      globalGameState.player2.target = target;
    }
  } else {
    // Generate regular unsorted array for sorting
    const array = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
    const arrayDisplay = document.getElementById(`p${player}-current-array`);
    
    if (arrayDisplay) arrayDisplay.textContent = `[${array.join(", ")}]`;
    
    if (player === 1) {
      globalGameState.player1.array = array;
    } else {
      globalGameState.player2.array = array;
    }
  }
  
  checkPlayerSelection(player);
}

function checkPlayerSelection(player) {
  const categorySelect = document.getElementById(`p${player}-category`);
  const algorithmSelect = document.getElementById(`p${player}-algorithm`);
  const confirmBtn = document.getElementById(`p${player}-confirm-btn`) || 
                     document.getElementById(`p${player}-submit-btn`);

  if (!categorySelect || !algorithmSelect || !confirmBtn) return;
  const category = (categorySelect.value || "").toLowerCase();
  const algorithm = algorithmSelect.value || "";

  console.debug(`checkPlayerSelection(player=${player}) -> category='${category}', algorithm='${algorithm}'`);

  // Detect available "current" displays for different categories
  const arrayDisplay = document.getElementById(`p${player}-current-array`);
  const customArrayInput = document.getElementById(`p${player}-custom-array`);
  const graphDisplay = document.getElementById(`p${player}-current-graph`);
  const knapsackDisplay = document.getElementById(`p${player}-current-knapsack`);
  const textDisplay = document.getElementById(`p${player}-current-text`);
  const patternDisplay = document.getElementById(`p${player}-current-pattern`);
  const defaultDisplay = document.getElementById(`p${player}-current-input`);

  let hasInput = false;

  // If no category selected yet, allow confirm (input will be generated later)
  if (!category) {
    hasInput = true;
  } else {
    // Category-specific checks
    if (category === 'searching' || category === 'sorting') {
      if (arrayDisplay && arrayDisplay.textContent && !arrayDisplay.textContent.includes('[Click Generate]')) {
        hasInput = true;
      } else if (customArrayInput && customArrayInput.value && customArrayInput.value.trim() !== '') {
        hasInput = true;
      }
    } else if (category === 'string matching' || category === 'string-matching' || category === 'stringmatching') {
      // text and pattern can be provided by generate or manual inputs
      const textInput = document.getElementById(`p${player}-text-input`);
      const patternInput = document.getElementById(`p${player}-pattern-input`);
      if ((textDisplay && textDisplay.textContent && !textDisplay.textContent.includes('[Click Generate]')) || (textInput && textInput.value && textInput.value.trim() !== '')) {
        if ((patternDisplay && patternDisplay.textContent && !patternDisplay.textContent.includes('[Not Set]')) || (patternInput && patternInput.value && patternInput.value.trim() !== '')) {
          hasInput = true;
        }
      }
    } else if (category === 'graph' || category === 'shortest path' || category === 'mst') {
      // Graph input can be generated (display) or provided as custom_input
      const gs = player === 1 ? globalGameState.player1 : globalGameState.player2;
      if (graphDisplay && graphDisplay.textContent && !graphDisplay.textContent.includes('[Click Generate]')) {
        hasInput = true;
      } else if (gs && gs.custom_input) {
        hasInput = true;
      }
    } else if (category === '0/1 knapsack' || category.includes('knapsack')) {
      // knapsack stores generated items in globalGameState as an object
      const ks = player === 1 ? globalGameState.player1.knapsack : globalGameState.player2.knapsack;
      const gs = player === 1 ? globalGameState.player1 : globalGameState.player2;
      if (ks && Array.isArray(ks.values) && ks.values.length > 0 && ks.capacity) {
        hasInput = true;
      } else if (gs && gs.custom_input && Array.isArray(gs.custom_input[0]) && gs.custom_input[0].length > 0 && !isNaN(gs.custom_input[2])) {
        // custom_input shape: [values, weights, capacity]
        hasInput = true;
      } else if (knapsackDisplay && knapsackDisplay.textContent && !knapsackDisplay.textContent.includes('[Not Set]')) {
        // If the display has a capacity listed, treat as valid
        if (!knapsackDisplay.textContent.includes('Capacity: [Not Set]')) hasInput = true;
      }
    } else {
      // Default: check generic current-input
      if (defaultDisplay && defaultDisplay.textContent && !defaultDisplay.textContent.includes('[Click Generate]')) {
        hasInput = true;
      }
    }
  }

  const isReady = category && algorithm && hasInput;
  if (confirmBtn) {
    confirmBtn.disabled = !isReady;
    console.debug(`p${player}-confirm-btn disabled -> ${confirmBtn.disabled} (isReady=${isReady})`);
    // Update button label for Player 2 when ready
    if (player === 2 && isReady) {
      confirmBtn.textContent = "Start Battle! ⚔️";
    }
  }
}

// Make critical functions globally available immediately
window.showScreen = showScreen;
window.enablePlayer = enablePlayer;

function lockPlayer(player) {
  const panel = document.getElementById(`player${player}-panel`);
  const statusBadge = document.getElementById(`p${player}-status-badge`);

  if (!panel) return;

  const inputs = panel.querySelectorAll("select, input, button");
  inputs.forEach((input) => {
    input.disabled = true;
  });

  panel.classList.remove("ring-2", player === 1 ? "ring-blue-400" : "ring-green-400");
  panel.classList.add("opacity-75");

  if (statusBadge) {
    statusBadge.textContent = "✓ Ready";
    statusBadge.classList.remove(player === 1 ? "bg-blue-600" : "bg-green-600");
    statusBadge.classList.add("bg-emerald-600");
  }
}

// Make lockPlayer globally available immediately
window.lockPlayer = lockPlayer;

function confirmPlayerSelection(player) {
  const categoryEl = document.getElementById(`p${player}-category`);
  const algorithmEl = document.getElementById(`p${player}-algorithm`);

  if (!categoryEl || !algorithmEl) {
    console.error('confirmPlayerSelection: required elements missing for player', player);
    alert('Please select a category and algorithm before confirming.');
    return;
  }

  const category = categoryEl.value;
  const algorithmName = algorithmEl.value; // This is already the display name
  
  // Since the dropdown value is already the algorithm name, we don't need to look it up
  // But we need to find the algorithm key for the backend
  let algorithmKey = algorithmName; // Default fallback
  
  // Create a mapping from algorithm names to backend keys
  const algorithmKeyMapping = {
    // Sorting algorithms
    "Bubble Sort": "bubble_sort",
    "Insertion Sort": "insertion_sort", 
    "Merge Sort": "merge_sort",
    "Quick Sort": "quick_sort",
    "Selection Sort": "selection_sort",
    "Heap Sort": "heap_sort",
    "Python Built-in Sort (Timsort)": "python_builtin_sort",
    "Python Heap Sort (Optimized)": "python_heap_sort",
    
    // Searching algorithms
    "Linear Search": "linear_search",
    "Binary Search": "binary_search", 
    "Fibonacci Search": "fibonacci_search",
    "Python Built-in Search (Optimized)": "python_builtin_search",
    
    // Graph algorithms
    "BFS": "bfs",
    "DFS": "dfs",
    "Breadth-First Search (BFS)": "bfs",
    "Depth-First Search (DFS)": "dfs",
    
    // Shortest path algorithms
    "Dijkstra's Algorithm": "dijkstra",
    "Bellman-Ford Algorithm": "bellman_ford", 
    "Floyd-Warshall Algorithm": "floyd_warshall",
    
    // MST algorithms
    "Prim's Algorithm": "prim",
    "Kruskal's Algorithm": "kruskal",
    
    // String matching algorithms
    "Naive Search": "naive_search",
    "KMP Search": "kmp_search",
    "Rabin-Karp": "rabin_karp",
    "Boyer-Moore": "boyer_moore",
    
    // Subset generation
  "Bitmasking": "subset_bitmasking",

    // Knapsack algorithms
    "Dynamic Programming": "knapsack_dp",
    "Backtracking": "knapsack_backtracking",
    "Branch & Bound": "knapsack_branch_bound",
  };
  
  // Get the correct backend key
  // First, try to resolve using the frontend algorithms DB for the selected category
  try {
    if (window.algorithms && category && window.algorithms[category]) {
      const algoObj = window.algorithms[category].find(a => a.name === algorithmName);
      if (algoObj && algoObj.key) {
        algorithmKey = algoObj.key;
      }
    }
  } catch (e) {
    // ignore and fallback to mapping/generation
  }

  // If algorithmKey still not set, use the name-based mapping or fallback generator
  if (!algorithmKey) {
    if (algorithmKeyMapping[algorithmName]) {
      algorithmKey = algorithmKeyMapping[algorithmName];
    } else {
      // Fallback: generate key from name
      algorithmKey = algorithmName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    }
  }
  
  // Create selection object for socket communication
  const arraySizeEl = document.getElementById(`p${player}-array-size`);
  const arraySizeVal = arraySizeEl ? parseInt(arraySizeEl.value) : NaN;

  const selection = {
    category: category,
    algorithm: algorithmName, // This is the display name that will show in UI
    algorithm_key: algorithmKey, // Generated key for backend processing
    array_size: Number.isFinite(arraySizeVal) ? arraySizeVal : 20,
    player_id: player
  };
  
  // Attach any available custom input (either user-provided or generated) so the server
  // can run both algorithms on the exact same data when appropriate.
  try {
    const gs = player === 1 ? globalGameState.player1 : globalGameState.player2;
    let customToAttach = null;
    if (gs) {
      if (gs.custom_input !== undefined) {
        customToAttach = gs.custom_input;
      } else if (gs.knapsack !== undefined) {
        customToAttach = gs.knapsack;
      } else if (gs.graph !== undefined) {
        customToAttach = { graph: gs.graph, start: gs.start };
      } else if (gs.array !== undefined) {
        customToAttach = { array: gs.array };
        if (gs.target !== undefined) customToAttach.target = gs.target;
      } else if (gs.text !== undefined || gs.pattern !== undefined) {
        customToAttach = { text: gs.text, pattern: gs.pattern };
      }
    }
    if (customToAttach !== null) selection.custom_input = customToAttach;
  } catch (e) {
    console.debug('confirmPlayerSelection: failed to attach custom_input', e);
  }
  

  
  if (player === 1) {
    globalGameState.player1.category = category;
    globalGameState.player1.algorithm = algorithmName;
    globalGameState.player1.confirmed = true;

    lockPlayer(1);

    // Enable Player 2 panel
    console.log('Enabling Player 2...');
    enablePlayer(2);
    console.log('Player 2 should now be enabled');

    // Submit selection via Socket.IO
    if (window.socketGameState) {
      window.socketGameState.submitSelection(selection);
    }

  } else {
    globalGameState.player2.category = category;
    globalGameState.player2.algorithm = algorithmName;
    globalGameState.player2.confirmed = true;

    lockPlayer(2);

    // Submit selection via Socket.IO
    if (window.socketGameState) {
      window.socketGameState.submitSelection(selection);
    }

    // Start battle - update battle screen algorithm names right before showing battle screen
    updateBattleScreenAlgorithmNames();
    
    showScreen("battle-progress");
  }
}

// Function to update battle screen algorithm names
function updateBattleScreenAlgorithmNames() {
  const battleP1AlgoName = document.getElementById("battle-p1-algo-name");
  const battleP2AlgoName = document.getElementById("battle-p2-algo-name");
  
  // Update Player 1 algorithm name
  if (battleP1AlgoName && globalGameState.player1.algorithm) {
    console.log('Setting Player 1 battle screen algorithm name to:', globalGameState.player1.algorithm);
    battleP1AlgoName.textContent = globalGameState.player1.algorithm;
  }
  
  // Update Player 2 algorithm name (or use different algorithm for testing)
  if (battleP2AlgoName) {
    const p2Algorithm = globalGameState.player2.algorithm || 'Merge Sort';
    console.log('Setting Player 2 battle screen algorithm name to:', p2Algorithm);
    battleP2AlgoName.textContent = p2Algorithm;
    
    // If Player 2 doesn't have an algorithm set, set up a default for testing
    if (!globalGameState.player2.algorithm) {
      globalGameState.player2.algorithm = 'Merge Sort';
      globalGameState.player2.category = globalGameState.player1.category || 'sorting';
    }
  }
}

// Make confirmPlayerSelection globally available immediately
window.confirmPlayerSelection = confirmPlayerSelection;

function simulateBattle() {
    console.log("Starting battle simulation...");
    
    let progress1 = 0;
    let progress2 = 0;
    const maxProgress = 100;

    const interval = setInterval(() => {
        progress1 += Math.random() * 15;
        progress2 += Math.random() * 12;

        progress1 = Math.min(progress1, maxProgress);
        progress2 = Math.min(progress2, maxProgress);

        // Update progress bars
        const p1ProgressBar = document.getElementById("p1-progress-bar");
        const p2ProgressBar = document.getElementById("p2-progress-bar");
        const p1ProgressText = document.getElementById("p1-progress-text");
        const p2ProgressText = document.getElementById("p2-progress-text");
        const p1Status = document.getElementById("p1-status");
        const p2Status = document.getElementById("p2-status");

        if (p1ProgressBar) p1ProgressBar.style.width = progress1 + "%";
        if (p1ProgressText) p1ProgressText.textContent = Math.floor(progress1) + "%";
        if (p2ProgressBar) p2ProgressBar.style.width = progress2 + "%";
        if (p2ProgressText) p2ProgressText.textContent = Math.floor(progress2) + "%";

        // Update status when complete
        if (progress1 >= maxProgress && p1Status) {
            p1Status.textContent = "✓ Complete!";
        }
        if (progress2 >= maxProgress && p2Status) {
            p2Status.textContent = "✓ Complete!";
        }

        // Check if both reached 100%
        if (progress1 >= maxProgress && progress2 >= maxProgress) {
            clearInterval(interval);
            console.log("Battle simulation complete!");
            
            // Update results and show view results button
            updateResults();
            const viewResultsBtn = document.getElementById("view-results-btn");
            if (viewResultsBtn) {
                viewResultsBtn.classList.remove("hidden");
            }
        }
    }, 200);
}

function updateResults() {
  const r1Algo = document.getElementById("r1-algo");
  const r2Algo = document.getElementById("r2-algo");
  const r1Score = document.getElementById("r1-score");
  const r2Score = document.getElementById("r2-score");
  const winnerBanner = document.getElementById("winner-banner");

  if (r1Algo) r1Algo.textContent = globalGameState.player1.algorithm;
  if (r2Algo) r2Algo.textContent = globalGameState.player2.algorithm;

  // Generate random metrics
  const p1Score = Math.floor(Math.random() * 500) + 500;
  const p2Score = Math.floor(Math.random() * 500) + 500;

  if (r1Score) r1Score.textContent = p1Score;
  if (r2Score) r2Score.textContent = p2Score;

  const winner = p1Score > p2Score ? "Player 1" : "Player 2";
  if (winnerBanner) winnerBanner.textContent = `🏆 ${winner} Wins! 🏆`;
}

function resetGame() {
  globalGameState = {
    roomCode: "",
    currentPlayer: 1,
    player1: { category: "", algorithm: "", array: [], confirmed: false },
    player2: { category: "", algorithm: "", array: [], confirmed: false },
  }

  // Reset all inputs
  const elementsToReset = [
    "p1-category", "p1-algorithm", "p1-custom-array",
    "p2-category", "p2-algorithm", "p2-custom-array"
  ];

  elementsToReset.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });

  // Reset array displays
  const p1ArrayDisplay = document.getElementById("p1-current-array");
  const p2ArrayDisplay = document.getElementById("p2-current-array");
  if (p1ArrayDisplay) p1ArrayDisplay.textContent = "[Click Generate Random Array]";
  if (p2ArrayDisplay) p2ArrayDisplay.textContent = "[Click Generate Random Array]";

  // Reset panels
  const p1Panel = document.getElementById("player1-panel");
  const p2Panel = document.getElementById("player2-panel");

  if (p1Panel) {
    p1Panel.classList.remove("opacity-75", "ring-2", "ring-blue-400");
  }
  if (p2Panel) {
    p2Panel.classList.add("opacity-50", "pointer-events-none");
    p2Panel.classList.remove("opacity-75", "ring-2", "ring-green-400");
  }

  // Re-enable all inputs
  const allInputs = document.querySelectorAll(
    "#player1-panel select, #player1-panel input, #player1-panel button, #player2-panel select, #player2-panel input, #player2-panel button",
  );
  allInputs.forEach((input) => {
    input.disabled = false;
  });

  const p1ConfirmBtn = document.getElementById("p1-confirm-btn");
  const p2ConfirmBtn = document.getElementById("p2-confirm-btn");
  
  if (p1ConfirmBtn) p1ConfirmBtn.disabled = true;
  if (p2ConfirmBtn) p2ConfirmBtn.disabled = true;

  showScreen("landing-screen");
}

// Make select functions globally available (others are assigned to window above)
window.createRoom = createRoom;
window.joinRoom = joinRoom;
window.generateRandomArray = generateRandomArray;
window.confirmPlayerSelection = confirmPlayerSelection;
window.resetGame = resetGame;
window.lockPlayer = lockPlayer;
// Expose checkPlayerSelection so validation can delegate to it
window.checkPlayerSelection = checkPlayerSelection;