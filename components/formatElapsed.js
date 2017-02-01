module.exports = started => {
    const elapsedMillis = Date.now() - started;
    const elapsedSeconds = Math.floor(elapsedMillis/1000);
    const elapsedMinutes = Math.floor(elapsedSeconds/60);
    const elapsedHours = Math.floor(elapsedMinutes/60);
    const elapsedDays = Math.floor(elapsedHours/24);
    if (elapsedDays > 1) {
        return `${elapsedDays} days`;
    }
    if (elapsedHours > 25) {
        return `1 day and ${elapsedHours - 24} hours`;
    }
    if (elapsedMinutes >= 120) {
        return `${elapsedHours} hours`;
    }
    if (elapsedMinutes > 61) {
        return `1 hour and ${elapsedMinutes - 60} minutes`;
    }
    if (elapsedMinutes > 1) {
        return `${elapsedMinutes} minutes`;
    }
    if (elapsedSeconds > 1) {
        return `${elapsedSeconds} seconds`;
    }
    return `a second`;
}
