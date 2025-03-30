function openStatsModal() {
    document.getElementById('statsModal').style.display = "block";
}

function closeStatsModal() {
    document.getElementById('statsModal').style.display = "none";
}

function openSpriteModal() {
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