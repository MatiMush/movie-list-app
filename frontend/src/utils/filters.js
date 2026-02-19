/**
 * Generate a list of years from movies.
 * Always returns a full range from current year to minYear for complete filtering.
 *
 * @param _moviesArray - Array of movies with year property (not used, kept for API compatibility)
 * @param minYear - Minimum year to include in range (default: 1900)
 * @returns Sorted array of years in descending order
 */
export function getYearsFromMovies(_moviesArray, minYear = 1900) {
    const currentYear = new Date().getFullYear();
    const fullRange = [];
    for (let y = currentYear; y >= minYear; y--) {
        fullRange.push(y);
    }
    return fullRange;
}
