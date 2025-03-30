function openStatsModal() {
    document.getElementById('statsModal').style.display = "block";
}

function closeStatsModal() {
    document.getElementById('statsModal').style.display = "none";
}

function openSpriteModal() {
    // Play the Pokémon cry sound when opening the sprite modal
    var cryAudio = document.getElementById('cryAudio');
    if (cryAudio) {
        cryAudio.play();
    }
    document.getElementById('spriteModal').style.display = "block";
}

function closeSpriteModal() {
    document.getElementById('spriteModal').style.display = "none";
}

// Close modals when clicking outside of them
window.onclick = function(event) {
    let statsModal = document.getElementById('statsModal');
    let spriteModal = document.getElementById('spriteModal');
    if (event.target == statsModal) {
        closeStatsModal();
    }
    if (event.target == spriteModal) {
        closeSpriteModal();
    }
};

// Add favorite functionality
function addFavorite() {
    var container = document.getElementById("pokemonContainer");
    var pokemon = JSON.parse(container.getAttribute("data-pokemon"));
    var favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    // Check if this Pokémon is already in favorites by its ID
    if (!favorites.some(function(p){ return p.id === pokemon.id; })) {
        favorites.push(pokemon);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        alert(pokemon.name + " added to favorites!");
    } else {
        alert(pokemon.name + " is already in favorites.");
    }
}