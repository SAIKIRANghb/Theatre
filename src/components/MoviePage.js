import React, { useState, useEffect } from 'react';
import '../styles/MoviePage.css'; 
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { API_URL } from '../api';

const PinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const formatDate = (dateString) => {
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
};

const MoviePage = (props) => {
  const { movieId } = useParams(); // Updated to use movieId
  const [movie, setMovie] = useState(null);
  const [timeSlots, setTimeSlots] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [theatreName, setTheatreName] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false); 
  const location = useLocation();
  const navigate = useNavigate();
  // console.log('saikiran',movieId)
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(API_URL+`/movies/${movieId}`); // Updated to fetch movie by movieId
        if (!response.ok) {
          navigate('/*');
          throw new Error('Failed to fetch movie');
        };
        const movieData = await response.json();
        setMovie(movieData);

        const theatreRes = await fetch(API_URL+`/theatres/${movieData.theatre}`);
        if (!theatreRes.ok) {
          throw new Error('Failed to fetch theatre');
        }
        const theatreData = await theatreRes.json();
        setTheatreName(theatreData.theatrename);
        // console.log(movieData.screen, movieData.theatre);

        // Fetch time slots after fetching both movie and theatre
        await fetchTimeSlots(movieData._id, movieData.screen, movieData.theatre);
      } catch (error) {
        console.error('Error fetching movie:', error);
      }
    };

    fetchMovie();
  }, [movieId]);

  const fetchTimeSlots = async (movieId, screenId, theatreId) => {
    try {
      setLoadingSlots(true); // Start loading
      const response = await fetch(API_URL+`/slotsQuery?movieId=${movieId}&theatreId=${theatreId}`);
      if (!response.ok) throw new Error('Failed to fetch time slots');
      const slotsData = await response.json();
      if (!Array.isArray(slotsData)) {
        throw new Error('Expected slotsData to be an array');
      }

      const slotsByDate = {};

      await Promise.all(slotsData && slotsData.map(async (slot) => {
        const date = slot.date.split('T')[0];
        if (!slotsByDate[date]) slotsByDate[date] = [];

        const screenResponse = await fetch(API_URL+`/screens/${slot.screen}`);
        if (!screenResponse.ok) throw new Error(`Failed to fetch screen data for screenId: ${slot.screen}`);
        const screenData = await screenResponse.json();

        slotsByDate[date].push({
          time: slot.time,
          screen: slot.screen,
          screenNo: screenData.screenNo,
          screenId:screenData._id
        });
      }));
      setTimeSlots(slotsByDate);

      if (Object.keys(slotsByDate).length > 0) {
        setSelectedDate(Object.keys(slotsByDate)[0]);
      }
    } catch (error) {
      console.error('Error fetching time slots or screens:', error);
    } finally {
      setLoadingSlots(false); // Reset loading after fetching is done
    }
  };

  if (!movie) return <div>Loading...</div>;

  const dates = Object.keys(timeSlots);
  const selectedTimeSlots = timeSlots[selectedDate] || []; // Select slots for the current date
  const isTheatreRoute = location.pathname.startsWith(`/${theatreName}`);

  return (
    <div className="movie-page">
      {!isTheatreRoute && navigate('/*')}
      <main className="main">
        <section className="movie-info">
          <h1>{movie.title}</h1>
          <p>UA • 2h 19m • {movie.genre} • {movie.language}</p>
          <div className="movie-banner">
            <img src={movie.imgSrc} alt={movie.title} />
          </div>
        </section>

        <section className="showtimes">
          <div className="date-selector">
            {dates && dates.map(date => (
              <button
                key={date}
                className={`date-button ${selectedDate === date ? 'selected' : ''}`}
                onClick={() =>setSelectedDate(date)}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>

          <div className="theater">
            <h2><PinIcon /> {props.theatre.toUpperCase()} Theatre @XYZ MOVIES</h2>

            {loadingSlots ? (
              <div>Loading slots...</div>
            ) : (
              <div className="time-slots">
                {selectedTimeSlots && selectedTimeSlots.length > 0 ? (
                  selectedTimeSlots.map(({ time, screenNo,screenId }, index) => (
                    <div key={`${time}-${screenId}-${index}`} className="screen-times">
                      <h3>Screen {screenNo || "N/A"}</h3>
                      <Link className="time-button" to={`/${props.theatre}/${movieId}/${screenId}/${time}+${selectedDate}`}>
                        {time}
                      </Link>
                    </div>
                  ))
                ) : (
                  <p>No showtimes available for the selected date.</p>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="cast">
          <h2>{movie.title} Movie Cast</h2>
          <div className="cast-list">
            {movie.cast && movie.cast.map(member => (
              <div key={member._id} className="cast-member">
                <img src={member.img} alt={member.name} />
                <p>{member.name}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default MoviePage;
