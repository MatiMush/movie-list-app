# Testing Guide for Real-Time Search and Category Tabs

## Overview
This guide explains how to test the new real-time search functionality and category tabs feature.

## Prerequisites
1. TMDB API key - Get one from https://www.themoviedb.org/settings/api
2. Node.js and npm installed

## Setup

### Backend Setup
```bash
cd backend
npm install

# Create .env file with your TMDB API key
echo "PORT=5000" > .env
echo "TMDB_API_KEY=your_actual_tmdb_api_key" >> .env

# Start the backend server
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install

# Start the frontend dev server
npm run dev
```

## Test Scenarios

### 1. Real-Time Search Functionality

#### Test Case 1.1: Search for "Harry Potter"
**Expected Result**: Should display all Harry Potter movies from TMDB
**Steps**:
1. Type "Harry Potter" in the search box
2. Click the "🔍 Search" button or press Enter
3. Verify movies like "Harry Potter and the Philosopher's Stone", etc. appear
4. Verify each movie shows director and actors

#### Test Case 1.2: Search for a movie not in popular list
**Expected Result**: Should find the movie via TMDB search
**Steps**:
1. Search for an obscure movie (e.g., "The Room 2003")
2. Verify the movie appears in results

#### Test Case 1.3: Empty search
**Expected Result**: Should show no results message
**Steps**:
1. Clear the search box and submit
2. Verify "No movies found" message appears

#### Test Case 1.4: Clear Search
**Expected Result**: Should return to browse mode
**Steps**:
1. Perform a search
2. Click "✕ Clear Search" button
3. Verify returns to Popular category

### 2. Category Tabs

#### Test Case 2.1: Popular Tab (Default)
**Expected Result**: Shows popular movies from TMDB
**Steps**:
1. Open the app
2. Verify "🔥 Popular" tab is highlighted/active
3. Verify popular movies are displayed

#### Test Case 2.2: Top Rated Tab
**Expected Result**: Shows top-rated movies from TMDB
**Steps**:
1. Click "⭐ Top Rated" tab
2. Verify tab becomes active (highlighted)
3. Verify top-rated movies appear (high ratings)

#### Test Case 2.3: Now Playing Tab
**Expected Result**: Shows currently playing movies
**Steps**:
1. Click "🎬 Now Playing" tab
2. Verify tab becomes active
3. Verify recent/current movies appear

#### Test Case 2.4: Genres Dropdown
**Expected Result**: Shows movies of selected genre
**Steps**:
1. Click the "🎭 Genres" dropdown
2. Select "Action" (or any genre)
3. Verify action movies appear
4. Try selecting different genres

### 3. Existing Filters Still Work

#### Test Case 3.1: Year Filter
**Expected Result**: Filters displayed movies by year
**Steps**:
1. Select a category (e.g., Popular)
2. Use the "Filter by Year" dropdown
3. Select a specific year
4. Verify only movies from that year are shown

#### Test Case 3.2: Genre Filter (Local)
**Expected Result**: Filters displayed movies by genre
**Steps**:
1. Select a category
2. Use the "Filter by Genre" dropdown
3. Select a genre
4. Verify movies are filtered

#### Test Case 3.3: Combined Filters
**Expected Result**: Both filters work together
**Steps**:
1. Select a category
2. Apply year filter
3. Apply genre filter
4. Verify both filters are applied

### 4. Pagination/Load More

#### Test Case 4.1: Load More Button
**Expected Result**: Loads additional movies
**Steps**:
1. Scroll to bottom of page
2. Click "Load More" button
3. Verify more movies appear
4. Verify loading spinner shows briefly

### 5. Responsive Design

#### Test Case 5.1: Mobile View
**Expected Result**: UI adapts to mobile screen
**Steps**:
1. Resize browser to mobile width (< 768px)
2. Verify:
   - Category tabs stack vertically
   - Genres dropdown takes full width
   - Movie grid adapts to single column
   - Search buttons stack vertically

#### Test Case 5.2: Tablet View
**Expected Result**: UI adapts to tablet screen
**Steps**:
1. Resize browser to tablet width (768px - 1024px)
2. Verify UI elements are properly sized

### 6. Loading States

#### Test Case 6.1: Initial Load
**Expected Result**: Shows loading spinner
**Steps**:
1. Refresh the page
2. Verify "Loading movies..." message appears
3. Verify spinner/message disappears when movies load

#### Test Case 6.2: Category Switch
**Expected Result**: Shows loading during category change
**Steps**:
1. Switch between categories
2. Verify loading indicator appears briefly

### 7. Error Handling

#### Test Case 7.1: Backend Offline
**Expected Result**: Shows error message
**Steps**:
1. Stop the backend server
2. Try to load the app or perform a search
3. Verify error message appears

#### Test Case 7.2: Invalid API Key
**Expected Result**: Shows error message
**Steps**:
1. Use invalid TMDB API key in backend .env
2. Restart backend
3. Verify error message on frontend

## API Endpoints Testing

You can also test the backend directly using curl or Postman:

### Search Endpoint
```bash
curl "http://localhost:5000/api/movies/search?query=Harry%20Potter&page=1"
```

### Popular Movies
```bash
curl "http://localhost:5000/api/movies/popular?page=1"
```

### Top Rated Movies
```bash
curl "http://localhost:5000/api/movies/top-rated?page=1"
```

### Now Playing Movies
```bash
curl "http://localhost:5000/api/movies/now-playing?page=1"
```

### Movies by Genre
```bash
curl "http://localhost:5000/api/movies/genre/28?page=1"
# 28 = Action genre ID
```

### List of Genres
```bash
curl "http://localhost:5000/api/genres"
```

## Success Criteria

All test cases should pass:
- ✅ Searching "Harry Potter" shows all Harry Potter movies
- ✅ Can browse Popular, Top Rated, Now Playing categories
- ✅ Can filter by genre using genre selector
- ✅ All movies include director and actors
- ✅ Loading states show while fetching
- ✅ Can clear search and return to browsing
- ✅ Existing year/genre filters still work
- ✅ Mobile responsive design works
- ✅ No console errors in browser
- ✅ No errors in backend logs

## Known Limitations

1. **Rate Limiting**: TMDB API has rate limits. If you see errors, wait a few seconds between requests.
2. **Credits Fetching**: Each movie requires an additional API call for credits, which may slow down initial page loads.
3. **No Caching**: Results are not cached on frontend, so switching categories will always fetch fresh data.

## Troubleshooting

### Issue: "Failed to fetch movies"
**Solution**: Check that backend is running and TMDB_API_KEY is set correctly

### Issue: Movies don't have directors/actors
**Solution**: TMDB API might be rate-limited. Wait a minute and try again.

### Issue: Search doesn't work
**Solution**: Verify network tab in browser shows request to /api/movies/search

### Issue: Category tabs don't switch
**Solution**: Check browser console for errors. Verify backend endpoints are responding.
