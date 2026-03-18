// Configure rounds
const CONFIG = {
    moviesPerRound: 10
};

// State
const state = {
    roundMovies: [],
    currentIndex: 0,
    currentPlayer: 1,
    votes: {
        p1: {}, // mapping movieId -> boolean
        p2: {}
    }
};

// UI Elements
const ui = {
    screens: {
        welcome: document.getElementById('screen-welcome'),
        voting: document.getElementById('screen-voting'),
        transition: document.getElementById('screen-transition'),
        results: document.getElementById('screen-results')
    },
    
    // Welcome
    btnStart: document.getElementById('btn-start'),
    
    // Voting
    indicator: document.getElementById('player-indicator'),
    progressBar: document.getElementById('progress-bar'),
    card: document.getElementById('movie-card'),
    cardInner: document.getElementById('movie-card-inner'),
    genre: document.getElementById('movie-genre'),
    title: document.getElementById('movie-title'),
    year: document.getElementById('movie-year'),
    desc: document.getElementById('movie-desc'),
    btnNo: document.getElementById('btn-no'),
    btnYes: document.getElementById('btn-yes'),
    overlayYes: document.getElementById('overlay-yes'),
    overlayNo: document.getElementById('overlay-no'),
    
    // Transition
    btnNextPerson: document.getElementById('btn-next-person'),
    
    // Results
    resultsTitle: document.getElementById('results-title'),
    resultsSubtitle: document.getElementById('results-subtitle'),
    matchesContainer: document.getElementById('matches-container'),
    btnKeepSwiping: document.getElementById('btn-keep-swiping'),
    btnRestart: document.getElementById('btn-restart')
};

// Initialization
function init() {
    ui.btnStart.addEventListener('click', startNewRound);
    ui.btnNo.addEventListener('click', () => handleVote(false));
    ui.btnYes.addEventListener('click', () => handleVote(true));
    ui.btnNextPerson.addEventListener('click', startPlayer2);
    ui.btnKeepSwiping.addEventListener('click', startNewRound);
    ui.btnRestart.addEventListener('click', resetApp);
    
    showScreen('welcome');
}

// Logic functions
function showScreen(screenName) {
    Object.values(ui.screens).forEach(screen => {
        screen.classList.remove('active');
    });
    ui.screens[screenName].classList.add('active');
}

function getRandomMovies(count) {
    // Basic shuffle
    const shuffled = [...movieDatabase].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function startNewRound() {
    state.roundMovies = getRandomMovies(CONFIG.moviesPerRound);
    state.currentPlayer = 1;
    state.currentIndex = 0;
    state.votes.p1 = {};
    state.votes.p2 = {};
    
    renderVotingScreen();
    showScreen('voting');
}

function renderVotingScreen() {
    ui.indicator.textContent = `Player ${state.currentPlayer}'s Turn`;
    
    // Update Progress
    const progress = (state.currentIndex / CONFIG.moviesPerRound) * 100;
    ui.progressBar.style.width = `${progress}%`;
    
    // Reset Card Animation
    ui.card.className = 'movie-card fade-in';
    ui.overlayYes.classList.remove('show-overlay');
    ui.overlayNo.classList.remove('show-overlay');
    
    // Populate data
    const movie = state.roundMovies[state.currentIndex];
    
    // Slight delay to allow fade-in to restart properly
    setTimeout(() => {
        ui.card.classList.remove('fade-in');
    }, 400);

    ui.genre.textContent = movie.genre;
    ui.title.textContent = movie.title;
    ui.year.textContent = movie.year;
    ui.desc.textContent = movie.description;
    
    // Dynamic background based on movie color
    ui.card.style.background = `linear-gradient(135deg, ${movie.color} 0%, var(--bg-color) 100%)`;
}

function handleVote(isYes) {
    // Disable buttons temporarily
    ui.btnNo.disabled = true;
    ui.btnYes.disabled = true;
    
    // Record vote
    const movieId = state.roundMovies[state.currentIndex].id;
    if (state.currentPlayer === 1) {
        state.votes.p1[movieId] = isYes;
    } else {
        state.votes.p2[movieId] = isYes;
    }
    
    // Animate Card
    if (isYes) {
        ui.card.classList.add('swipe-right');
        ui.overlayYes.classList.add('show-overlay');
    } else {
        ui.card.classList.add('swipe-left');
        ui.overlayNo.classList.add('show-overlay');
    }
    
    // Process next step after animation
    setTimeout(() => {
        state.currentIndex++;
        
        if (state.currentIndex >= CONFIG.moviesPerRound) {
            handleRoundComplete();
        } else {
            renderVotingScreen();
        }
        
        ui.btnNo.disabled = false;
        ui.btnYes.disabled = false;
    }, 450); // Matches CSS transition time
}

function handleRoundComplete() {
    if (state.currentPlayer === 1) {
        showScreen('transition');
    } else {
        calculateResults();
    }
}

function startPlayer2() {
    state.currentPlayer = 2;
    state.currentIndex = 0;
    renderVotingScreen();
    showScreen('voting');
}

function calculateResults() {
    const matches = [];
    
    state.roundMovies.forEach(movie => {
        if (state.votes.p1[movie.id] && state.votes.p2[movie.id]) {
            matches.push(movie);
        }
    });
    
    renderResults(matches);
    showScreen('results');
}

function renderResults(matches) {
    ui.matchesContainer.innerHTML = ''; // clear
    
    if (matches.length > 0) {
        ui.resultsTitle.textContent = "It's a Match! 🎉";
        ui.resultsSubtitle.textContent = `You both want to watch ${matches.length} movie(s):`;
        
        matches.forEach((movie, index) => {
            // Slight staggered animation delay
            const delay = index * 0.1;
            
            const html = `
                <div class="match-item" style="animation-delay: ${delay}s">
                    <div class="match-genre">${movie.emoji}</div>
                    <div class="match-info">
                        <h3>${movie.title} (${movie.year})</h3>
                        <p>${movie.genre}</p>
                    </div>
                </div>
            `;
            ui.matchesContainer.insertAdjacentHTML('beforeend', html);
        });
    } else {
        ui.resultsTitle.textContent = "No Matches Yet 😢";
        ui.resultsSubtitle.textContent = "You guys have different tastes! Let's try another batch.";
    }
}

function resetApp() {
    showScreen('welcome');
}

// Start
document.addEventListener('DOMContentLoaded', init);
