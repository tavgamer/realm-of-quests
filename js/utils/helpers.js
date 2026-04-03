// Realm of Quests - Utility/Helper Functions
// Small reusable functions that other files can use.

// Calculate distance between two points (useful for enemy detection range)
function distanceBetween(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

// Get a random integer between min and max (inclusive)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
