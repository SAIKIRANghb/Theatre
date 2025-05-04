import '../styles/Theatres.css';
import React, { useState, useEffect } from 'react';
import MovieCard from './Card';
import axios from 'axios';
import { API_URL } from '../api';

export default function Theatre({ theatre }) {
  const [currentDate, setCurrentDate] = useState('');
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [filters, setFilters] = useState({
    genre: 'all',
    language: 'all'
  });
  const [uniqueGenres, setUniqueGenres] = useState([]);
  const [uniqueLanguages, setUniqueLanguages] = useState([]);
  const [theatreId, setTheatreId] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      // Clear previous movies while fetching new data
      setFilteredMovies([]);

      try {
        const theatreResponse = await axios.get(API_URL+`/theatres/name/${theatre}`);
        setTheatreId(theatreResponse.data._id);

        const moviesResponse = await axios.get(API_URL+`/moviesByTheatre?theatreId=${theatreResponse.data._id}`);
        
        const uniqueMoviesMap = new Map();
        moviesResponse.data.forEach(movie => {
          if (!uniqueMoviesMap.has(movie.title)) {
            uniqueMoviesMap.set(movie.title, movie);
          }
        });

        const uniqueMovies = Array.from(uniqueMoviesMap.values());
        setMovies(uniqueMovies);

        // Extract unique genres and languages
        const genres = [...new Set(uniqueMovies.map(movie => movie.genre))];
        const languages = [...new Set(uniqueMovies.map(movie => movie.language))];
        setUniqueGenres(genres);
        setUniqueLanguages(languages);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchMovies();

    const today = new Date().toISOString().split('T')[0];
    setCurrentDate(today);
  }, [theatre]);

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [id]: value }));
  };

  useEffect(() => {
    const filterMovies = async () => {
      let filtered = movies;

      // Apply genre filter
      if (filters.genre !== 'all') {
        filtered = filtered.filter(movie => movie.genre.toLowerCase() === filters.genre.toLowerCase());
      }

      // Apply language filter
      if (filters.language !== 'all') {
        filtered = filtered.filter(movie => movie.language.toLowerCase() === filters.language.toLowerCase());
      }

      // Apply date filter
      if (currentDate) {
        try {
          const filteredByDate = await Promise.all(
            filtered.map(async (movie) => {
              const response = await axios.get(API_URL+`/slotsQuery?movieId=${movie._id}&theatreId=${theatreId}&date=${currentDate}`);
              const slots = response.data;
              return slots.length > 0 ? movie : null;
            })
          );

          filtered = filteredByDate.filter(movie => movie !== null);
        } catch (error) {
          console.error('Error fetching slots:', error);
        }
      }

      setFilteredMovies(filtered);
    };

    filterMovies();
  }, [filters, movies, currentDate, theatreId]);

  return (
    <>
      <div style={{ height: '70px' }}></div>
      <div id="Body">
        <div className="tracker">
          <h3>{theatre.toUpperCase() + ' Theatres'}</h3>
          <div className="filter-group">
            <label htmlFor="genre">Genre</label>
            <select id="genre" onChange={handleFilterChange} value={filters.genre}>
              <option value="all">All</option>
              {uniqueGenres.map((genre, index) => (
                <option key={index} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="language">Language</label>
            <select id="language" onChange={handleFilterChange} value={filters.language}>
              <option value="all">All</option>
              {uniqueLanguages.map((language, index) => (
                <option key={index} value={language}>{language}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              id="date"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="Thcontent" style={{ background: 'none' }}>
          {filteredMovies && filteredMovies.length > 0 ? (
            filteredMovies.map((movie) => (
              <MovieCard
                key={movie._id}
                movieId={movie._id}
                movie={movie}
                theatreName={theatre}
              />
            ))
          ) : (
            <p>No movies found for this theatre on the selected date.</p>
          )}
        </div>
      </div>
    </>
  );
}
