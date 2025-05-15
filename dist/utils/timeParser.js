/**
 * Parse a time string into milliseconds
 * @param timeString Format: '1d', '2h', '30m', '45s', or combined like '1d12h'
 * @returns milliseconds
 */
export function parseTimeString(timeString) {
    // If using combined format (e.g. '1d12h30m')
    if (timeString.match(/(\d+[dhms])+/)) {
        let totalMs = 0;
        const matches = timeString.match(/\d+[dhms]/g) || [];
        for (const match of matches) {
            const value = parseInt(match.slice(0, -1));
            const unit = match.slice(-1);
            switch (unit) {
                case 'd':
                    totalMs += value * 24 * 60 * 60 * 1000; // days to ms
                    break;
                case 'h':
                    totalMs += value * 60 * 60 * 1000; // hours to ms
                    break;
                case 'm':
                    totalMs += value * 60 * 1000; // minutes to ms
                    break;
                case 's':
                    totalMs += value * 1000; // seconds to ms
                    break;
            }
        }
        return totalMs;
    }
    // Simple format (e.g. '30d')
    const match = timeString.match(/^(\d+)([dhms])$/);
    if (!match) {
        throw new Error(`Invalid time format: ${timeString}. Expected format like '30d', '24h', '60m', or '30s'`);
    }
    const value = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
        case 'd':
            return value * 24 * 60 * 60 * 1000; // days to ms
        case 'h':
            return value * 60 * 60 * 1000; // hours to ms
        case 'm':
            return value * 60 * 1000; // minutes to ms
        case 's':
            return value * 1000; // seconds to ms
        default:
            throw new Error(`Invalid time unit: ${unit}. Expected 'd', 'h', 'm', or 's'`);
    }
}
//# sourceMappingURL=timeParser.js.map