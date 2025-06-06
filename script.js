// Global variables
let k = 2; // Number of dimensions
let quotas = [];
let weightVectors = [];
let numPlayers = 3;

// DOM elements
const kInput = document.getElementById('k-input');
const setupBtn = document.getElementById('setup-btn');
const gameSetup = document.getElementById('game-setup');
const quotasContainer = document.getElementById('quotas-container');
const weightsContainer = document.getElementById('weights-container');
const numPlayersInput = document.getElementById('num-players');
const addPlayerBtn = document.getElementById('add-player-btn');
const removePlayerBtn = document.getElementById('remove-player-btn');
const csvInput = document.getElementById('csv-input');
const loadCsvBtn = document.getElementById('load-csv-btn');
const calculateBtn = document.getElementById('calculate-btn');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const resultsContent = document.getElementById('results-content');

// Event listeners
setupBtn.addEventListener('click', setupGame);
addPlayerBtn.addEventListener('click', addPlayer);
removePlayerBtn.addEventListener('click', removePlayer);
loadCsvBtn.addEventListener('click', loadCSV);
calculateBtn.addEventListener('click', calculate);
numPlayersInput.addEventListener('change', updateNumPlayers);

// Initialize
setupGame();

function setupGame() {
    k = parseInt(kInput.value);
    quotas = new Array(k).fill(0);
    numPlayers = parseInt(numPlayersInput.value);
    weightVectors = Array(numPlayers).fill().map(() => new Array(k).fill(0));
    
    createQuotaInputs();
    createWeightInputs();
    gameSetup.classList.remove('hidden');
}

function createQuotaInputs() {
    quotasContainer.innerHTML = '';
    for (let i = 0; i < k; i++) {
        const quotaDiv = document.createElement('div');
        quotaDiv.className = 'quota-input';
        
        const label = document.createElement('label');
        label.textContent = `Quota ${i + 1}:`;
        
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.value = '0';
        input.addEventListener('change', (e) => {
            quotas[i] = parseInt(e.target.value) || 0;
        });
        
        quotaDiv.appendChild(label);
        quotaDiv.appendChild(input);
        quotasContainer.appendChild(quotaDiv);
    }
}

function createWeightInputs() {
    weightsContainer.innerHTML = '';
    for (let player = 0; player < numPlayers; player++) {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'weight-row';
        
        const label = document.createElement('label');
        label.textContent = `Player ${player + 1}:`;
        playerDiv.appendChild(label);
        
        for (let dim = 0; dim < k; dim++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.value = '0';
            input.addEventListener('change', (e) => {
                weightVectors[player][dim] = parseInt(e.target.value) || 0;
            });
            playerDiv.appendChild(input);
        }
        
        weightsContainer.appendChild(playerDiv);
    }
}

function updateNumPlayers() {
    numPlayers = parseInt(numPlayersInput.value);
    weightVectors = Array(numPlayers).fill().map(() => new Array(k).fill(0));
    createWeightInputs();
}

function addPlayer() {
    numPlayers++;
    numPlayersInput.value = numPlayers;
    weightVectors.push(new Array(k).fill(0));
    createWeightInputs();
}

function removePlayer() {
    if (numPlayers > 1) {
        numPlayers--;
        numPlayersInput.value = numPlayers;
        weightVectors.pop();
        createWeightInputs();
    }
}

function loadCSV() {
    const file = csvInput.files[0];
    if (!file) {
        showError('Please select a CSV file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const lines = e.target.result.split('\n').filter(line => line.trim());
            if (lines.length < 2) {
                throw new Error('CSV must have at least 2 rows (quotas + at least 1 player)');
            }
            
            // Parse quotas from first row
            const quotaRow = lines[0].split(',').map(val => parseInt(val.trim()));
            k = quotaRow.length;
            quotas = quotaRow;
            kInput.value = k;
            
            // Parse weight vectors from subsequent rows
            const playerRows = lines.slice(1);
            numPlayers = playerRows.length;
            weightVectors = playerRows.map(row => 
                row.split(',').map(val => parseInt(val.trim()) || 0)
            );
            
            // Ensure all weight vectors have correct length
            weightVectors = weightVectors.map(weights => {
                while (weights.length < k) weights.push(0);
                return weights.slice(0, k);
            });
            
            numPlayersInput.value = numPlayers;
            
            // Recreate inputs with loaded data
            createQuotaInputs();
            createWeightInputs();
            
            // Fill in the loaded values
            document.querySelectorAll('.quota-input input').forEach((input, i) => {
                input.value = quotas[i];
            });
            
            document.querySelectorAll('.weight-row').forEach((row, playerIndex) => {
                const inputs = row.querySelectorAll('input');
                inputs.forEach((input, dimIndex) => {
                    input.value = weightVectors[playerIndex][dimIndex];
                });
            });
            
            showSuccess('CSV loaded successfully!');
        } catch (error) {
            showError('Error parsing CSV: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    resultsContent.innerHTML = '';
    resultsContent.appendChild(errorDiv);
    results.classList.remove('hidden');
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.textContent = message;
    resultsContent.innerHTML = '';
    resultsContent.appendChild(successDiv);
    results.classList.remove('hidden');
}

function calculate() {
    // Collect current input values
    document.querySelectorAll('.quota-input input').forEach((input, i) => {
        quotas[i] = parseInt(input.value) || 0;
    });
    
    document.querySelectorAll('.weight-row').forEach((row, playerIndex) => {
        const inputs = row.querySelectorAll('input');
        inputs.forEach((input, dimIndex) => {
            weightVectors[playerIndex][dimIndex] = parseInt(input.value) || 0;
        });
    });
    
    // Validate inputs
    if (quotas.some(q => q < 0) || weightVectors.some(weights => weights.some(w => w < 0))) {
        showError('All values must be non-negative integers');
        return;
    }
    
    // Get selected method
    const method = document.querySelector('input[name="method"]:checked').value;
    
    // Show loading
    loading.classList.remove('hidden');
    results.classList.add('hidden');
    
    // Calculate with a small delay to show loading animation
    setTimeout(() => {
        try {
            let values;
            if (method === 'shapley') {
                values = calculateShapleyValues();
            } else {
                values = calculateBanzhafValues();
            }
            
            displayResults(values, method);
        } catch (error) {
            showError('Calculation error: ' + error.message);
        } finally {
            loading.classList.add('hidden');
        }
    }, 100);
}

function isWinningCoalition(coalition) {
    // Check if coalition meets all quotas
    for (let dim = 0; dim < k; dim++) {
        let sum = 0;
        for (let player of coalition) {
            sum += weightVectors[player][dim];
        }
        if (sum < quotas[dim]) {
            return false;
        }
    }
    return true;
}

function calculateShapleyValues() {
    const shapleyValues = new Array(numPlayers).fill(0);
    
    // Generate all permutations of players
    const permutations = generatePermutations(Array.from({length: numPlayers}, (_, i) => i));
    
    for (const permutation of permutations) {
        for (let i = 0; i < numPlayers; i++) {
            const player = permutation[i];
            const predecessors = permutation.slice(0, i);
            
            // Check marginal contribution
            const withoutPlayer = isWinningCoalition(predecessors);
            const withPlayer = isWinningCoalition([...predecessors, player]);
            
            if (withPlayer && !withoutPlayer) {
                shapleyValues[player] += 1;
            }
        }
    }
    
    // Normalize by number of permutations
    const totalPermutations = factorial(numPlayers);
    return shapleyValues.map(value => value / totalPermutations);
}

function calculateBanzhafValues() {
    const banzhafValues = new Array(numPlayers).fill(0);
    
    // Generate all coalitions (subsets of players)
    const allPlayers = Array.from({length: numPlayers}, (_, i) => i);
    const coalitions = generateSubsets(allPlayers);
    
    for (const coalition of coalitions) {
        if (isWinningCoalition(coalition)) {
            // Check each player's swing contribution
            for (const player of coalition) {
                const coalitionWithoutPlayer = coalition.filter(p => p !== player);
                if (!isWinningCoalition(coalitionWithoutPlayer)) {
                    banzhafValues[player] += 1;
                }
            }
        }
    }
    
    // Normalize by total swings
    const totalSwings = banzhafValues.reduce((sum, value) => sum + value, 0);
    if (totalSwings === 0) {
        return banzhafValues; // All zeros if no winning coalitions
    }
    
    return banzhafValues.map(value => value / totalSwings);
}

function generatePermutations(arr) {
    if (arr.length <= 1) return [arr];
    
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        const rest = arr.slice(0, i).concat(arr.slice(i + 1));
        const perms = generatePermutations(rest);
        for (const perm of perms) {
            result.push([arr[i], ...perm]);
        }
    }
    return result;
}

function generateSubsets(arr) {
    const result = [];
    const n = arr.length;
    
    // Generate all 2^n subsets
    for (let i = 0; i < (1 << n); i++) {
        const subset = [];
        for (let j = 0; j < n; j++) {
            if (i & (1 << j)) {
                subset.push(arr[j]);
            }
        }
        result.push(subset);
    }
    return result;
}

function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

function displayResults(values, method) {
    resultsContent.innerHTML = '';
    
    const methodName = method === 'shapley' ? 'Shapley Values' : 'Banzhaf Index';
    const title = document.createElement('h4');
    title.textContent = methodName;
    title.style.marginBottom = '15px';
    resultsContent.appendChild(title);
    
    // Create results table
    const table = document.createElement('table');
    table.className = 'results-table';
    
    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const playerHeader = document.createElement('th');
    playerHeader.textContent = 'Player';
    headerRow.appendChild(playerHeader);
    
    const valueHeader = document.createElement('th');
    valueHeader.textContent = 'Value';
    headerRow.appendChild(valueHeader);
    
    const percentHeader = document.createElement('th');
    percentHeader.textContent = 'Percentage';
    headerRow.appendChild(percentHeader);
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Body
    const tbody = document.createElement('tbody');
    values.forEach((value, index) => {
        const row = document.createElement('tr');
        
        const playerCell = document.createElement('td');
        playerCell.textContent = `Player ${index + 1}`;
        row.appendChild(playerCell);
        
        const valueCell = document.createElement('td');
        valueCell.textContent = value.toFixed(6);
        row.appendChild(valueCell);
        
        const percentCell = document.createElement('td');
        percentCell.textContent = `${(value * 100).toFixed(2)}%`;
        row.appendChild(percentCell);
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    resultsContent.appendChild(table);
    
    // Add game summary
    const summary = document.createElement('div');
    summary.style.marginTop = '20px';
    summary.style.padding = '15px';
    summary.style.backgroundColor = '#f8f9fa';
    summary.style.borderRadius = '6px';
    summary.innerHTML = `
        <h5>Game Summary:</h5>
        <p><strong>Dimensions (k):</strong> ${k}</p>
        <p><strong>Quotas:</strong> [${quotas.join(', ')}]</p>
        <p><strong>Players:</strong> ${numPlayers}</p>
        <p><strong>Weight Vectors:</strong></p>
        <ul>
            ${weightVectors.map((weights, i) => 
                `<li>Player ${i + 1}: [${weights.join(', ')}]</li>`
            ).join('')}
        </ul>
    `;
    resultsContent.appendChild(summary);
    
    results.classList.remove('hidden');
} 