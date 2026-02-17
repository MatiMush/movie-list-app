/**
 * Generate a list of years from movies.
 * If no years are available or the list is too small, generates a full range from current year to minYear.
 *
 * @param moviesArray - Array of movies with year property
 * @param minYear - Minimum year to include in fallback range (default: 1900)
 * @returns Sorted array of years in descending order
 */
export function getYearsFromMovies(moviesArray, minYear = 1900) {
    const years = new Set();
    for (const movie of moviesArray) {
        if (!movie.year)
            continue;
        const year = typeof movie.year === 'number' ? movie.year : parseInt(String(movie.year), 10);
        if (!Number.isNaN(year)) {
            years.add(year);
        }
    }
    // If we have no years or very few years, generate a full range
    if (years.size === 0) {
        const currentYear = new Date().getFullYear();
        const fullRange = [];
        for (let y = currentYear; y >= minYear; y--) {
            fullRange.push(y);
        }
        return fullRange;
    }
    return Array.from(years).sort((a, b) => b - a);
}
