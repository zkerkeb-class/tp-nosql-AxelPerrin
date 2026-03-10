// API Base URL
const API_BASE = '/api';

// State
let currentPage = 1;
let totalPages = 1;
let currentSection = 'pokemons';
let authToken = localStorage.getItem('token');
let currentUser = localStorage.getItem('username');
let allPokemons = [];
let selectedTeamPokemons = [];
let editingTeamId = null;

// DOM Elements
const pokemonGrid = document.getElementById('pokemonGrid');
const favoritesGrid = document.getElementById('favoritesGrid');
const teamsList = document.getElementById('teamsList');
const statsContainer = document.getElementById('statsContainer');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const pagination = document.getElementById('pagination');
const pokemonModal = document.getElementById('pokemonModal');
const pokemonDetail = document.getElementById('pokemonDetail');
const authModal = document.getElementById('authModal');
const teamModal = document.getElementById('teamModal');
const authSection = document.getElementById('authSection');
const userSection = document.getElementById('userSection');
const usernameDisplay = document.getElementById('usernameDisplay');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initNavigation();
    initModals();
    initFilters();
    loadPokemons();
});

// Auth Functions
function initAuth() {
    updateAuthUI();
    
    document.getElementById('loginBtn').addEventListener('click', () => openAuthModal('login'));
    document.getElementById('registerBtn').addEventListener('click', () => openAuthModal('register'));
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('authForm').addEventListener('submit', handleAuth);
}

function updateAuthUI() {
    if (authToken && currentUser) {
        authSection.classList.add('hidden');
        userSection.classList.remove('hidden');
        usernameDisplay.textContent = currentUser;
    } else {
        authSection.classList.remove('hidden');
        userSection.classList.add('hidden');
    }
}

function openAuthModal(type) {
    const title = document.getElementById('authModalTitle');
    const submitBtn = document.getElementById('authSubmitBtn');
    
    if (type === 'login') {
        title.textContent = 'Connexion';
        submitBtn.textContent = 'Se connecter';
        submitBtn.dataset.type = 'login';
    } else {
        title.textContent = 'Inscription';
        submitBtn.textContent = 'S\'inscrire';
        submitBtn.dataset.type = 'register';
    }
    
    document.getElementById('authError').classList.add('hidden');
    document.getElementById('authForm').reset();
    authModal.classList.remove('hidden');
}

async function handleAuth(e) {
    e.preventDefault();
    
    const type = document.getElementById('authSubmitBtn').dataset.type;
    const username = document.getElementById('authUsername').value;
    const password = document.getElementById('authPassword').value;
    const errorEl = document.getElementById('authError');
    
    try {
        const endpoint = type === 'login' ? '/auth/login' : '/auth/register';
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erreur');
        }
        
        if (type === 'login') {
            authToken = data.token;
            currentUser = username;
            localStorage.setItem('token', authToken);
            localStorage.setItem('username', username);
            updateAuthUI();
            authModal.classList.add('hidden');
            
            // Reload current section if needed
            if (currentSection === 'favorites') {
                loadFavorites();
            } else if (currentSection === 'teams') {
                loadTeams();
            }
        } else {
            // After registration, switch to login
            openAuthModal('login');
            errorEl.textContent = 'Compte cree. Connectez-vous.';
            errorEl.style.color = 'var(--accent-success)';
            errorEl.classList.remove('hidden');
        }
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.style.color = 'var(--accent-danger)';
        errorEl.classList.remove('hidden');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    updateAuthUI();
    
    if (currentSection === 'favorites' || currentSection === 'teams') {
        switchSection('pokemons');
    }
}

// Navigation
function initNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.dataset.section;
            switchSection(section);
        });
    });
}

function switchSection(section) {
    currentSection = section;
    
    // Update nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.section === section);
    });
    
    // Update sections
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}Section`).classList.add('active');
    
    // Load data
    switch (section) {
        case 'pokemons':
            // Already loaded
            break;
        case 'favorites':
            loadFavorites();
            break;
        case 'teams':
            loadTeams();
            break;
        case 'stats':
            loadStats();
            break;
    }
}

// Modals
function initModals() {
    document.getElementById('closeModal').addEventListener('click', () => {
        pokemonModal.classList.add('hidden');
    });
    
    document.getElementById('closeAuthModal').addEventListener('click', () => {
        authModal.classList.add('hidden');
    });
    
    document.getElementById('closeTeamModal').addEventListener('click', () => {
        teamModal.classList.add('hidden');
    });
    
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', () => {
            pokemonModal.classList.add('hidden');
            authModal.classList.add('hidden');
            teamModal.classList.add('hidden');
        });
    });
    
    document.getElementById('createTeamBtn').addEventListener('click', openCreateTeamModal);
    document.getElementById('teamForm').addEventListener('submit', handleTeamSubmit);
}

// Filters
function initFilters() {
    let searchTimeout;
    
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            loadPokemons();
        }, 300);
    });
    
    typeFilter.addEventListener('change', () => {
        currentPage = 1;
        loadPokemons();
    });
}

// Pokemon Functions
async function loadPokemons() {
    pokemonGrid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    try {
        const params = new URLSearchParams({
            page: currentPage,
            limit: 24
        });
        
        if (searchInput.value) {
            params.append('name', searchInput.value);
        }
        
        if (typeFilter.value) {
            params.append('type', typeFilter.value);
        }
        
        const response = await fetch(`${API_BASE}/pokemons?${params}`);
        const data = await response.json();
        
        totalPages = data.totalPages;
        renderPokemons(data.data);
        renderPagination();
    } catch (error) {
        pokemonGrid.innerHTML = '<div class="empty-state">Erreur de chargement</div>';
    }
}

function renderPokemons(pokemons) {
    if (pokemons.length === 0) {
        pokemonGrid.innerHTML = '<div class="empty-state">Aucun Pokemon trouve</div>';
        return;
    }
    
    pokemonGrid.innerHTML = pokemons.map(pokemon => createPokemonCard(pokemon)).join('');
    
    // Add click events
    pokemonGrid.querySelectorAll('.pokemon-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            openPokemonDetail(id);
        });
    });
}

function createPokemonCard(pokemon) {
    const types = pokemon.type.map(t => 
        `<span class="type-badge ${t.toLowerCase()}">${t}</span>`
    ).join('');
    
    return `
        <div class="pokemon-card" data-id="${pokemon.id}">
            <div class="pokemon-card-header">
                <span class="pokemon-id">#${String(pokemon.id).padStart(3, '0')}</span>
            </div>
            <div class="pokemon-image-container">
                <img src="/assets/pokemons/${pokemon.id}.png" alt="${pokemon.name.english}" class="pokemon-image" onerror="this.src='/assets/pokemons/1.png'">
            </div>
            <div class="pokemon-name">${pokemon.name.french || pokemon.name.english}</div>
            <div class="pokemon-types">${types}</div>
        </div>
    `;
}

function renderPagination() {
    pagination.innerHTML = `
        <button class="pagination-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Precedent</button>
        <span class="pagination-info">Page ${currentPage} sur ${totalPages}</span>
        <button class="pagination-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Suivant</button>
    `;
}

function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    loadPokemons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function openPokemonDetail(id) {
    try {
        const response = await fetch(`${API_BASE}/pokemons/${id}`);
        const pokemon = await response.json();
        
        const types = pokemon.type.map(t => 
            `<span class="type-badge ${t.toLowerCase()}">${t}</span>`
        ).join('');
        
        const maxStat = 255;
        
        pokemonDetail.innerHTML = `
            <img src="/assets/pokemons/${pokemon.id}.png" alt="${pokemon.name.english}" class="pokemon-detail-image" onerror="this.src='/assets/pokemons/1.png'">
            <h2 class="pokemon-detail-name">${pokemon.name.french || pokemon.name.english}</h2>
            <p class="pokemon-detail-id">#${String(pokemon.id).padStart(3, '0')} - ${pokemon.name.english}</p>
            <div class="pokemon-detail-types">${types}</div>
            
            <div class="pokemon-stats">
                <h4>Statistiques</h4>
                <div class="stat-row">
                    <span class="stat-label">HP</span>
                    <div class="stat-bar-container">
                        <div class="stat-bar hp" style="width: ${(pokemon.base.HP / maxStat) * 100}%"></div>
                    </div>
                    <span class="stat-value">${pokemon.base.HP}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Attaque</span>
                    <div class="stat-bar-container">
                        <div class="stat-bar attack" style="width: ${(pokemon.base.Attack / maxStat) * 100}%"></div>
                    </div>
                    <span class="stat-value">${pokemon.base.Attack}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Defense</span>
                    <div class="stat-bar-container">
                        <div class="stat-bar defense" style="width: ${(pokemon.base.Defense / maxStat) * 100}%"></div>
                    </div>
                    <span class="stat-value">${pokemon.base.Defense}</span>
                </div>
                ${pokemon.base.SpecialAttack ? `
                <div class="stat-row">
                    <span class="stat-label">Atq. Spe</span>
                    <div class="stat-bar-container">
                        <div class="stat-bar sp-attack" style="width: ${(pokemon.base.SpecialAttack / maxStat) * 100}%"></div>
                    </div>
                    <span class="stat-value">${pokemon.base.SpecialAttack}</span>
                </div>` : ''}
                ${pokemon.base.SpecialDefense ? `
                <div class="stat-row">
                    <span class="stat-label">Def. Spe</span>
                    <div class="stat-bar-container">
                        <div class="stat-bar sp-defense" style="width: ${(pokemon.base.SpecialDefense / maxStat) * 100}%"></div>
                    </div>
                    <span class="stat-value">${pokemon.base.SpecialDefense}</span>
                </div>` : ''}
                ${pokemon.base.Speed ? `
                <div class="stat-row">
                    <span class="stat-label">Vitesse</span>
                    <div class="stat-bar-container">
                        <div class="stat-bar speed" style="width: ${(pokemon.base.Speed / maxStat) * 100}%"></div>
                    </div>
                    <span class="stat-value">${pokemon.base.Speed}</span>
                </div>` : ''}
            </div>
            
            <div class="pokemon-detail-actions">
                ${authToken ? `<button class="btn btn-primary" onclick="toggleFavorite(${pokemon.id})">Ajouter aux favoris</button>` : ''}
            </div>
        `;
        
        pokemonModal.classList.remove('hidden');
    } catch (error) {
        console.error('Error loading Pokemon:', error);
    }
}

// Favorites Functions
async function loadFavorites() {
    if (!authToken) {
        document.getElementById('favoritesAuth').classList.remove('hidden');
        favoritesGrid.innerHTML = '';
        return;
    }
    
    document.getElementById('favoritesAuth').classList.add('hidden');
    favoritesGrid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    try {
        const response = await fetch(`${API_BASE}/favorites`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (!response.ok) {
            throw new Error('Unauthorized');
        }
        
        const favorites = await response.json();
        
        if (favorites.length === 0) {
            favoritesGrid.innerHTML = '<div class="empty-state">Aucun favori</div>';
            return;
        }
        
        favoritesGrid.innerHTML = favorites.map(pokemon => createPokemonCard(pokemon)).join('');
        
        favoritesGrid.querySelectorAll('.pokemon-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = parseInt(card.dataset.id);
                openPokemonDetail(id);
            });
        });
    } catch (error) {
        favoritesGrid.innerHTML = '<div class="empty-state">Erreur de chargement</div>';
    }
}

async function toggleFavorite(pokemonId) {
    if (!authToken) {
        openAuthModal('login');
        return;
    }
    
    try {
        await fetch(`${API_BASE}/favorites/${pokemonId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        pokemonModal.classList.add('hidden');
        
        if (currentSection === 'favorites') {
            loadFavorites();
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
    }
}

// Teams Functions
async function loadTeams() {
    if (!authToken) {
        document.getElementById('teamsAuth').classList.remove('hidden');
        teamsList.innerHTML = '';
        document.getElementById('createTeamBtn').classList.add('hidden');
        return;
    }
    
    document.getElementById('teamsAuth').classList.add('hidden');
    document.getElementById('createTeamBtn').classList.remove('hidden');
    teamsList.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    try {
        const response = await fetch(`${API_BASE}/teams`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const teams = await response.json();
        
        if (teams.length === 0) {
            teamsList.innerHTML = '<div class="empty-state">Aucune equipe</div>';
            return;
        }
        
        // Load team details with Pokemon info
        teamsList.innerHTML = '';
        
        for (const team of teams) {
            const detailResponse = await fetch(`${API_BASE}/teams/${team._id}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const teamDetail = await detailResponse.json();
            teamsList.innerHTML += createTeamCard(teamDetail);
        }
        
        // Add event listeners
        teamsList.querySelectorAll('.delete-team-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteTeam(btn.dataset.id));
        });
        
        teamsList.querySelectorAll('.edit-team-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const card = btn.closest('.team-card');
                const teamId = card.dataset.teamId;
                const teamName = card.dataset.teamName;
                const teamPokemons = card.dataset.teamPokemons ? card.dataset.teamPokemons.split(',').map(Number) : [];
                openEditTeamModal(teamId, teamName, teamPokemons);
            });
        });
    } catch (error) {
        teamsList.innerHTML = '<div class="empty-state">Erreur de chargement</div>';
    }
}

function createTeamCard(team) {
    const pokemonIds = team.pokemons.map(p => p.id);
    const pokemonsHtml = team.pokemons.length > 0 
        ? team.pokemons.map(p => `
            <div class="team-pokemon">
                <img src="/assets/pokemons/${p.id}.png" alt="${p.name.english}" onerror="this.src='/assets/pokemons/1.png'">
                <span>${p.name.french || p.name.english}</span>
            </div>
        `).join('')
        : '<span class="team-empty">Aucun Pokemon</span>';
    
    return `
        <div class="team-card" data-team-id="${team._id}" data-team-name="${team.name}" data-team-pokemons="${pokemonIds.join(',')}">
            <div class="team-header">
                <h3 class="team-name">${team.name}</h3>
                <div class="team-actions">
                    <button class="btn btn-secondary btn-sm edit-team-btn" data-id="${team._id}">Modifier</button>
                    <button class="btn btn-danger btn-sm delete-team-btn" data-id="${team._id}">Supprimer</button>
                </div>
            </div>
            <div class="team-pokemons">${pokemonsHtml}</div>
        </div>
    `;
}

async function openCreateTeamModal() {
    editingTeamId = null;
    selectedTeamPokemons = [];
    document.getElementById('teamModalTitle').textContent = 'Nouvelle equipe';
    document.getElementById('teamSubmitBtn').textContent = 'Creer l\'equipe';
    document.getElementById('teamName').value = '';
    
    await loadPokemonSelector();
    teamModal.classList.remove('hidden');
}

async function openEditTeamModal(teamId, teamName, teamPokemons) {
    editingTeamId = teamId;
    selectedTeamPokemons = [...teamPokemons];
    document.getElementById('teamModalTitle').textContent = 'Modifier l\'equipe';
    document.getElementById('teamSubmitBtn').textContent = 'Sauvegarder';
    document.getElementById('teamName').value = teamName;
    
    await loadPokemonSelector();
    
    // Mark selected pokemons
    const selector = document.getElementById('pokemonSelector');
    selector.querySelectorAll('.pokemon-selector-item').forEach(item => {
        const id = parseInt(item.dataset.id);
        if (selectedTeamPokemons.includes(id)) {
            item.classList.add('selected');
        }
    });
    
    teamModal.classList.remove('hidden');
}

async function loadPokemonSelector() {
    // Load all pokemons for selector
    if (allPokemons.length === 0) {
        const response = await fetch(`${API_BASE}/pokemons?limit=151`);
        const data = await response.json();
        allPokemons = data.data;
    }
    
    const selector = document.getElementById('pokemonSelector');
    selector.innerHTML = allPokemons.map(p => `
        <div class="pokemon-selector-item" data-id="${p.id}">
            <img src="/assets/pokemons/${p.id}.png" alt="${p.name.english}" onerror="this.src='/assets/pokemons/1.png'">
            <span>${p.name.french || p.name.english}</span>
        </div>
    `).join('');
    
    selector.querySelectorAll('.pokemon-selector-item').forEach(item => {
        item.addEventListener('click', () => toggleTeamPokemon(parseInt(item.dataset.id), item));
    });
}

function toggleTeamPokemon(id, element) {
    const index = selectedTeamPokemons.indexOf(id);
    
    if (index > -1) {
        selectedTeamPokemons.splice(index, 1);
        element.classList.remove('selected');
    } else if (selectedTeamPokemons.length < 6) {
        selectedTeamPokemons.push(id);
        element.classList.add('selected');
    }
}

async function handleTeamSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('teamName').value;
    
    try {
        let response;
        
        if (editingTeamId) {
            // Update existing team
            response = await fetch(`${API_BASE}/teams/${editingTeamId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    name,
                    pokemons: selectedTeamPokemons
                })
            });
        } else {
            // Create new team
            response = await fetch(`${API_BASE}/teams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    name,
                    pokemons: selectedTeamPokemons
                })
            });
        }
        
        if (!response.ok) {
            throw new Error(editingTeamId ? 'Erreur modification' : 'Erreur creation');
        }
        
        teamModal.classList.add('hidden');
        editingTeamId = null;
        loadTeams();
    } catch (error) {
        console.error('Error saving team:', error);
    }
}

async function deleteTeam(teamId) {
    if (!confirm('Supprimer cette equipe ?')) return;
    
    try {
        await fetch(`${API_BASE}/teams/${teamId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        loadTeams();
    } catch (error) {
        console.error('Error deleting team:', error);
    }
}

// Stats Functions
async function loadStats() {
    statsContainer.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    try {
        const response = await fetch(`${API_BASE}/stats`);
        const stats = await response.json();
        
        // Types stats
        const typeStatsHtml = stats.pokemonsByType.slice(0, 10).map(type => `
            <div class="type-stat-row">
                <span class="type-badge ${type._id.toLowerCase()}">${type._id}</span>
                <div class="type-stat-info">
                    <span class="type-stat-count">${type.count} Pokemon</span>
                    <span class="type-stat-hp">HP moy: ${Math.round(type.avgHP)}</span>
                </div>
            </div>
        `).join('');
        
        statsContainer.innerHTML = `
            <div class="stats-card">
                <h3>Meilleur Attaquant</h3>
                ${stats.topAttacker ? `
                    <div class="top-pokemon">
                        <img src="/assets/pokemons/${stats.topAttacker.id}.png" alt="${stats.topAttacker.name}" onerror="this.src='/assets/pokemons/1.png'">
                        <div class="top-pokemon-info">
                            <div class="top-pokemon-name">${stats.topAttacker.name}</div>
                            <div class="top-pokemon-value">${stats.topAttacker.attack} ATK</div>
                        </div>
                    </div>
                ` : '<p>Aucune donnee</p>'}
            </div>
            
            <div class="stats-card">
                <h3>Plus de HP</h3>
                ${stats.topHP ? `
                    <div class="top-pokemon">
                        <img src="/assets/pokemons/${stats.topHP.id}.png" alt="${stats.topHP.name}" onerror="this.src='/assets/pokemons/1.png'">
                        <div class="top-pokemon-info">
                            <div class="top-pokemon-name">${stats.topHP.name}</div>
                            <div class="top-pokemon-value">${stats.topHP.hp} HP</div>
                        </div>
                    </div>
                ` : '<p>Aucune donnee</p>'}
            </div>
            
            <div class="stats-card" style="grid-column: span 2;">
                <h3>Repartition par Type</h3>
                <div class="type-stats-list">${typeStatsHtml}</div>
            </div>
        `;
    } catch (error) {
        statsContainer.innerHTML = '<div class="empty-state">Erreur de chargement</div>';
    }
}

// Make functions globally available
window.changePage = changePage;
window.toggleFavorite = toggleFavorite;
