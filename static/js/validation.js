// Validation and button enable/disable logic
function initializeValidation() {
    // Add event listeners to all form inputs
    const inputs = [
        'p1-category', 'p1-algorithm', 'p1-array-size',
        'p2-category', 'p2-algorithm', 'p2-array-size'
    ];

    inputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('change', function() {
                validatePlayerSelection(1);
                validatePlayerSelection(2);
            });
        }
    });

    // Add input event listeners for custom array fields
    const customArrays = ['p1-custom-array', 'p2-custom-array'];
    customArrays.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('input', function() {
                const player = inputId.includes('p1') ? 1 : 2;
                validatePlayerSelection(player);
            });
        }
    });

    // Initial validation
    validatePlayerSelection(1);
    validatePlayerSelection(2);
}

function validatePlayerSelection(player) {
    const category = document.getElementById(`p${player}-category`).value;
    const algorithm = document.getElementById(`p${player}-algorithm`).value;
    const arraySize = document.getElementById(`p${player}-array-size`).value;
    const customArray = document.getElementById(`p${player}-custom-array`).value;
    
    // Check if we have a valid array (either generated or custom)
    const currentArrayElement = document.getElementById(`p${player}-current-array`);
    const hasValidArray = currentArrayElement && 
                         !currentArrayElement.textContent.includes('[Click Generate]') &&
                         !currentArrayElement.textContent.includes('[Click Generate Random Array]');
    
    const hasCustomArray = customArray.trim().length > 0;
    
    // Enable confirm button if all conditions are met
    const confirmBtn = document.getElementById(`p${player}-confirm-btn`);
    if (confirmBtn) {
        const isValid = category && algorithm && arraySize && (hasValidArray || hasCustomArray);
        confirmBtn.disabled = !isValid;
        
        // Visual feedback
        if (isValid) {
            confirmBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            confirmBtn.classList.add('hover:bg-green-700', 'transform', 'hover:scale-105');
        } else {
            confirmBtn.classList.add('opacity-50', 'cursor-not-allowed');
            confirmBtn.classList.remove('hover:bg-green-700', 'transform', 'hover:scale-105');
        }
    }
}

// Enhanced generateRandomArray function
function generateRandomArray(player) {
    const size = document.getElementById(`p${player}-array-size`).value;
    const array = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
    
    const arrayDisplay = document.getElementById(`p${player}-current-array`);
    if (arrayDisplay) {
        // Truncate very long arrays for display
        let displayText = `[${array.join(", ")}]`;
        if (array.length > 20) {
            displayText = `[${array.slice(0, 10).join(", ")}, ..., ${array.slice(-10).join(", ")}]`;
        }
        arrayDisplay.textContent = displayText;
        arrayDisplay.classList.remove('text-gray-400');
        arrayDisplay.classList.add('text-cyan-400');
    }

    // Store the array in game state
    if (player === 1) {
        gameState.player1.array = array;
    } else {
        gameState.player2.array = array;
    }
    
    validatePlayerSelection(player);
}

// Enhanced checkPlayerSelection function
function checkPlayerSelection(player) {
    validatePlayerSelection(player);
}

// Update your existing choose_algorithm function to trigger validation
function updateAlgorithms(player, category) {
    const select = document.getElementById(`p${player}-algorithm`);
    const infoDiv = document.getElementById(`p${player}-algo-info`);

    select.innerHTML = '<option value="">Select Algorithm</option>';
    infoDiv.innerHTML = '<p class="text-gray-400 text-xs sm:text-sm">Select an algorithm to see details</p>';

    if (category && algorithms[category]) {
        algorithms[category].forEach((algo) => {
            const option = document.createElement("option");
            option.value = algo.name;
            option.textContent = algo.name;
            select.appendChild(option);
        });
    }

    select.onchange = () => {
        const algo = algorithms[category]?.find((a) => a.name === select.value);
        if (algo) {
            infoDiv.innerHTML = `
                <p class="font-semibold text-base sm:text-lg mb-2">${algo.name}</p>
                <p class="text-xs sm:text-sm text-gray-300 mb-2">${algo.desc}</p>
                <p class="text-xs text-cyan-400">Time Complexity: ${algo.time}</p>
            `;
        }
        validatePlayerSelection(player);
    }
    
    validatePlayerSelection(player);
}

// Add custom array validation
function setupCustomArrayHandling() {
    ['p1-custom-array', 'p2-custom-array'].forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('blur', function() {
                const player = inputId.includes('p1') ? 1 : 2;
                const value = input.value.trim();
                
                if (value) {
                    // Validate custom array format
                    try {
                        const numbers = value.split(',').map(num => parseInt(num.trim()));
                        if (numbers.some(isNaN)) {
                            throw new Error('Invalid number format');
                        }
                        
                        const arrayDisplay = document.getElementById(`p${player}-current-array`);
                        if (arrayDisplay) {
                            let displayText = `[${numbers.join(", ")}]`;
                            if (numbers.length > 20) {
                                displayText = `[${numbers.slice(0, 10).join(", ")}, ..., ${numbers.slice(-10).join(", ")}]`;
                            }
                            arrayDisplay.textContent = displayText;
                            arrayDisplay.classList.remove('text-gray-400');
                            arrayDisplay.classList.add('text-cyan-400');
                        }
                        
                        // Store in game state
                        if (player === 1) {
                            gameState.player1.array = numbers;
                        } else {
                            gameState.player2.array = numbers;
                        }
                        
                    } catch (error) {
                        alert('Please enter valid numbers separated by commas (e.g., 5, 2, 8, 1, 9)');
                        input.value = '';
                    }
                }
                
                validatePlayerSelection(player);
            });
        }
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeValidation();
    setupCustomArrayHandling();
    
    // Also add array size slider listeners
    document.getElementById("p1-array-size").addEventListener("input", (e) => {
        document.getElementById("p1-array-size-display").textContent = e.target.value;
        validatePlayerSelection(1);
    });

    document.getElementById("p2-array-size").addEventListener("input", (e) => {
        document.getElementById("p2-array-size-display").textContent = e.target.value;
        validatePlayerSelection(2);
    });
});